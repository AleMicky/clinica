"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CheckCheck,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "primary";

export interface StatusBadgeProps {
  // Compatibilidad booleana
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;

  // Estado por string / enum
  status?: string;
  label?: string;
  variant?: StatusVariant;
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
}

const statusConfigMap: Record<
  string,
  { label: string; variant: StatusVariant; icon: LucideIcon }
> = {
  ACTIVO: { label: "Activo", variant: "success", icon: CheckCircle2 },
  ACTIVE: { label: "Activo", variant: "success", icon: CheckCircle2 },
  HABILITADO: { label: "Habilitado", variant: "success", icon: CheckCircle2 },
  INACTIVO: { label: "Inactivo", variant: "danger", icon: XCircle },
  INACTIVE: { label: "Inactivo", variant: "danger", icon: XCircle },
  DESHABILITADO: { label: "Deshabilitado", variant: "danger", icon: XCircle },
  PENDIENTE: { label: "Pendiente", variant: "warning", icon: Clock },
  PENDING: { label: "Pendiente", variant: "warning", icon: Clock },
  EN_PROCESO: { label: "En Proceso", variant: "info", icon: Clock },
  IN_PROGRESS: { label: "En Proceso", variant: "info", icon: Clock },
  COMPLETADO: { label: "Completado", variant: "success", icon: CheckCheck },
  COMPLETED: { label: "Completado", variant: "success", icon: CheckCheck },
  PAGADO: { label: "Pagado", variant: "success", icon: CheckCheck },
  PAID: { label: "Pagado", variant: "success", icon: CheckCheck },
  ANULADO: { label: "Anulado", variant: "danger", icon: Ban },
  CANCELLED: { label: "Cancelado", variant: "danger", icon: Ban },
  APROBADO: { label: "Aprobado", variant: "success", icon: CheckCircle2 },
  APPROVED: { label: "Aprobado", variant: "success", icon: CheckCircle2 },
  RECHAZADO: { label: "Rechazado", variant: "danger", icon: AlertCircle },
  REJECTED: { label: "Rechazado", variant: "danger", icon: AlertCircle },
  BORRADOR: { label: "Borrador", variant: "neutral", icon: Clock },
  DRAFT: { label: "Borrador", variant: "neutral", icon: Clock },
};

const variantStyleMap: Record<
  StatusVariant,
  { badgeClass: string; dotClass: string }
> = {
  success: {
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  danger: {
    badgeClass:
      "bg-destructive/10 text-destructive border-destructive/20",
    dotClass: "bg-destructive",
  },
  warning: {
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  info: {
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  primary: {
    badgeClass:
      "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
  neutral: {
    badgeClass:
      "bg-muted/80 text-muted-foreground border-border/60",
    dotClass: "bg-muted-foreground",
  },
};

export function StatusBadge({
  active,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
  status,
  label,
  variant,
  icon: CustomIcon,
  dot = false,
  className,
}: StatusBadgeProps) {
  // 1. Si se provee status (string)
  if (status !== undefined) {
    const normalizedKey = status.toUpperCase().replace(/\s+/g, "_");
    const matchedConfig = statusConfigMap[normalizedKey];

    const finalVariant = variant || matchedConfig?.variant || "neutral";
    const finalLabel = label || matchedConfig?.label || status;
    const Icon = CustomIcon || matchedConfig?.icon;
    const styles = variantStyleMap[finalVariant];

    return (
      <Badge
        variant="outline"
        className={cn(
          "w-fit gap-1 text-xs font-medium border shadow-2xs",
          styles.badgeClass,
          className
        )}
      >
        {dot ? (
          <span className={cn("size-1.5 rounded-full shrink-0", styles.dotClass)} />
        ) : (
          Icon && <Icon className="size-3 shrink-0" />
        )}
        <span>{finalLabel}</span>
      </Badge>
    );
  }

  // 2. Compatibilidad con active (booleano)
  const isActive = active ?? true;
  const booleanVariant: StatusVariant = isActive ? "success" : "danger";
  const styles = variantStyleMap[booleanVariant];
  const Icon = CustomIcon || (isActive ? CheckCircle2 : XCircle);
  const displayLabel = isActive ? activeLabel : inactiveLabel;

  return (
    <Badge
      variant="outline"
      className={cn(
        "w-fit gap-1 text-xs font-medium border shadow-2xs",
        styles.badgeClass,
        className
      )}
    >
      {dot ? (
        <span className={cn("size-1.5 rounded-full shrink-0", styles.dotClass)} />
      ) : (
        <Icon className="size-3 shrink-0" />
      )}
      <span>{displayLabel}</span>
    </Badge>
  );
}
