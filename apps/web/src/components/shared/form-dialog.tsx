"use client";

import * as React from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type SharedButtonVariant } from "./empty-state";
import { cn } from "@/lib/utils";

export type FormDialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

const sizeClasses: Record<FormDialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
};

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  size?: FormDialogSize;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  submitIcon?: LucideIcon;
  submitVariant?: SharedButtonVariant;
  cancelLabel?: string;
  onCancel?: () => void;
  showFooter?: boolean;
  customFooter?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  size = "lg",
  onSubmit,
  isSubmitting = false,
  submitLabel = "Guardar",
  submitIcon: SubmitIcon,
  submitVariant = "default",
  cancelLabel = "Cancelar",
  onCancel,
  showFooter = true,
  customFooter,
  children,
  className,
}: FormDialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting) return; // Evitar cierre accidental durante submit
    onOpenChange(newOpen);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const content = (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="size-5 text-primary shrink-0" />}
          <span>{title}</span>
        </DialogTitle>
        {description && (
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="py-2 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {children}
      </div>

      {showFooter && (
        <DialogFooter className="gap-2 sm:gap-0 mt-4 pt-3 border-t border-border/50">
          {customFooter ? (
            customFooter
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {cancelLabel}
              </Button>
              <Button
                type={onSubmit ? "submit" : "button"}
                variant={submitVariant}
                disabled={isSubmitting}
                className="gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    {SubmitIcon && <SubmitIcon className="size-4" />}
                    <span>{submitLabel}</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[95vw] p-6",
          sizeClasses[size] || sizeClasses.lg,
          className
        )}
      >
        {onSubmit ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(e);
            }}
            className="space-y-4"
          >
            {content}
          </form>
        ) : (
          content
        )}
      </DialogContent>
    </Dialog>
  );
}
