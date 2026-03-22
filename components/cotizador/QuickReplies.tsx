"use client"

interface QuickRepliesProps {
  options: string[]
  onSelect: (option: string) => void
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className="px-4 py-2 rounded-full font-sans text-sm text-gold border border-gold/30 bg-gold/10 hover:bg-gold/20 transition-colors duration-200"
        >
          {option}
        </button>
      ))}
    </div>
  )
}
