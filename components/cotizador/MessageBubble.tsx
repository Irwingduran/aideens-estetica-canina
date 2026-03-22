"use client"

import Image from "next/image"

interface MessageBubbleProps {
  role: "agent" | "user"
  content: string
  imageUrl?: string
}

export function MessageBubble({ role, content, imageUrl }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[75%] px-4 py-3 font-sans text-sm"
          style={{
            background: "#C9A84C",
            color: "#1C1814",
            borderRadius: "18px 4px 18px 18px",
          }}
        >
          {imageUrl && (
            <div className="mb-2 overflow-hidden rounded-xl">
              <Image
                src={imageUrl}
                alt="Foto de tu perro"
                width={180}
                height={180}
                className="object-cover"
                style={{ width: 180, height: 180 }}
                unoptimized
              />
            </div>
          )}
          {content && <p className="whitespace-pre-wrap">{content}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[75%] px-4 py-3 font-sans text-sm"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          color: "#F5F0E8",
          borderRadius: "4px 18px 18px 18px",
        }}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
