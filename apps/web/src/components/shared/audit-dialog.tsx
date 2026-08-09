"use client";

import * as React from "react";
import {
  History,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  Tag,
  Sparkles,
  FileCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export interface AuditInfo {
  title?: string;
  entityName: string;
  entityCode?: string;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  id?: string | number;
  extraDetails?: Array<{ label: string; value: string | number }>;
}

export interface AuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditInfo: AuditInfo | null;
}

function parseFormattedDate(dateStr?: string | null): string {
  if (!dateStr) return "No registrado";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return formatDateTime(d);
  } catch {
    return dateStr;
  }
}

export function AuditDialog({
  open,
  onOpenChange,
  auditInfo,
}: AuditDialogProps) {
  if (!auditInfo) return null;

  const title = auditInfo.title || "Detalles de Auditoría";
  const createdDate = parseFormattedDate(auditInfo.createdAt);
  const updatedDate = parseFormattedDate(auditInfo.updatedAt);
  const createdUser = auditInfo.createdBy || "Sistema / Desconocido";
  const updatedUser = auditInfo.updatedBy || auditInfo.createdBy || "Sistema / Sin modificaciones";

  const hasModifications = Boolean(auditInfo.updatedAt && auditInfo.updatedAt !== auditInfo.createdAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0 rounded-xl border border-border/60 shadow-xl bg-card">
        {/* Dialog Header */}
        <DialogHeader className="p-4 bg-muted/40 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <History className="size-4 stroke-[2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-sm font-bold text-foreground">
                  {title}
                </DialogTitle>
                {auditInfo.entityCode && (
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-background/80">
                    {auditInfo.entityCode}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {auditInfo.entityName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Audit Body / Timeline */}
        <div className="p-4 space-y-4">
          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
            {/* Creation Event */}
            <div className="relative">
              <div className="absolute -left-[21px] top-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-4 ring-background">
                <Sparkles className="size-2.5" />
              </div>
              <div className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <FileCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                    Registro Creado
                  </span>
                  <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">
                    Origen
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-border/30">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Creado por</span>
                    <span className="font-medium text-foreground text-[11px] flex items-center gap-1 mt-0.5">
                      <UserCheck className="size-3 text-muted-foreground" />
                      {createdUser}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Fecha y Hora</span>
                    <span className="font-mono font-medium text-foreground text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="size-3 text-muted-foreground" />
                      {createdDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modification Event */}
            <div className="relative">
              <div className={`absolute -left-[21px] top-0.5 flex size-4 items-center justify-center rounded-full ring-4 ring-background ${
                hasModifications
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Calendar className="size-2.5" />
              </div>
              <div className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <History className="size-3 text-primary" />
                    Última Modificación
                  </span>
                  <Badge
                    variant={hasModifications ? "default" : "outline"}
                    className="text-[9px] font-mono px-1 py-0"
                  >
                    {hasModifications ? "Actualizado" : "Sin cambios"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-border/30">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Modificado por</span>
                    <span className="font-medium text-foreground text-[11px] flex items-center gap-1 mt-0.5">
                      <UserCheck className="size-3 text-muted-foreground" />
                      {updatedUser}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Fecha y Hora</span>
                    <span className="font-mono font-medium text-foreground text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="size-3 text-muted-foreground" />
                      {hasModifications ? updatedDate : "Sin cambios desde creación"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info Box */}
          <div className="bg-background border border-border/60 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            {auditInfo.id && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Tag className="size-3" />
                <span>ID Registro:</span>
                <span className="font-semibold text-foreground">{auditInfo.id}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans text-[10px] font-medium ml-auto">
              <ShieldCheck className="size-3" />
              <span>Verificado por Auditoría</span>
            </div>
          </div>

          {auditInfo.extraDetails && auditInfo.extraDetails.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
              {auditInfo.extraDetails.map((detail, idx) => (
                <div key={idx} className="bg-muted/20 p-2 rounded border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">{detail.label}</span>
                  <span className="font-medium text-foreground">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
