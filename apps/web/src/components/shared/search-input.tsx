"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  value = "",
  onChange,
  placeholder = "Buscar...",
  className,
  inputClassName,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn("pl-9 text-sm", inputClassName)}
      />
    </div>
  );
}
