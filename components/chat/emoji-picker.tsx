"use client";

const EMOJIS = [
  "😀", "😁", "😂", "🥹", "😍", "🤩", "😎", "🤔",
  "🙌", "👏", "🔥", "✨", "💛", "💜", "🚀", "🎯",
  "✅", "📌", "💡", "🧠", "📚", "💻", "🎓", "☕",
];

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1 rounded-2xl border border-border/80 bg-popover p-2 shadow-xl">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          className="rounded-lg p-1 text-lg hover:bg-secondary"
          onClick={() => onPick(e)}
          aria-label={`Insert ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
