"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ApiErrorInfo } from "@/lib/api/api-error";

interface GlobalApiErrorAlertDialogProps {
    error: ApiErrorInfo | null;
    onOpenChange: (open: boolean) => void;
}

export function GlobalApiErrorAlertDialog({
    error,
    onOpenChange,
}: GlobalApiErrorAlertDialogProps) {
    const open = error !== null;

    const title = error?.title || "Error";
    const description = error?.detail || error?.message || "Ocurrió un error inesperado.";
    const status = error?.status;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertCircle className="size-5 text-destructive" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="flex items-center gap-2 text-base font-semibold">
                        <span className="truncate">{title}</span>
                        {status !== undefined && (
                            <span className="inline-flex items-center rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-destructive">
                                {status}
                            </span>
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Entendido
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}