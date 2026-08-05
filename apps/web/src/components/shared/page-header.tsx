"use client";

import * as React from "react";
import { Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onActionClick,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {Icon && <Icon className="size-6 text-primary shrink-0" />}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {children}
        {actionLabel && onActionClick && (
          <Button onClick={onActionClick} className="gap-2 cursor-pointer">
            <ActionIcon className="size-4" />
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
