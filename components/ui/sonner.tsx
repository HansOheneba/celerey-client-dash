"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#151339",
          "--normal-text": "#ffffff",
          "--normal-border": "#151339",
          "--success-bg": "#151339",
          "--success-text": "#ffffff",
          "--success-border": "#151339",
          "--error-bg": "#151339",
          "--error-text": "#ffffff",
          "--error-border": "#151339",
          "--warning-bg": "#151339",
          "--warning-text": "#ffffff",
          "--warning-border": "#151339",
          "--info-bg": "#151339",
          "--info-text": "#ffffff",
          "--info-border": "#151339",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
