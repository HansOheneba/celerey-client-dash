import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardEmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
};

export type DashboardEmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: DashboardEmptyStateAction;
  actionSlot?: React.ReactNode;
  size?: "default" | "sm";
  className?: string;
};

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
  actionSlot,
  size = "default",
  className,
}: DashboardEmptyStateProps) {
  const isSm = size === "sm";

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        "bg-background/80 backdrop-blur-sm",
        "shadow-sm",
        className,
      )}
    >
      {/* subtle ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(
              circle at top left,
              rgba(59,130,246,0.08),
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(168,85,247,0.08),
              transparent 35%
            )
          `,
        }}
      />

      {/* subtle grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <CardContent
        className={cn(
          "relative flex flex-col items-center justify-center text-center",
          isSm ? "py-12 px-6 gap-4" : "py-20 px-8 gap-5",
        )}
      >
        {/* icon */}
        <div className="relative">
          {/* glow */}
          <div
            className="absolute inset-0 blur-2xl opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35))",
            }}
          />

          <div
            className={cn(
              "relative flex items-center justify-center rounded-2xl border",
              "bg-background/90 backdrop-blur",
              "shadow-sm",
              isSm ? "h-14 w-14" : "h-16 w-16",
            )}
          >
            {icon}
          </div>
        </div>

        {/* copy */}
        <div className={cn("space-y-2", isSm ? "max-w-sm" : "max-w-md")}>
          <h3
            className={cn(
              "font-semibold tracking-tight",
              isSm ? "text-sm" : "text-lg",
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              "leading-relaxed text-muted-foreground",
              isSm ? "text-xs" : "text-sm",
            )}
          >
            {description}
          </p>
        </div>

        {/* action */}
        {actionSlot ??
          (action ? (
            <Button
              size="sm"
              className="mt-2 gap-2"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          ) : null)}
      </CardContent>
    </Card>
  );
}
