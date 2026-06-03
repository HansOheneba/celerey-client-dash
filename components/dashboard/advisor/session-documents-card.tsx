"use client";

import * as React from "react";
import {
  FileText,
  FileBarChart2,
  BookOpen,
  Paperclip,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import type { SessionDocument } from "./types";

const PRIMARY = "rgb(27, 24, 86)";
const ACCENT = "rgb(140, 128, 248)";

const DOC_TYPE_META: Record<
  SessionDocument["type"],
  { label: string; icon: React.ReactNode }
> = {
  report: {
    label: "Report",
    icon: <FileBarChart2 className="h-4 w-4" />,
  },
  plan: {
    label: "Plan",
    icon: <BookOpen className="h-4 w-4" />,
  },
  review: {
    label: "Review",
    icon: <FileText className="h-4 w-4" />,
  },
  attachment: {
    label: "Attachment",
    icon: <Paperclip className="h-4 w-4" />,
  },
};

type Props = {
  documents: SessionDocument[];
};

export function SessionDocumentsCard({ documents }: Props) {
  return (
    <DashCard>
      <CardHeader>
        <CardTitle className="text-base" style={{ color: PRIMARY }}>
          Documents and deliverables
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Reports, plans, and session materials prepared by your advisor.
        </p>
      </CardHeader>

      <CardContent>
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted/60 py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No documents have been shared yet.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Reports and plans are added here after each advisory session.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-muted/30">
            {documents.map((doc) => {
              const meta = DOC_TYPE_META[doc.type];
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "rgba(140,128,248,0.1)",
                      color: ACCENT,
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] rounded-full h-4 px-1.5"
                      >
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {doc.dateLabel}
                      </span>
                      {doc.sizeLabel && (
                        <span className="text-xs text-muted-foreground/60">
                          {doc.sizeLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 hover:bg-muted/30"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </DashCard>
  );
}
