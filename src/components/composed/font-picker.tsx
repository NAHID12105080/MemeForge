"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CURATED_FONTS } from "@/features/editor/lib/fonts/curated-fonts";
import { loadGoogleFont } from "@/features/editor/lib/fonts/google-fonts-loader";
import { cn } from "@/lib/utils";

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    CURATED_FONTS.forEach((font) => loadGoogleFont(font.family));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span style={{ fontFamily: value }}>{value}</span>
          <ChevronsUpDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search fonts..." />
          <CommandList>
            <CommandEmpty>No font found.</CommandEmpty>
            <CommandGroup>
              {CURATED_FONTS.map((font) => (
                <CommandItem
                  key={font.family}
                  value={font.family}
                  onSelect={() => {
                    onChange(font.family);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("size-3.5", value === font.family ? "opacity-100" : "opacity-0")}
                  />
                  <span style={{ fontFamily: font.family }}>{font.family}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
