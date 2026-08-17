import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:gap-5 w-full min-w-0 animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
