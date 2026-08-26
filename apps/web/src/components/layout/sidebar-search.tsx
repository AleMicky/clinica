"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SidebarSearch({
  value,
  onChange,
  placeholder = "Filtrar módulos y accesos...",
}: SidebarSearchProps) {
  return (
    <div className="relative mt-2">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/70 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 pl-8 pr-7 text-xs rounded-md bg-sidebar-accent/40 border border-sidebar-border/50 text-sidebar-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-sidebar-accent/70 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sidebar-foreground transition-colors p-0.5 rounded-xs cursor-pointer"
          title="Limpiar búsqueda"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
