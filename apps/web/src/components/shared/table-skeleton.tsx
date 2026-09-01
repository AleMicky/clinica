"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeaders?: boolean;
  standalone?: boolean;
  className?: string;
}

export function TableSkeletonRows({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  const colWidths = ["w-3/4", "w-1/2", "w-2/3", "w-1/3", "w-5/6"];

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx} className="py-3">
              <Skeleton
                className={cn(
                  "h-4",
                  colWidths[(rowIdx + colIdx) % colWidths.length] || "w-1/2"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeaders = true,
  standalone = true,
  className,
}: TableSkeletonProps) {
  if (!standalone) {
    return <TableSkeletonRows rows={rows} columns={columns} />;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 overflow-hidden bg-card/60",
        className
      )}
    >
      <Table>
        {showHeaders && (
          <TableHeader className="bg-muted/40">
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="h-10">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          <TableSkeletonRows rows={rows} columns={columns} />
        </TableBody>
      </Table>
    </div>
  );
}
