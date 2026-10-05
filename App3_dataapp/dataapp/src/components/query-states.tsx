//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";

/** Card chrome shared by custom panels and `containerClassName` on visuals. */
export const panelClassName = "rounded-xl border border-border bg-card shadow-2";

interface PanelFrameProps {
    title: string;
    className?: string;
    children: ReactNode;
}

/** Matches the VisualContainer header so state panels don't shift layout. */
function PanelFrame({ title, className, children }: PanelFrameProps) {
    return (
        <section aria-label={title} className={cn(panelClassName, "flex h-full flex-col p-400", className)}>
            <h2 className="mb-300 font-heading text-400 font-semibold leading-400 text-card-foreground">{title}</h2>
            {children}
        </section>
    );
}

export function PanelSkeleton({ title, className }: { title: string; className?: string }) {
    return (
        <PanelFrame title={title} className={className}>
            <div aria-busy="true" aria-live="polite" className="flex flex-1 flex-col gap-300">
                <span className="sr-only">Loading {title}…</span>
                <div className="h-400 w-1/3 animate-pulse rounded-md bg-muted" />
                <div className="flex-1 animate-pulse rounded-md bg-muted" />
            </div>
        </PanelFrame>
    );
}

export function PanelEmpty({ title, message, className }: { title: string; message: string; className?: string }) {
    return (
        <PanelFrame title={title} className={className}>
            <div className="flex flex-1 flex-col items-center justify-center gap-200 text-center">
                <Inbox aria-hidden className="icon-size-400 text-muted-foreground" />
                <p className="text-300 leading-300 text-muted-foreground">{message}</p>
            </div>
        </PanelFrame>
    );
}

interface ErrorBannerProps {
    title: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorBanner({ title, message, onRetry }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            className="flex items-start gap-300 rounded-xl border border-destructive bg-card p-400 text-destructive"
        >
            <AlertTriangle aria-hidden className="icon-size-300 mt-100 shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-300 font-semibold leading-300">{title}</p>
                <p className="mt-100 break-words text-300 leading-300">{message}</p>
            </div>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex shrink-0 items-center gap-100 rounded-md border border-destructive px-300 py-100 text-300 font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <RotateCw aria-hidden className="icon-size-200" />
                    Retry
                </button>
            )}
        </div>
    );
}

export function PanelError({ title, message, onRetry, className }: ErrorBannerProps & { className?: string }) {
    return (
        <PanelFrame title={title} className={className}>
            <ErrorBanner title={`Couldn't load ${title.toLowerCase()}`} message={message} onRetry={onRetry} />
        </PanelFrame>
    );
}
