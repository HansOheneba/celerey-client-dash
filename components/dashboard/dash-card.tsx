
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
      className={cn("bg-white border-gray-200 border", className)}
      {...props}
    />
  );
}
