import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

interface FieldProps {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}

export function Field({ id, label, hint, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
