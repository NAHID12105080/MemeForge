"use client";

import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MEME_EMOJI = [
  "😂",
  "😭",
  "🔥",
  "💀",
  "👀",
  "🤡",
  "😳",
  "✨",
  "💯",
  "🙏",
  "😩",
  "🥴",
  "😎",
  "🤔",
  "😱",
  "🫠",
  "🤣",
  "😤",
  "👍",
  "👎",
  "💪",
  "🎉",
  "⚡",
  "❤️",
  "💔",
  "🗿",
  "🤌",
  "🙌",
  "😬",
  "🫡",
  "🤯",
  "🥹",
];

interface EmojiPickerPopoverProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPickerPopover({ onSelect }: EmojiPickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Smile className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-8 gap-1">
          {MEME_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="hover:bg-accent rounded-md p-1.5 text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
