"use client";

import * as React from "react";
import {
  FolderTree,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { CatalogoGrupoResponse } from "../types/catalogo.types";

interface CatalogoGrupoListProps {
  grupos: CatalogoGrupoResponse[];
  selectedGrupoId: number | null;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectGrupo: (grupo: CatalogoGrupoResponse) => void;
  onEditGrupo: (grupo: CatalogoGrupoResponse) => void;
  onDeleteGrupo: (grupo: CatalogoGrupoResponse) => void;
}

export function CatalogoGrupoList({
  grupos,
  selectedGrupoId,
  isLoading,
  searchTerm,
  onSearchChange,
  onSelectGrupo,
  onEditGrupo,
  onDeleteGrupo,
}: CatalogoGrupoListProps) {
  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-xl p-3 shadow-2xs h-full">
      <div className="flex items-center justify-between px-1 pt-0.5">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FolderTree className="size-3.5 text-primary" />
          Catálogos
        </h2>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
          {grupos.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar catálogo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background"
        />
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[580px] pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-2.5 rounded-lg border border-border/40">
              <Skeleton className="h-3.5 w-3/4 mb-1.5" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          ))
        ) : grupos.length === 0 ? (
          <div className="p-5 text-center border border-dashed rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Sin catálogos registrados.
            </p>
          </div>
        ) : (
          grupos.map((cat) => {
            const isSelected = selectedGrupoId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectGrupo(cat)}
                className={`group cursor-pointer rounded-lg p-2.5 transition-all duration-150 border flex items-center justify-between relative ${
                  isSelected
                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10 border-l-3 border-l-primary shadow-2xs"
                    : "border-border/40 hover:border-border hover:bg-muted/40 bg-background/50"
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs tracking-tight text-foreground truncate">
                      {cat.nombre}
                    </span>
                    {cat.activo ? (
                      <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="size-3 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0">
                      {cat.codigo}
                    </span>
                    {cat.descripcion && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                        {cat.descripcion}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <MoreVertical className="size-3.5" />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGrupo(cat);
                        }}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGrupo(cat);
                        }}
                        className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
