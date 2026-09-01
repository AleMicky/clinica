"use client";

import * as React from "react";
import { FolderOpen, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SharedButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: SharedButtonVariant;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;
  const SecondaryActionIcon = secondaryAction?.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-border/80 bg-muted/10",
        className
      )}
    >
      <div className="p-3.5 rounded-full bg-muted/60 text-muted-foreground mb-3.5 shadow-2xs">
        <Icon className="size-6 sm:size-7" />
      </div>

      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              size="sm"
              onClick={secondaryAction.onClick}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {SecondaryActionIcon && (
                <SecondaryActionIcon className="size-3.5" />
              )}
              <span>{secondaryAction.label}</span>
            </Button>
          )}

          {action && (
            <Button
              variant={action.variant || "default"}
              size="sm"
              onClick={action.onClick}
              className="gap-1.5 text-xs cursor-pointer shadow-xs"
            >
              {ActionIcon && <ActionIcon className="size-3.5" />}
              <span>{action.label}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
