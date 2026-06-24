-- ============================================================
-- Seed: Categorías y productos
-- ============================================================

-- Crear el bucket de Storage para imágenes de productos (si no existe)
-- NOTA: Esto solo funciona desde la CLI de Supabase o el dashboard.
-- Si no existe, créalo manualmente en Storage → New bucket → "product-images" → Public

-- ============================================================
-- CATEGORÍAS
-- ============================================================
insert into public.product_categories (name, slug, description, sort_order) values
  ('Alimentación', 'alimentacion', 'Croquetas, comida húmeda y snacks', 1),
  ('Cuidado e Higiene', 'cuidado-higiene', 'Shampoos, cepillos, cortaúñas y más', 2),
  ('Accesorios', 'accesorios', 'Collares, correas, camas y juguetes', 3),
  ('Homeopatía y Naturales', 'homeopatia-naturales', 'Suplementos, aceites y remedios naturales', 4),
  ('Ropa y Vestimenta', 'ropa', 'Suéteres, impermeables y disfraces', 5)
on conflict (slug) do nothing;

-- ============================================================
-- PRODUCTOS
-- ============================================================

-- Alimentación
insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Croquetas Premier Perro Adulto Sabor Pollo 8 kg', 'croquetas-premier-adulto-pollo-8kg', 'Alimento balanceado premium para perros adultos. Elaborado con pollo real, sin subproductos ni colorantes artificiales.', 549, 15, 'pieza', true, 'convencional', '{alimento,premier,adulto,pollo}'
from public.product_categories where slug = 'alimentacion';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Croquetas Premier Perro Cachorro Sabor Pollo 8 kg', 'croquetas-premier-cachorro-pollo-8kg', 'Alimento premium para cachorros de hasta 12 meses. Alto contenido de proteína y DHA para desarrollo cognitivo.', 599, 10, 'pieza', true, 'convencional', '{alimento,premier,cachorro,pollo}'
from public.product_categories where slug = 'alimentacion';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Snacks Naturales Hígado Deshidratado 100 g', 'snacks-higado-deshidratado-100g', 'Premios 100% naturales sin conservadores ni selladores artificiales.', 89, 25, 'pieza', false, 'natural', '{snack,natural,premio}'
from public.product_categories where slug = 'alimentacion';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Comida Húmeda NutriSource Sobre 100 g', 'comida-humeda-nutrisource-100g', 'Alimento húmedo en sobre con pollo y vegetales. Ideal para perros exigentes.', 35, 40, 'pieza', false, 'convencional', '{humedo,pollo,sobre}'
from public.product_categories where slug = 'alimentacion';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Croquetas Pro Plan Adulto Razas Pequeñas 3 kg', 'croquetas-pro-plan-pequenas-3kg', 'Pro Plan con OptiHealth para razas pequeñas. Contiene aceite de pescado natural para piel y pelaje saludables.', 389, 12, 'pieza', false, 'convencional', '{proplan,raza pequeña,adulto}'
from public.product_categories where slug = 'alimentacion';

-- Cuidado e Higiene
insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Shampoo Suave para Perros Avena y Manzanilla 500 ml', 'shampoo-avena-manzanilla-500ml', 'Shampoo suave con avena coloidal y extracto de manzanilla. Ideal para pieles sensibles.', 169, 20, 'pieza', true, 'convencional', '{shampoo,cuidado,piel sensible}'
from public.product_categories where slug = 'cuidado-higiene';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Shampoo Medicado Antipulgas y Garrapatas 250 ml', 'shampoo-antipulgas-250ml', 'Shampoo con fórmula insecticida suave que elimina pulgas y garrapatas. Efectivo por hasta 7 días.', 199, 15, 'pieza', false, 'convencional', '{shampoo,antipulgas,medicado}'
from public.product_categories where slug = 'cuidado-higiene';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Cepillo Slicker Profesional Mango Ergonómico', 'cepillo-slicker-profesional', 'Cepillo tipo slicker con cerdas de acero inoxidable. Ideal para desenredar y eliminar pelo muerto.', 149, 18, 'pieza', true, 'convencional', '{cepillo,desenredo,cuidado}'
from public.product_categories where slug = 'cuidado-higiene';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Cortaúñas Guillotina Profesional Talla Mediana', 'cortaunias-guillotina-mediana', 'Cortaúñas tipo guillotina con mango antideslizante. Incluye lima integrada.', 129, 22, 'pieza', false, 'convencional', '{cortaúñas,guillotina,higiene}'
from public.product_categories where slug = 'cuidado-higiene';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Toallitas Húmedas para Perros 60 piezas', 'toallitas-humedas-60pz', 'Toallitas hipoalergénicas con aloe vera. Perfectas para limpiar patitas y cuerpo entre baños.', 79, 35, 'pieza', false, 'natural', '{toallitas,higiene,aloe}'
from public.product_categories where slug = 'cuidado-higiene';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Cepillo Dental Sabor Pollo 100 ml', 'cepillo-dental-pollo-100ml', 'Pasta dental enzimática sabor pollo. Ayuda a prevenir sarro y mal aliento.', 119, 12, 'pieza', false, 'convencional', '{dental,pasta,sarro}'
from public.product_categories where slug = 'cuidado-higiene';

-- Accesorios
insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Collar Ajustable con Reflector Talla M', 'collar-ajustable-reflector-m', 'Collar de nylon con costura reflectante para visibilidad nocturna. Hebilla de liberación rápida.', 149, 20, 'pieza', true, 'convencional', '{collar,reflector,seguridad}'
from public.product_categories where slug = 'accesorios';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Correa Retráctil 5 m con Freno', 'correa-retractil-5m', 'Correa retráctil de 5 metros con sistema de freno automático. Soporta hasta 25 kg.', 299, 12, 'pieza', false, 'convencional', '{correa,retráctil,paseo}'
from public.product_categories where slug = 'accesorios';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Cama Ortopédica Memory Foam 80x60 cm', 'cama-ortopedica-memory-80x60', 'Cama con núcleo de memory foam y funda removible lavable. Ideal para perros adultos y senior.', 749, 8, 'pieza', true, 'convencional', '{cama,ortopédica,memory foam}'
from public.product_categories where slug = 'accesorios';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Juguete Kong Classic Talla M', 'juguete-kong-classic-m', 'El clásico Kong de caucho natural. Ideal para rellenar con premios y mantener al perro entretenido.', 249, 20, 'pieza', false, 'convencional', '{juguete,kong,interactivo}'
from public.product_categories where slug = 'accesorios';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Plato Antivuelco Doble Acero 1L', 'plato-antivuelco-acero-1l', 'Comedero doble de acero inoxidable con base antiderrapante. Capacidad 1 litro por lado.', 189, 16, 'pieza', false, 'convencional', '{comedero,acero,antivuelco}'
from public.product_categories where slug = 'accesorios';

-- Homeopatía y Naturales
insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Aceite de Salmón Natural 250 ml', 'aceite-salmon-natural-250ml', 'Aceite de salmón puro prensado en frío. Rico en Omega 3, DHA y EPA para pelaje brillante y articulaciones sanas.', 249, 18, 'pieza', true, 'natural', '{omega 3,salmón,pelaje,articulaciones}'
from public.product_categories where slug = 'homeopatia-naturales';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Suplemento Articulaciones Glucosamina + MSM 60 tabs', 'suplemento-glucosamina-msm-60tabs', 'Suplemento con glucosamina, condroitina y MSM. Ayuda a mantener articulaciones saludables en perros senior y activos.', 349, 14, 'pieza', true, 'homeopatico', '{glucosamina,articulaciones,suplemento}'
from public.product_categories where slug = 'homeopatia-naturales';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Flores de Bach Gotas Estrés y Ansiedad 30 ml', 'flores-bach-estres-30ml', 'Fórmula homeopática con Flores de Bach para perros nerviosos. Ayuda en tormentas, viajes y separación.', 179, 12, 'pieza', false, 'homeopatico', '{flores de bach,estrés,ansiedad,natural}'
from public.product_categories where slug = 'homeopatia-naturales';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Aceite de CBD para Mascotas 300 mg 30 ml', 'aceite-cbd-mascotas-300mg-30ml', 'Aceite de CBD de espectro completo. Ayuda con ansiedad, dolor crónico y convulsiones. Consulta a tu veterinario.', 699, 8, 'pieza', false, 'natural', '{cbd,ansiedad,dolor,natural}'
from public.product_categories where slug = 'homeopatia-naturales';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Probioticos Naturales Polvo 120 g', 'probioticos-naturales-polvo-120g', 'Probióticos y prebióticos naturales en polvo. Mejora la digestión y fortalece el sistema inmune.', 229, 16, 'pieza', false, 'natural', '{probiotico,digestión,inmune}'
from public.product_categories where slug = 'homeopatia-naturales';

-- Ropa
insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Suéter Navideño Reno Talla M', 'sueter-navid-eno-m', 'Suéter navideño con diseño de reno. Tejido suave y cómodo para el invierno.', 249, 10, 'pieza', false, 'convencional', '{suéter,navidad,ropa}'
from public.product_categories where slug = 'ropa';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Impermeable Amarillo con Capucha Talla M', 'impermeable-amarillo-capucha-m', 'Impermeable ligero con capucha ajustable. Mantén a tu perro seco en días lluviosos.', 349, 8, 'pieza', false, 'convencional', '{impermeable,lluvia,ropa}'
from public.product_categories where slug = 'ropa';

insert into public.products (category_id, name, slug, description, price, stock, unit, featured, tipo, ai_tags)
select id, 'Pijama Algodón Orgánico Talla M', 'pijama-algodon-organico-m', 'Pijama de algodón orgánico transpirable. Ideal para perros que se estresan o se sienten seguros con ropa.', 299, 12, 'pieza', false, 'natural', '{pijama,algodón,orgánico,ropa}'
from public.product_categories where slug = 'ropa';

-- ============================================================
-- Verificación
-- ============================================================
select 'Seed completado' as mensaje,
       (select count(*) from public.product_categories) as categorias,
       (select count(*) from public.products) as productos;
