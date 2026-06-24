# Planeación — Tienda de Productos + Servicios (Aideens)

## 1. Visión General

Aideens es una estética canina en Guadalajara que ofrece **servicios de grooming** y ahora también **venta de productos para mascotas**. No hay pasarela de pagos: todo se cobra en **efectivo contra entrega** o al recoger en sucursal.

### Diferenciadores clave

| Diferenciador | Descripción |
|---------------|-------------|
| **Agente de IA** | Ya vive en el cotizador web y a futuro estará en WhatsApp, capaz de analizar fotos, cotizar servicios, recomendar productos y gestionar pedidos. |
| **Medicina alternativa y homeopática** | Línea exclusiva de productos homeopáticos y naturales para mascotas: desparasitantes, shampoos medicados, calmantes, fortificantes, etc. — un diferenciador frente a estéticas y pet shops convencionales. |

El agente de IA es capaz de:
- Analizar fotos y cotizar servicios de grooming.
- Recomendar productos según la raza, condición del pelaje y necesidades del perro.
- Gestionar pedidos (canasta, confirmación, recordatorio).

---

## 2. Arquitectura Propuesta

```
[Cliente Web / WhatsApp]
        │
        ▼
┌─────────────────────────────┐
│   Next.js (App Router)      │
│   • Server Components       │
│   • API Routes (REST)       │
│   • React Server Actions    │
└──────────┬──────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌─────────┐ ┌──────────┐
│ OpenAI  │ │ Supabase │
│ GPT-4o  │ │ (Postgres│
│ (Visión)│ │  + Storage│
└─────────┘ └─────┬────┘
                  │
           ┌──────┴──────┐
           │  Migrations  │
           │  + RLS       │
           └─────────────┘
```

### 2.1 Stack Actual (confirmado)

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Base de datos | Supabase (Postgres) |
| IA Visión | OpenAI GPT-4o (API `/api/quote`) |
| IA Texto | OpenAI GPT-4o (misma API) |
| Despliegue | Vercel (por el uso de Next.js) |

### 2.2 Stack Propuesto (nuevo)

| Componente | Decisión | Razón |
|-----------|----------|-------|
| **Catálogo de productos** | Supabase table `products` + `product_categories` | Ya tenemos Supabase, cero infra nueva |
| **Autenticación de clientes** | Supabase Auth (móvil: WhatsApp/Google OTP, web: email + magic link) | Los clientes necesitan cuenta para consultar historial de servicios, pedidos y chats |
| **Carrito de compras** | Estado local (React Context) + persistencia en localStorage | Ligero, sin depender de sesión activa para navegar |
| **Órdenes / Pedidos** | Supabase table `orders` + `order_items` ligada a `client_id` | Cada orden pertenece a un cliente autenticado |
| **Inventario** | Columna `stock` en `products` con decremento manual al confirmar pedido | Sin pagos ni gateways, control manual |
| **Dashboard admin** | Ruta protegida `/admin` con Supabase RLS + rol `admin` en tabla `clients` | Misma base de clientes, con distinción de rol |
| **Roles** | 3 niveles: `cliente` (autenticado), `admin` (dashboard), `visitante` (sin auth, solo lectura) | Los clientes ven su historial; los admins controlan todo |
| **WhatsApp AI Agent** | Misma API `/api/quote` + webhook de WhatsApp Business API / Twilio + sesión por número | Reutiliza el agente actual; el número de WhatsApp identifica al cliente |
| **Storage de imágenes** | Supabase Storage (bucket `products`, `gallery`, `client-dogs`) | Ya integrado, sin costo extra |

---

## 3. Modelo de Datos (Supabase)

### 3.1 Tablas Existentes (a migrar)

```sql
-- Ya creada — migrar:
-- 1. Agregar columna client_id uuid references clients(id)
-- 2. Poblar client_id al migrar datos existentes (crear clients a partir de whatsapp)
-- 3. Opcional: agregar dog_id uuid references dogs(id)
leads (id, dog_name, whatsapp, quote_json, total_mxn, source, created_at, contacted, client_id?)
```

### 3.2 Nuevas Tablas

```sql
-- Clientes (vinculada a auth.users de Supabase)
create table clients (
  id            uuid default gen_random_uuid() primary key,
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  name          text not null,
  phone         text,                               -- WhatsApp
  email         text,
  role          text default 'cliente'               -- cliente | admin
                  check (role in ('cliente', 'admin')),
  avatar_url    text,
  created_at    timestamptz default now(),
  last_seen     timestamptz
);

-- Perros del cliente
create table dogs (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid not null references clients(id) on delete cascade,
  name          text not null,
  breed         text,
  size          text check (size in ('chico','mediano','grande','xl')),
  birth_date    date,
  notes         text,                                -- alergias, condiciones, grooming preferences
  avatar_url    text,
  created_at    timestamptz default now()
);

-- Categorías de producto
create table product_categories (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- Productos
create table products (
  id            uuid default gen_random_uuid() primary key,
  category_id   uuid references product_categories(id),
  name          text not null,
  slug          text unique not null,
  description   text,
  price         integer not null,                -- en MXN, sin decimales
  compare_price integer,                         -- precio "antes" para mostrar descuento
  stock         integer default 0,
  unit          text default 'pieza',            -- pieza, litro, kg, ml, etc.
  image_urls    text[] default '{}',             -- hasta 5 fotos
  featured      boolean default false,
  active        boolean default true,
  tipo          text default 'convencional'       -- convencional | homeopatico | natural
                  check (tipo in ('convencional','homeopatico','natural')),
  ai_tags       text[] default '{}',             -- tags para matching con IA (ej: {pelo-largo, piel-sensible, ansiedad, parasitos})
  created_at    timestamptz default now()
);

-- Órdenes / Pedidos
create table orders (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid not null references clients(id),
  dog_id        uuid references dogs(id),             -- opcional: para qué perro es el pedido
  status        text default 'pendiente'              -- pendiente | confirmado | listo | entregado | cancelado
                  check (status in ('pendiente','confirmado','listo','entregado','cancelado')),
  source        text default 'web',                   -- web | whatsapp | presencial
  notes         text,
  total_items   integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Detalle de la orden
create table order_items (
  id            uuid default gen_random_uuid() primary key,
  order_id      uuid references orders(id) on delete cascade,
  product_id    uuid references products(id),
  product_name  text not null,                        -- snapshot del nombre al momento de la orden
  price         integer not null,                     -- snapshot del precio
  quantity      integer not null default 1,
  created_at    timestamptz default now()
);

-- Historial de servicios de grooming (por perro)
create table service_history (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid not null references clients(id),
  dog_id        uuid not null references dogs(id),
  service_type  text not null,                        -- baño | grooming | spa | etc
  quote_json    jsonb,                                -- snapshot de la cotización
  total_mxn     integer,
  groomer       text,
  notes         text,
  created_at    timestamptz default now()
);

-- Historial de interacciones con IA (por cliente)
create table ai_conversations (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid references clients(id),          -- puede ser null si no está autenticado
  session_id    text,
  channel       text default 'web',                   -- web | whatsapp
  messages      jsonb,
  metadata      jsonb,                                -- productos recomendados, servicios cotizados, dog_id
  created_at    timestamptz default now()
);
```

### 3.4 RLS (Row Level Security)

```sql
-- Clientes: cada quien ve su propio perfil; admins ven todo
alter table clients enable row level security;
create policy "Clientes ven su propio perfil"
  on clients for select
  using (auth.uid() = auth_user_id);
create policy "Admins ven todos los clientes"
  on clients for select
  using (exists (select 1 from clients where auth_user_id = auth.uid() and role = 'admin'));

-- Perros: el dueño ve sus perros; admins ven todos
alter table dogs enable row level security;
create policy "Dueño ve sus perros"
  on dogs for all
  using (client_id = (select id from clients where auth_user_id = auth.uid()));

-- Productos: lectura pública, escritura solo admin
alter table products enable row level security;
create policy "Productos visibles para todos"
  on products for select using (active = true);
create policy "Solo admin puede insertar/editar productos"
  on products for all
  using (exists (select 1 from clients where auth_user_id = auth.uid() and role = 'admin'));

-- Órdenes: el cliente ve sus órdenes; admins ven todas
alter table orders enable row level security;
create policy "Cliente ve sus órdenes"
  on orders for select
  using (client_id = (select id from clients where auth_user_id = auth.uid()));
create policy "Admin ve todas las órdenes"
  on orders for all
  using (exists (select 1 from clients where auth_user_id = auth.uid() and role = 'admin'));

-- service_history: el cliente ve su historial; admins ven todo
alter table service_history enable row level security;
create policy "Cliente ve su historial"
  on service_history for select
  using (client_id = (select id from clients where auth_user_id = auth.uid()));
create policy "Admin ve todo el historial"
  on service_history for all
  using (exists (select 1 from clients where auth_user_id = auth.uid() and role = 'admin'));

-- ai_conversations: el cliente ve sus chats
alter table ai_conversations enable row level security;
create policy "Cliente ve sus conversaciones"
  on ai_conversations for select
  using (client_id = (select id from clients where auth_user_id = auth.uid()));
create policy "Admin ve todas las conversaciones"
  on ai_conversations for all
  using (exists (select 1 from clients where auth_user_id = auth.uid() and role = 'admin'));
```

> **Nota:** La autenticación se maneja con Supabase Auth. Los clientes se registran con su WhatsApp (OTP) o email (magic link). Al registrarse se crea automáticamente su fila en `clients` mediante un trigger `on auth.users after insert`. Las API Routes usan el middleware de Supabase para validar sesión y el RLS se encarga de la autorización.

> Para el primer acceso desde WhatsApp, el número de teléfono identifica al cliente; si no existe en `clients`, se crea un perfil ligero y se le pide completar su registro en la web.

---

## 4. Experiencia de Usuario: Landing Page — Customer Journey

### 4.1 Mapa de Navegación

```
                          ┌─────────────────────────┐
                          │      LANDING PAGE       │
                          │  (conciente / informa)   │
                          └────────┬────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            ▼                      ▼                      ▼
   ┌────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │  QUIERO UN     │   │  QUIERO COMPRAR  │   │  QUIERO SABER   │
   │  SERVICIO      │   │  UN PRODUCTO     │   │  MÁS            │
   └───────┬────────┘   └────────┬─────────┘   └────────┬─────────┘
           ▼                     ▼                      ▼
   ┌──────────────┐    ┌──────────────────┐   ┌──────────────────┐
   │ /cotizar     │    │ /productos       │   │ #servicios       │
   │ (IA analiza  │    │ Catálogo         │   │ #galeria         │
   │  la foto)    │    │ con filtros      │   │ #testimonios     │
   └──────┬───────┘    └────────┬─────────┘   │ #faq             │
          │                     │              └──────────────────┘
          ▼                     ▼
   ┌──────────────┐    ┌──────────────────┐
   │ Cotización   │    │ /productos/[slug]│
   │ + productos  │    │ Detalle producto │
   │ sugeridos    │    │ + agregar carrito│
   └──────┬───────┘    └────────┬─────────┘
          │                     │
          └─────────┬───────────┘
                    ▼
          ┌──────────────────┐
          │ 🛒 Carrito       │
          │ (sidebar drawer) │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ 🔐 Login/Registro│
          │ (WhatsApp OTP)   │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ ✅ Checkout      │
          │ (select perro +  │
          │  método entrega) │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ 🎉 Confirmación  │
          │ (guardado en     │
          │  /mi-cuenta)     │
          └──────────────────┘
```

### 4.2 Navbar — Estado por Rol

La navbar se adapta según si el usuario está autenticado o no:

```
Visitante (no auth):
┌────────────────────────────────────────────────────────────┐
│  🐾 Aideens  [Servicios] [Productos] [Cotizar] [📦] │ 👤 │
└────────────────────────────────────────────────────────────┘

Cliente (autenticado):
┌────────────────────────────────────────────────────────────┐
│  🐾 Aideens  [Servicios] [Productos] [Cotizar] [📦]       │
│                                    [Mi Cuenta ▼] │ 👤 │
└────────────────────────────────────────────────────────────┘

Admin (autenticado como admin):
┌────────────────────────────────────────────────────────────┐
│  🐾 Aideens  [Servicios] [Productos] [Cotizar] [📦]       │
│                                    [Admin ▼] [Mi Cuenta]   │
└────────────────────────────────────────────────────────────┘
```

| Elemento | Visitante | Cliente | Admin |
|----------|-----------|---------|-------|
| 🐾 Logo | Link a `/` | Link a `/` | Link a `/` |
| Servicios | Ancla `/#servicios` | Ancla `/#servicios` | Ancla `/#servicios` |
| Productos | Link a `/productos` | Link a `/productos` | Link a `/productos` |
| Cotizar | Link a `/cotizar` | Link a `/cotizar` | Link a `/cotizar` |
| 📦 Carrito | Abre sidebar carrito | Abre sidebar carrito | Abre sidebar carrito |
| 👤 | Abre modal login | Link a `/mi-cuenta` | Link a `/admin` (dropdown) |
| Badge carrito | Cantidad en rojo | Cantidad en rojo | Cantidad en rojo |

### 4.3 Home Page — Recorrido Visual y Funcional

La home page está diseñada como un **embudo** que guía al visitante desde el asombro (antes/después) hasta la acción (comprar o agendar):

```
┌─────────────────────────────────────────────────────────────┐
│  SECCIÓN          PROPÓSITO                  LLAMADO       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. HERO           Impacto visual.          "Cotiza con     │
│     (antes/       El antes/después          una foto"       │
│      después)     vende el servicio.        "Ver servicios" │
│                                                             │
│  2. STATS         Prueba social.            ───             │
│     (+2400 perros,  Valida que el negocio                   │
│      98%, 5★)     es confiable.                             │
│                                                             │
│  3. SERVICIOS     Muestra los 3             "Cotizar con    │
│     (3 cards)     servicios principales.    foto" (en cada  │
│                   Precios y descripción.    card al hover)  │
│                                                             │
│  4. PROCESO       Explica el paso a         ───             │
│     (timeline)    paso del grooming.                        │
│                                                             │
│  5. PRODUCTOS     Carrusel de             "Ver catálogo"   │
│     DESTACADOS    productos más                            │
│                   vendidos.                                 │
│                                                             │
│  6. HOMEOPATÍA    Sección diferenciadora.  "Explorar        │
│     (carrusel)    Productos naturales/      línea natural"  │
│                   homeopáticos.                             │
│                                                             │
│  7. GALERÍA       Transformaciones         "Ver más en      │
│     (antes/      reales con slider.        Instagram"       │
│      después)                                               │
│                                                             │
│  8. TESTIMONIOS   Reseñas con nombre,      Google Reviews   │
│     (4 cards)     colonia y foto del perro. badge           │
│                                                             │
│  9. FAQ           Responder objeciones.    "Contáctanos"    │
│                   (ubicación, vacunas,     (ancla a         │
│                   razas, etc.)             booking)         │
│                                                             │
│  10. BOOKING      Formulario para          "Confirmar cita" │
│      (contacto)   agendar cita de          (si está logueado│
│                   grooming.                trae sus perros) │
│                                                             │
│  11. FOOTER       Dirección, teléfono,     "Agendar cita"   │
│                    horarios, enlaces.      Redes sociales   │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.1 Sección Productos Destacados (Nueva)

Entre "Proceso" y "Homeopatía" en la home:

```
┌─────────────────────────────────────────────────────────────┐
│  🛒 Productos Destacados                                    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🧴       │ │ 🌿       │ │ 🌱       │ │ 🧴       │      │
│  │ Shampoo  │ │ Despara- │ │ Fortifi- │ │ Cepillo  │      │
│  │ Orgánico │ │ sitante  │ │ cante    │ │ Profes.  │      │
│  │ $180     │ │ $220     │ │ $160     │ │ $280     │      │
│  │ [➕]     │ │ [➕]     │ │ [➕]     │ │ [➕]     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  [Ver catálogo completo →] (/productos)                     │
└─────────────────────────────────────────────────────────────┘
```

Cada card muestra:
- Imagen del producto
- Badge de tipo (🌿 Homeopático / 🌱 Natural / 🧴 Convencional)
- Nombre y precio
- Botón "➕" que agrega al carrito sin salir de la home
- Al hacer clic en la card → navega a `/productos/[slug]`

#### 4.3.2 Sección Homeopatía (Nueva — Diferenciador)

Entre "Productos Destacados" y "Galería":

```
┌─────────────────────────────────────────────────────────────┐
│  🌿 Medicina Alternativa para tu Peludo                     │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │                                                  │      │
│  │  Desparasitante Homeopático  │ $220              │      │
│  │  Sin químicos, efectivo     │ [➕]               │      │
│  │                                                  │      │
│  │  Gotas Óticas Naturales     │ $140               │      │
│  │  Para ácaros e infecciones  │ [➕]               │      │
│  │                                                  │      │
│  │  Fortificante Muda          │ $160               │      │
│  │  Estacional                 │ [➕]               │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  💡 "Lo natural también cura. Pregúntale a nuestro          │
│      groomer AI qué necesita tu peludo."                   │
│                                                             │
│  [Cotizar con foto →]  [Ver todo → /productos?tipo=homeopatico]│
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.3 Sección Booking con Autenticación (Actualizada)

Cuando el cliente ya inició sesión, el formulario de agendar cita muestra sus perros registrados:

```
Cliente autenticado:
┌──────────────────────────────────────────┐
│  Reserva tu cita                         │
│                                          │
│  👤 María García                         │
│                                          │
│  Selecciona el perro:                    │
│  [🐕 Lola - Poodle              ▼]      │
│  [🐕 Max - Golden Retriever     ▼]      │
│  [➕ Agregar otro perro]                 │
│                                          │
│  Servicio:                               │
│  [Baño & Secado  ▼]                     │
│                                          │
│  Fecha preferida: [📅]                   │
│                                          │
│  [Confirmar cita →]                      │
└──────────────────────────────────────────┘

Visitante (no auth):
┌──────────────────────────────────────────┐
│  Reserva tu cita                         │
│                                          │
│  Nombre del dueño:  [______________]     │
│  Nombre del perro:   [______________]    │
│  Raza:               [______________]    │
│  Servicio:           [___________ ▼]    │
│  Fecha preferida:    [📅]               │
│  WhatsApp:           [______________]    │
│                                          │
│  [Confirmar cita →]                      │
│  (al enviar se le pide registrarse       │
│   o se crea lead como hoy)               │
└──────────────────────────────────────────┘
```

### 4.4 /productos — Catálogo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  🐾 Aideens > Productos                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 [Buscar producto...                     ]               │
│                                                             │
│  Filtros:                                                    │
│  [Todos] [Convencional] [🌿 Homeopático] [🌱 Natural]      │
│                                                             │
│  Categorías:                                                 │
│  [Todas] [Shampoos] [Desparasitantes] [Fortificantes]       │
│  [Calmantes] [Cepillos] [Snacks] [Accesorios]               │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ 🌿   │ │ 🧴   │ │ 🧴   │ │ 🌱   │                      │
│  │ Desp.│ │Shamp.│ │Cepill│ │Calman│                      │
│  │ $220 │ │ $180 │ │ $280 │ │ $150 │                      │
│  │ [➕] │ │ [➕] │ │ [➕] │ │ [➕] │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ 🌿   │ │ 🧴   │ │ 🌱   │ │ 🧴   │                      │
│  │ Fort.│ │Snacks│ │ Gotas│ │Collar│                      │
│  │ $160 │ │ $90  │ │ $140 │ │ $220 │                      │
│  │ [➕] │ │ [➕] │ │ [➕] │ │ [➕] │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│  [< 1 2 3 ... >]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Comportamiento:**
- El filtro por tipo (homeopático/convencional/natural) persiste en la URL: `/productos?tipo=homeopatico`
- Al hacer clic en "➕" sin estar autenticado, se agrega al carrito igual (el carrito es local)
- Al llegar a checkout, si no hay sesión, se pide login
- Si hay pocos productos (< 20), se omite la paginación

### 4.5 /productos/[slug] — Detalle de Producto

```
┌─────────────────────────────────────────────────────────────┐
│  🐾 Aideens > Productos > Shampoo Orgánico                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐   ┌───────────────────────────┐   │
│  │  [Foto principal]   │   │  🌿 Homeopático           │   │
│  │                     │   │                           │   │
│  │  ○ ○ ○ ○ (thumbs)  │   │  Shampoo Orgánico para    │   │
│  └─────────────────────┘   │  Piel Sensible            │   │
│                             │                           │   │
│                             │  $180 MXN                 │   │
│                             │  <s>$250</s> -28%         │   │
│                             │                           │   │
│                             │  🟢 En existencia         │   │
│                             │                           │   │
│                             │  [−]  1  [+]             │   │
│                             │  [Agregar al pedido →]    │   │
│                             │                           │   │
│                             │  💳 Pago en efectivo      │   │
│                             │     contra entrega        │   │
│                             └───────────────────────────┘   │
│                                                             │
│  ── Descripción ──                                          │
│  Shampoo homeopático formulado con ingredientes             │
│  naturales...                                               │
│                                                             │
│  ── ¿Para qué sirve? ──                                    │
│  • Alivia dermatitis y piel irritada                        │
│  • Libre de químicos agresivos                              │
│  • Apto para cachorros y perros seniors                     │
│                                                             │
│  ── Modo de uso ──                                          │
│  Aplicar sobre el pelaje húmedo, masajear...                │
│                                                             │
│  ── ¿No sabes si es el adecuado? ──                        │
│  [🤖 Pregúntale al groomer AI →] (link a /cotizar)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 🛒 Carrito — Sidebar Drawer

Aparece desde la derecha, overlay oscuro atrás. Persiste en localStorage aunque el usuario cierre el navegador.

```
┌──────────────────────┐
│  Tu Pedido        ✕  │
│                      │
│  🧴 Shampoo Orgánico │
│  $180 x 2 = $360     │
│  [−] [2] [+]    ✕   │
│                      │
│  🌿 Desparasitante   │
│  $220 x 1 = $220     │
│  [−] [1] [+]    ✕   │
│                      │
│  ──────────────      │
│  Subtotal:    $580   │
│                      │
│  [Iniciar sesión y   │
│   confirmar pedido →]│
│                      │
│  💡 ¿Agregas un      │
│     servicio de      │
│     grooming?        │
│  [Cotizar con foto]  │
│                      │
│  🐾 Recoges en       │
│     Otilio Montaño   │
│     510-local 141,   │
│     Jardines de      │
│     Guadalupe        │
└──────────────────────┘
```

**Reglas del carrito:**
- Si el producto es homeopático, muestra un ícono 🌿 junto al nombre
- Si el stock es 0, muestra "Agotado" y no permite agregar
- Si ya está autenticado, el botón dice "Confirmar pedido →" y va directo a checkout
- Si no está autenticado, el botón dice "Iniciar sesión y confirmar pedido →" y abre el modal de auth

### 4.7 🔐 Login / Registro — Modal

Flujo de autenticación. Diseñado para ser lo más rápido posible (menos de 30 segundos):

```
Paso 1 — Ingresar WhatsApp:
┌────────────────────────────────────────┐
│  🐾 Inicia sesión o regístrate        │
│                                        │
│  Tu número de WhatsApp                 │
│  [📱 +52 33 1234 5678       ]         │
│                                        │
│  [Enviar código de verificación →]     │
│                                        │
│  ○ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ○    │
│                                        │
│  O continúa con:                       │
│  [📧 Magic link por email]             │
│  [🔵 Google]                           │
└────────────────────────────────────────┘

Paso 2 — Ingresar código OTP:
┌────────────────────────────────────────┐
│  🐾 Te enviamos un código             │
│                                        │
│  Ingresa el código de 6 dígitos        │
│  que enviamos al +52 33 1234 5678     │
│                                        │
│  [⬜][⬜][⬜][⬜][⬜][⬜]                │
│                                        │
│  [Verificar código →]                  │
│                                        │
│  ¿No recibiste? [Reenviar en 30s]     │
└────────────────────────────────────────┘

Al autenticarse por primera vez:
┌────────────────────────────────────────┐
│  🎉 ¡Bienvenido, María!               │
│                                        │
│  Para empezar, registra a tu perro:    │
│                                        │
│  Nombre: [___________]                 │
│  Raza:   [___________]                 │
│  Tamaño: [Chico ▼]                    │
│                                        │
│  [Guardar y continuar →]               │
│  [Omitir, lo haré después]             │
└────────────────────────────────────────┘
```

**Puntos clave:**
- WhatsApp OTP es el método principal (el cliente ya tiene WhatsApp, es natural)
- Al primer login se pide registrar al perro (opcional, se puede saltar)
- El perro registrado se asocia automáticamente a futuras cotizaciones y pedidos
- Si el número ya existe en `clients`, se salta el paso de registro de perro

### 4.8 ✅ Checkout — Confirmar Pedido

```
┌──────────────────────────────────────────────┐
│  🐾 Confirmar Pedido                         │
│                                              │
│  👤 María García  ───  [Cerrar sesión]       │
│  📞 +52 33 1234 5678                         │
│                                              │
│  ── Productos ──                             │
│  │ Shampoo Orgánico    x2    $360 │          │
│  │ Desparasitante      x1    $220 │          │
│  │ Total                    $580 │          │
│                                              │
│  ── ¿Para qué perro? ──                     │
│  [🐕 Lola (Poodle)                  ▼]      │
│  [➕ Agregar otro perro]                     │
│                                              │
│  ── Nota (opcional) ──                      │
│  [____________________________]              │
│                                              │
│  ── Método de entrega ──                    │
│  ○ 🏠 Recoger en sucursal                   │
│     (Otilio Montaño 510, Jardines de        │
│      Guadalupe — sin costo)                 │
│  ○ 📦 Envío a domicilio                     │
│     (Zona GDL/Zapopan/Tlaquepaque — $50)    │
│                                              │
│  💰 Pago: Efectivo contra entrega           │
│                                              │
│  [✅ Confirmar pedido →]                     │
└──────────────────────────────────────────────┘
```

### 4.9 🎉 Post-Confirmación

```
┌──────────────────────────────────────────────┐
│  🎉 ¡Pedido confirmado!                       │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │  🐾                                  │    │
│  │                                      │    │
│  │  Pedido #AID-0042                    │    │
│  │                                      │    │
│  │  📅 Recogida: Mañana 2:00 PM        │    │
│  │  📍 Otilio Montaño 510-local 141    │    │
│  │     Jardines de Guadalupe            │    │
│  │  💰 Total: $580 MXN (efectivo)       │    │
│  │                                      │    │
│  │  Te esperamos 🐶                     │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  [Ver en Mis Pedidos →]  [Seguir comprando]  │
│                                              │
│  💡 Mientras esperas, ¿quieres agendar       │
│     un grooming para Lola?                   │
│  [Agendar cita →]                            │
└──────────────────────────────────────────────┘
```

**Acciones post-confirmación:**
- Se guarda en Supabase: `orders` + `order_items` vinculado a `client_id` y `dog_id`
- Se envía notificación al WhatsApp del negocio
- El cliente puede ver el pedido en `/mi-cuenta/pedidos`
- Cross-sell: se sugiere agendar un servicio de grooming para completar la experiencia

### 4.10 👤 Mi Cuenta — Panel del Cliente

```
┌──────────────────────────────────────────────┐
│  🐾 Mi Cuenta                     👤 María   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ 🐕 Perros│ │ 📦 Pedid.│ │ ✂️ Historial │ │
│  │    2     │ │    3     │ │      5       │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────────────────┐ ┌────────────────┐ │
│  │ 💬 Chats con IA      │ │ ⚙️ Configuración│ │
│  │        2             │ │                │ │
│  └──────────────────────┘ └────────────────┘ │
│                                              │
│  ── Mis Perros ──                            │
│  ┌──────────────────────────────────────┐    │
│  │ 🐕 Lola       ── Poodle             │    │
│  │   Último servicio: Grooming 12/06   │    │
│  │   [Historial →] [Agendar cita →]    │    │
│  ├──────────────────────────────────────┤    │
│  │ 🐕 Max        ── Golden Retriever   │    │
│  │   Último servicio: Baño 28/05       │    │
│  │   [Historial →] [Agendar cita →]    │    │
│  └──────────────────────────────────────┘    │
│  [➕ Registrar otro perro]                    │
│                                              │
│  ── Último Pedido ──                        │
│  │ #AID-0042 │ $580 │ Pendiente │ 📅 │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ── Próximo Servicio Agendado ──            │
│  │ Lola — Grooming Completo                │
│  │ Sábado 28 Jun, 11:00 AM             │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

#### 4.10.1 Perfil del Perro (/mi-cuenta/perros/[id])

```
┌──────────────────────────────────────────────┐
│  🐾 Mi Cuenta > Lola                         │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐                            │
│  │  [Foto Lola] │  Lola                      │
│  │              │  Poodle - Mediano          │
│  └──────────────┘  🎂 3 años                 │
│                                              │
│  Notas: Alergia al pollo, pelo rizado        │
│  que requiere cepillado diario.              │
│  [Editar →]                                  │
│                                              │
│  ── Historial de Servicios ──               │
│  │ 12/06/2026 │ Grooming Completo │ $550 │  │
│  │ 28/05/2026 │ Baño & Secado    │ $350 │  │
│  │ 10/05/2026 │ Spa Premium      │ $500 │  │
│  └──────────────────────────────────────┘    │
│                                              │
│  ── Pedidos para Lola ──                    │
│  │ #AID-0042 │ Shampoo + Fortificante │     │
│  │              Pendiente                  │ │
│  └──────────────────────────────────────┘    │
│                                              │
│  [Agendar cita →]                            │
└──────────────────────────────────────────────┘
```

#### 4.10.2 Historial de Chats con IA (/mi-cuenta/chats)

```
┌──────────────────────────────────────────────┐
│  🐾 Mi Cuenta > Chats con IA                │
├──────────────────────────────────────────────┤
│                                              │
│  Conversaciones anteriores:                  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 12/06/2026 │ Lola                   │    │
│  │ "Analicé a Lola y recomiendo..."    │    │
│  │ Grooming + Shampoo recomendado      │    │
│  │ [Ver conversación →]                │    │
│  ├──────────────────────────────────────┤    │
│  │ 28/05/2026 │ Max                    │    │
│  │ "Max tiene el pelaje denso..."     │    │
│  │ Baño + Cepillo recomendado          │    │
│  │ [Ver conversación →]                │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  [🤖 Nueva cotización →] (/cotizar)         │
└──────────────────────────────────────────────┘
```

### 4.11 Flujo del Agente IA en /cotizar (con productos)

El flujo actual se extiende para incluir recomendaciones de productos:

```
Paso 1 → Usuario sube foto
Paso 2 → IA analiza: raza, tamaño, condición del pelaje
Paso 3 → IA genera:
          ├── JSON de cotización (servicios)
          ├── JSON de productos sugeridos (convencionales + homeopáticos)
          └── Mensaje conversacional

Paso 4 → Se muestra en pantalla:
          ┌────────────────────────────────────┐
          │  ✂️ Cotización de Servicios        │
          │  Baño & Secado     $180            │
          │  Corte de raza     $250            │
          │  Total            $430             │
          └────────────────────────────────────┘
          ┌────────────────────────────────────┐
          │  🛒 Productos Sugeridos            │
          │                                    │
          │  🧴 Shampoo para pelo denso $180  │
          │     [Agregar al pedido →]          │
          │                                    │
          │  🌿 Desparasitante homeopático    │
          │     $220 [Agregar al pedido →]    │
          │                                    │
          │  💡 "Noto que Lola se rasca mucho.│
          │      El desparasitante homeopático │
          │      es ideal como prevención."    │
          └────────────────────────────────────┘

Paso 5 → Pregunta por nudos (como hoy)
Paso 6 → Cotización final + productos ajustados
Paso 7 → Si el usuario está autenticado:
          ── Se guarda en service_history
          ── Se guarda en ai_conversations (vinculado a client_id y dog_id)
          ── Se sugiere agregar productos al carrito

          Si NO está autenticado:
          ── Se guarda como lead (como hoy)
          ── Al final se le pide registrarse para guardar su cotización
```

### 4.12 Notificaciones y Recordatorios

Sin push notifications (sin PWA ni app), los recordatorios se manejan vía WhatsApp:

| Disparador | Mensaje | Canal |
|-----------|---------|-------|
| Pedido confirmado | "🐾 Hola María, tu pedido #AID-0042 está confirmado. Recógelo en Otilio Montaño 510 mañana después de las 2 PM." | WhatsApp del negocio (manual) |
| Recordatorio de cita | "🐾 Recordatorio: Lola tiene cita mañana a las 11 AM en Otilio Montaño 510." | WhatsApp del negocio (manual) |
| Pedido listo | "🐾 ¡Tu pedido ya está listo! Te esperamos en sucursal." | WhatsApp del negocio (manual) |
| Post-servicio | "🐾 ¿Cómo quedó Lola después de su grooming? ¿Nos recomiendas?" | WhatsApp del negocio (manual) |

> **Futuro:** Integrar Twilio o WhatsApp Business API para automatizar estos mensajes.

### 4.13 Flujo Completo: Customer Journey Map

```
DESCUBRIMIENTO                    CONSIDERACIÓN                  CONVERSIÓN                   RETENCIÓN
─────────────────                ─────────────                  ──────────                   ─────────

Llega por Google   →  Navega home:          →  Agrega al carrito  →  Recibe notificación   →  Vuelve a comprar
/ Instagram /       →  Hero + Stats         →  desde home o         de pedido listo          (productos o
WhatsApp            →  galería              →  /productos            por WhatsApp            servicios)
                    →  FAQ                                          (manual)
                                 ↓                                   ↓                         ↓
                    →  O usa /cotizar:     →  Se autentica        →  Recoge en            →  Ve historial
                       sube foto            →  con WhatsApp OTP      sucursal /              en /mi-cuenta
                       recibe cotización    →  (si es primera vez    recibe en casa
                       + productos             registra su perro)
                       sugeridos                                    ↓                         ↓
                                          →  Confirma pedido     →  Recibe encuesta      →  Recomienda
                                                                    post-servicio           en WhatsApp
                                                                                            a amigos
```

### 4.14 Diseño Mobile First

Todas las pantallas priorizan mobile:

| Componente | Comportamiento en mobile |
|-----------|-------------------------|
| **Navbar** | Menú hamburguesa. Íconos sin texto. Carrito visible siempre. |
| **Home** | Una sola columna. Carruseles táctiles. Productos en lista vertical. |
| **Productos** | Grid de 2 columnas. Filtros en acordeón colapsable. |
| **Carrito** | Drawer ocupa 85% del ancho. |
| **Checkout** | Una sola columna. Inputs grandes. Teclado numérico para teléfono. |
| **Mi Cuenta** | Tabs horizontales scrolleables. Cards apiladas. |
| **Admin** | Diseño responsivo pero optimizado para desktop. En mobile: vista de solo lectura. |

## 5. El Agente de IA — Hoy y Mañana

### 5.1 Estado Actual

- **Canal:** Web (`/cotizar`)
- **Modelo:** GPT-4o con visión
- **Capacidades:** Analiza foto del perro, detecta raza/tamaño/condición, cotiza servicios, ajusta por nudos.
- **Flujo:** Foto → Análisis → Cotización → Pregunta nudos → Cotización final → Captura lead

### 5.2 Próxima Evolución (con productos + homeopatía)

El agente debe ser capaz de **recomendar productos** basado en el análisis, distinguiendo entre línea convencional y homeopática:

```
Usuario: [sube foto]
IA: "Veo que tu perro es un Golden Retriever con pelaje 
     denso y en temporada de muda. Además noto que se rasca 
     la oreja derecha — podría tener ácaros. Te recomiendo:
     
     🛒 Productos sugeridos:
     • Cepillo deslanador Furminator           - $450
     • Shampoo para pelo denso                 - $180
     
     🌿 Línea homeopática (recomendado):
     • Desparasitante homeopático (sin químico) - $220
     • Fortificante para muda estacional        - $160
     • Gotas óticas naturales para ácaros       - $140
     
     ¿Los agregamos a tu pedido?"
```

**Cómo funciona:**
1. El sistema prompt del API `/api/quote` se extiende con un catálogo de productos (name, price, tags, description, tipo).
2. GPT-4o analiza la foto + el contexto y decide qué productos son relevantes, priorizando la línea homeopática cuando es adecuada para el caso (piel sensible, alergias, parásitos, ansiedad).
3. La respuesta incluye un JSON opcional `product_suggestions: [{id, name, price, tipo}]`.
4. El frontend separa visualmente las sugerencias: sección 🛒 Convencional y sección 🌿 Homeopática/Natural.

### 5.3 Futuro: WhatsApp Agent

```
[WhatsApp] ←→ [Twilio Webhook] ←→ [API Route /api/whatsapp] ←→ [GPT-4o] ←→ [Supabase]
```

- El webhook de Twilio recibe el mensaje (texto o imagen).
- Llama a la misma lógica de `/api/quote` (refactorizada como función compartida).
- Responde vía Twilio.
- Reutiliza el catálogo de productos, la lógica de cotización y el flujo de leads.

### 5.4 Arquitectura del Agente (refactorizada)

```
lib/agent/
├── index.ts              # Orquestador: decide qué acción tomar
├── catalog.ts            # Catálogo de servicios + productos (source of truth)
├── prompts.ts            # System prompts para cada contexto
├── providers/
│   ├── openai.ts         # Llamada a GPT-4o
│   └── anthropic.ts      # (futuro) Claude como respaldo
├── parsers/
│   ├── quote-parser.ts   # Extrae JSON de cotización (ya existe)
│   └── product-parser.ts # Extrae JSON de sugerencias de productos
└── tools/
    ├── analyze-photo.ts  # Lógica de análisis con visión
    ├── recommend-products.ts  # Matching producto ↔ análisis
    └── create-order.ts   # Crear orden desde conversación
```

Esto permite que **cualquier canal** (web, WhatsApp,将来的) use la misma lógica:

```
app/api/
├── quote/route.ts        # Web — llama a lib/agent
├── leads/route.ts        # Web — guarda lead (ya existe)
├── whatsapp/route.ts     # (futuro) Twilio webhook
├── products/route.ts     # CRUD productos
├── orders/route.ts       # CRUD órdenes
└── admin/route.ts        # Endpoints protegidos para dashboard
```

---

## 6. Roles y Permisos

| Rol | Acceso | ¿Autenticación? |
|-----|--------|----------------|
| **Visitante** | Home, Servicios, Productos (solo lectura), Cotizar | No necesita |
| **Cliente** | Todo lo anterior + historial de servicios por perro, pedidos anteriores, chats con IA, perfil con sus perros | Supabase Auth (WhatsApp OTP o email magic link) |
| **Admin** | Dashboard completo: ver/editar productos, gestionar pedidos, leads, inventario, configuración, logs de IA, ver clientes | Supabase Auth + rol `admin` en tabla `clients` |

**Flujo de registro:**
1. El cliente llega a la web y navega sin autenticarse.
2. Al querer **confirmar un pedido** o **guardar una cotización**, se le pide registrarse (o iniciar sesión).
3. Registro: ingresa WhatsApp → recibe OTP → se crea su perfil en `clients` automáticamente → continúa el flujo.
4. A partir de ahí, el cliente puede ver su historial completo en `/mi-cuenta`.

**¿Por qué Supabase Auth y no Clerk?**
- Ya tenemos Supabase en el proyecto — cero dependencias nuevas.
- Supabase Auth soporta OTP por SMS/WhatsApp, magic links, Google, Apple.
- El RLS se integra directamente con `auth.uid()`.
- El costo es cero en el plan gratuito de Supabase.

---

## 7. API Endpoints Propuestos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos activos (filtro: ?category, ?tipo, ?featured, ?search) |
| GET | `/api/products/[slug]` | Detalle de producto |
| POST | `/api/products` | Crear producto (admin) |
| PATCH | `/api/products/[id]` | Editar producto (admin) |
| DELETE | `/api/products/[id]` | Desactivar producto (admin) |
| POST | `/api/orders` | Crear orden (carrito → base de datos) |
| GET | `/api/orders` | Listar órdenes (admin) |
| PATCH | `/api/orders/[id]` | Actualizar estado (admin) |
| GET | `/api/leads` | Listar leads (admin) |
| PATCH | `/api/leads/[id]` | Marcar lead como contactado (admin) |
| GET | `/api/admin/stats` | Métricas del dashboard (admin) |
| POST | `/api/quote` | Ya existe — extender con sugerencias de productos |

---

## 8. Frontend: Nuevas Páginas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/productos` | `ProductsPage` | Grid del catálogo completo con filtros por categoría y tipo (convencional / homeopático / natural) |
| `/productos/[slug]` | `ProductDetailPage` | Fotos, badge de tipo, descripción, precio, botón agregar |
| `/carrito` | `CartPage` (o sidebar) | Resumen del pedido antes de autenticarse |
| `/login` | `AuthPage` | Login/registro con WhatsApp OTP, email magic link o Google |
| `/mi-cuenta` | `AccountPage` | Panel del cliente: perros, historial, pedidos, chats |
| `/mi-cuenta/perros` | `AccountDogs` | CRUD de perros del cliente |
| `/mi-cuenta/perros/[id]` | `AccountDogDetail` | Historial de servicios y pedidos por perro |
| `/mi-cuenta/pedidos` | `AccountOrders` | Historial de pedidos del cliente |
| `/mi-cuenta/pedidos/[id]` | `AccountOrderDetail` | Detalle de un pedido |
| `/mi-cuenta/historial` | `AccountServices` | Historial de servicios de grooming |
| `/mi-cuenta/chats` | `AccountChats` | Conversaciones previas con la IA |
| `/admin` | `AdminDashboard` | Panel protegido con métricas, pedidos recientes, leads nuevos, stock bajo, clientes nuevos |
| `/admin/productos` | `AdminProducts` | CRUD de productos con campo `tipo` y subida de fotos |
| `/admin/productos/nuevo` | `AdminProductForm` | Formulario para crear producto |
| `/admin/productos/[id]` | `AdminProductForm` | Editar producto existente |
| `/admin/pedidos` | `AdminOrders` | Lista de órdenes con cambio de estado y acción rápida de WhatsApp |
| `/admin/pedidos/[id]` | `AdminOrderDetail` | Detalle de orden con items y datos del cliente |
| `/admin/clientes` | `AdminClients` | Lista de clientes registrados |
| `/admin/clientes/[id]` | `AdminClientDetail` | Perfil del cliente: datos, perros, historial de servicios y pedidos |
| `/admin/leads` | `AdminLeads` | Leads capturados desde cotizador |
| `/admin/servicios` | `AdminServices` | Historial global de servicios |
| `/admin/ia-logs` | `AdminIALogs` | Conversaciones de IA por cliente |
| `/admin/config` | `AdminConfig` | Configuración: precios de servicios, horarios, datos del negocio |

### 8.1 Componentes Compartidos (Nuevos)

```
components/
├── product-card.tsx           # Card reusable (home, catálogo, sugerencias IA)
├── product-gallery.tsx        # Galería de imágenes del producto
├── product-badge.tsx          # Badge tipo (🌿 Homeopático / 🌱 Natural / 🧴 Convencional)
├── cart-sidebar.tsx           # Drawer del carrito
├── cart-context.tsx           # Context provider del carrito (localStorage)
├── add-to-cart-button.tsx     # Botón con animación de agregar
├── auth-modal.tsx             # Modal de login/registro (WhatsApp OTP + magic link)
├── protected-route.tsx        # Wrapper para rutas que requieren autenticación
├── order-form.tsx             # Formulario de checkout (autenticado, con selector de perro)
├── account-layout.tsx         # Layout del panel "Mi Cuenta"
├── admin-layout.tsx           # Layout protegido del admin
├── admin/
│   ├── stats-cards.tsx        # Cards de métricas (pedidos, leads, ingresos, clientes)
│   ├── orders-table.tsx       # Tabla de órdenes con cambio de estado
│   ├── products-table.tsx     # Tabla de productos con CRUD inline
│   ├── product-form.tsx       # Formulario crear/editar producto
│   ├── clients-table.tsx      # Tabla de clientes con datos y acción rápida
│   ├── leads-table.tsx        # Tabla de leads
│   ├── services-table.tsx     # Historial de servicios
│   └── config-form.tsx        # Editor de configuración
└── home/
    ├── products-showcase.tsx  # Sección de productos destacados en home
    └── homeopathy-section.tsx # Sección "Medicina Alternativa" en home
```

---

## 9. Roadmap de Implementación

### Fase 1 — Base de Datos, Auth y Catálogo (5-7 días)
1. Crear migraciones de Supabase: `clients`, `dogs`, `product_categories`, `products`, `orders`, `order_items`, `service_history`, `ai_conversations`.
2. Configurar Supabase Auth (WhatsApp OTP, email magic link, Google).
3. Trigger `on auth.users after insert` para crear fila en `clients`.
4. API routes CRUD para productos.
5. Página `/productos` y `/productos/[slug]`.
6. Componente `AddToCartButton` + `CartContext` + carrito persistente.

### Fase 2 — Autenticación y Checkout (3-4 días)
1. Modal/ruta de login con WhatsApp OTP.
2. Protección de rutas con `protected-route.tsx`.
3. API route para crear órdenes (`POST /api/orders`) vinculadas al `client_id`.
4. Formulario de checkout con selector de perros.
5. Pantalla de confirmación con número de pedido.
6. Panel "Mi Cuenta" con perros, pedidos e historial.

### Fase 3 — IA + Productos + Homeopatía (4-5 días)
1. Refactorizar `lib/agent/` con estructura modular.
2. Extender system prompt con catálogo de productos (incluyendo `tipo: homeopatico` y `ai_tags`).
3. Implementar `product-parser.ts` para extraer sugerencias del JSON de IA.
4. Mostrar productos sugeridos en el flujo de cotización, separados por tipo.
5. Entrenar al agente para priorizar recomendación homeopática según señales del análisis.
6. Guardar conversaciones de IA en `ai_conversations` vinculadas al `client_id` (si está autenticado).

### Fase 4 — Admin Dashboard Completo (4-5 días)
1. Dashboard con métricas (pedidos, leads, ingresos, clientes nuevos, stock bajo).
2. CRUD de productos con campo `tipo`.
3. Gestión de pedidos con datos del cliente.
4. Vista de clientes con perros, historial y total gastado.
5. Historial global de servicios.
6. Leads y logs de IA.
7. Editor de configuración.

### Fase 5 — WhatsApp AI Agent (futuro, 5-7 días)
1. Configurar Twilio o WhatsApp Business API.
2. Crear webhook (`/api/whatsapp`) que orquesta con `lib/agent`.
3. Manejo de sesiones (mantener contexto por chat).
4. Pruebas con números reales.

---

## 10. Línea Homeopática y Natural — Catálogo Base

### 10.1 Categorías de Producto

| Categoría | Ejemplos | Tipo |
|-----------|----------|------|
| **Desparasitantes** | Desparasitante homeopático oral, pipetas naturales, jarabe antiparasitario de amplio espectro | homeopático |
| **Shampoos medicados** | Shampoo homeopático para dermatitis, shampoo natural para piel sensible, shampoo antipulgas orgánico | homeopático / natural |
| **Fortificantes y vitaminas** | Fortificante para muda estacional, complejo B líquido, hierro natural para anemia | homeopático / natural |
| **Calmantes y ansiedad** | Gotas de flor de Bach, valeriana natural, spray feromonal calmante, mordedores ansiolíticos | natural |
| **Cuidado ótico y dental** | Gotas óticas homeopáticas para ácaros, gel dental natural, enjuague bucal orgánico | homeopático / natural |
| **Cicatrizantes y piel** | Crema homeopática para raspones, gel de árnica, bálsamo para almohadillas | homeopático / natural |
| **Convencional** | Shampoos profesionales, cepillos, correas, juguetes, snacks | convencional |

### 10.2 Estrategia de la IA para Homeopatía

El agente prioriza recomendaciones homeopáticas cuando detecta:

| Señal en el análisis | Recomendación homeopática |
|---------------------|--------------------------|
| Piel roja, irritada, alergias | Shampoo homeopático para dermatitis + crema de árnica |
| Rascado excesivo en orejas | Gotas óticas homeopáticas + desparasitante natural |
| Muda excesiva o pelaje opaco | Fortificante para muda + complejo B |
| Perro nervioso/tembloroso en la estética | Gotas de flor de Bach + spray feromonal |
| Mal aliento o sarro | Gel dental natural + enjuague orgánico |
| Prevención general | Desparasitante homeopático + fortificante estacional |

### 10.3 Presentación en Tienda

Cada producto homeopático/natural lleva un badge distintivo:
- 🌿 **Homeopático** — fondo verde suave, texto "Homeopático"
- 🌱 **Natural** — fondo verde claro, texto "Natural"
- 🧴 **Convencional** — sin badge especial

En el grid del catálogo hay un filtro rápido: `[Todos] [Convencional] [Homeopático] [Natural]`.

En la home hay una sección dedicada **"🌿 Medicina Alternativa para tu Peludo"** justo después de los productos destacados.

---

## 11. Consideraciones de UX

| Principio | Aplicación |
|-----------|-----------|
| **Sin fricción** | No pedir registro, no pedir tarjeta. Solo nombre y WhatsApp. |
| **IA como aliada** | El agente no solo cotiza, también educa: "Este cepillo es ideal para su tipo de pelaje porque..." |
| **Continuidad web → WhatsApp** | El carrito se puede compartir por WhatsApp. El agente retoma el contexto. |
| **Mobile first** | El 80% del tráfico será desde celular. El checkout es una sola columna, con teclado numérico para WhatsApp. |
| **Feedback visual** | Agregar al carrito con micro-animación (contador, badge, sonido opcional). |

---

## 12. Preguntas Abiertas para Decidir

1. **Entrega a domicilio:** ¿Se hará? ¿Con qué radio (Zapopan, GDL centro, Tlaquepaque)? ¿Costo extra?
2. **Mínimo de compra:** ¿Hay monto mínimo para pedido? ¿$100? ¿$200?
3. **Horarios de entrega:** ¿Mismos que la sucursal (Lun-Sáb 9-19)?
4. **Fotos de productos:** ¿Quién las toma? ¿Se usarán las de proveedores o fotos reales del local?
5. **Dashboard admin:** ¿Prefieres UI tipo tabla (simple) o algo más visual (cards, gráficas)?
6. **AI en WhatsApp:** ¿Tienes ya número de WhatsApp Business o Twilio account?

---

## 13. Resumen Arquitectónico

```
                    ┌──────────────────────────────────┐
                    │        Next.js (Vercel)           │
                    │                                  │
                    │  /productos  ←→  CartContext     │
                    │  /cotizar    ←→  Agent AI        │
                    │  /admin      ←→  API Key Auth    │
                    │                                  │
                    │  API Routes:                     │
                    │  /api/quote                       │
                    │  /api/products                    │
                    │  /api/orders                      │
                    │  /api/leads                       │
                    │  /api/admin/*                     │
                    │  /api/whatsapp (futuro)           │
                    └──────────┬───────────────────────┘
                               │
                    ┌──────────▼───────────────────────┐
                    │        Supabase (Postgres)        │
                    │                                  │
                    │  leads                           │
                    │  products + product_categories   │
                    │  orders + order_items            │
                    │  ai_conversations                │
                    │  Storage: (product images)       │
                    └──────────┬───────────────────────┘
                               │
                    ┌──────────▼───────────────────────┐
                    │        OpenAI GPT-4o             │
                    │  • Análisis de imagen            │
                    │  • Cotización de servicios       │
                    │  • Recomendación de productos    │
                    │    (convencional + homeopático)  │
                    │  • Conversación contextual       │
                    └──────────────────────────────────┘
```
