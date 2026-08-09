"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: number;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("w-full pt-3 pb-1 border-b", className)}>
      <div className="flex items-center gap-3">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!onStepClick}
                className={cn(
                  "flex-1 flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all",
                  onStepClick ? "cursor-pointer" : "cursor-default",
                  isActive
                    ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                    : isCompleted
                      ? "bg-muted/40 border-border/70 text-foreground hover:bg-muted/60"
                      : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {Icon ? <Icon className="size-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider truncate">
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  )}
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="h-4 w-px bg-border/80 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
