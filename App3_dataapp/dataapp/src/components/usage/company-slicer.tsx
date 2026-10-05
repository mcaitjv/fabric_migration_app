//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useId, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { ErrorBanner, panelClassName } from "@/components/query-states";
import { cn } from "@/lib/utils";

export type CompanySlicerState =
    | { kind: "loading" }
    | { kind: "error"; message: string; onRetry: () => void }
    | { kind: "ready"; companies: readonly string[] };

interface CompanySlicerProps {
    state: CompanySlicerState;
    /** Selected companies; empty means all companies. */
    selected: readonly string[];
    onChange: (selected: string[]) => void;
}

/**
 * Filter panel with a multi-select company list. Sits in a left column on
 * wide screens and collapses behind a toggle above the content on narrow ones.
 */
export function CompanySlicer({ state, selected, onChange }: CompanySlicerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const panelId = useId();
    const groupLabelId = useId();
    const summary = selected.length === 0 ? "All companies" : `${selected.length} selected`;

    const toggle = (company: string) => {
        onChange(
            selected.includes(company) ? selected.filter((c) => c !== company) : [...selected, company],
        );
    };

    return (
        <aside aria-label="Filters" className={cn(panelClassName, "flex flex-col lg:sticky lg:top-600")}>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex items-center justify-between gap-200 rounded-xl p-400 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pointer-events-none"
            >
                <span className="flex items-center gap-200">
                    <SlidersHorizontal aria-hidden className="icon-size-200 text-primary" />
                    <span className="font-heading text-400 font-semibold leading-400 text-card-foreground">Filters</span>
                </span>
                <span className="flex items-center gap-200">
                    <span className="text-200 leading-200 text-muted-foreground">{summary}</span>
                    <ChevronDown
                        aria-hidden
                        className={cn("icon-size-200 text-muted-foreground transition-transform lg:hidden", isOpen && "rotate-180")}
                    />
                </span>
            </button>

            <div id={panelId} className={cn("border-t border-border px-400 pb-400 pt-300", !isOpen && "hidden lg:block")}>
                <div role="group" aria-labelledby={groupLabelId} className="flex flex-col gap-200">
                    <div className="flex items-center justify-between gap-200">
                        <span id={groupLabelId} className="text-200 font-medium uppercase leading-200 tracking-wider text-muted-foreground">
                            Company
                        </span>
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            disabled={selected.length === 0}
                            aria-label="Clear company filter"
                            className="rounded-md px-200 py-100 text-200 font-medium leading-200 text-primary hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent"
                        >
                            Clear
                        </button>
                    </div>

                    {state.kind === "loading" && (
                        <div aria-busy="true" className="flex flex-col gap-200">
                            <span className="sr-only">Loading companies…</span>
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="h-500 animate-pulse rounded-md bg-muted" />
                            ))}
                        </div>
                    )}

                    {state.kind === "error" && (
                        <ErrorBanner title="Couldn't load companies" message={state.message} onRetry={state.onRetry} />
                    )}

                    {state.kind === "ready" && state.companies.length === 0 && (
                        <p className="py-200 text-300 leading-300 text-muted-foreground">No companies in the model.</p>
                    )}

                    {state.kind === "ready" && state.companies.length > 0 && (
                        <ul className="flex flex-col gap-100">
                            {state.companies.map((company) => {
                                const checked = selected.includes(company);
                                return (
                                    <li key={company}>
                                        <label
                                            className={cn(
                                                "flex cursor-pointer items-center gap-200 rounded-md px-200 py-100 text-300 leading-300 text-card-foreground hover:bg-muted",
                                                checked && "bg-accent text-accent-foreground",
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggle(company)}
                                                className="icon-size-200 accent-primary focus-visible:outline-2 focus-visible:outline-ring"
                                            />
                                            <span className="truncate">{company}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <p className="pt-100 text-200 leading-200 text-muted-foreground">
                        Applies to every card, chart, and table. Leave all unchecked to include every company.
                    </p>
                </div>
            </div>
        </aside>
    );
}
