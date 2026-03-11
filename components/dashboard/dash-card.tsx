/**
 * DashCard — centralized dashboard card wrapper.
 * All dashboard cards should use this instead of the raw shadcn <Card>.
 * Default surface: #f8f9fb background, muted border, subtle shadow.
 * Extra className props are merged in and can override any default.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";

// Re-export sub-components so callers only need one import
export {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
};

export function DashCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn("bg-white border-muted/60 shadow-lg", className)}
      {...props}
    />
  );
}
