//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { formatValue, type DataTable } from "@microsoft/fabric-visuals-core";
import { X } from "lucide-react";

import { ErrorBanner, panelClassName } from "@/components/query-states";
import { columnValue, planUtilisation } from "@/lib/usage-selection";
import { cn } from "@/lib/utils";
import { usageFormats } from "@/queries/usage";

/** KPI tiles, by `ColumnDef.name` from the company-usage result. */
const kpiColumns = ["Credits", "CreditBalance", "Requests", "Tokens", "LLMCost", "AvgCredits"] as const;

function formatCell(table: DataTable, row: readonly unknown[] | undefined, name: string): string {
    const value = columnValue(table, row, name);
    if (value === null || value === undefined) return "—";
    const format = table.columns.find((column) => column.name === name)?.format;
    return String(formatValue(value, format));
}

type KpiStripProps =
    | { state: "loading" }
    | { state: "error"; message: string; onRetry: () => void }
    | {
          state: "ready";
          table: DataTable;
          row: readonly unknown[] | undefined;
          scopeLabel: string;
          onClearScope?: () => void;
      };

export function KpiStrip(props: KpiStripProps) {
    if (props.state === "error") {
        return <ErrorBanner title="Couldn't load usage totals" message={props.message} onRetry={props.onRetry} />;
    }

    const ready = props.state === "ready" ? props : undefined;
    const utilisation = ready
        ? planUtilisation(columnValue(ready.table, ready.row, "Credits"), columnValue(ready.table, ready.row, "CreditBalance"))
        : null;

    return (
        <section aria-label="Usage totals" className="flex flex-col gap-300">
            <div className="flex min-h-600 flex-wrap items-center gap-200">
                <span className="text-200 font-medium uppercase leading-200 tracking-wider text-muted-foreground">Scope</span>
                {ready ? (
                    <span className="inline-flex items-center gap-100 rounded-full bg-accent px-300 py-100 text-300 font-medium leading-300 text-accent-foreground">
                        {ready.scopeLabel}
                        {ready.onClearScope && (
                            <button
                                type="button"
                                onClick={ready.onClearScope}
                                aria-label="Clear company selection"
                                className="rounded-full p-100 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <X aria-hidden className="icon-size-100" />
                            </button>
                        )}
                    </span>
                ) : (
                    <span className="h-500 w-800 animate-pulse rounded-full bg-muted" />
                )}
                {ready && !ready.onClearScope && (
                    <span className="text-200 leading-200 text-muted-foreground">Select a company in the chart or table to focus these totals.</span>
                )}
            </div>

            {ready && !ready.row ? (
                <p className={cn(panelClassName, "p-400 text-center text-300 leading-300 text-muted-foreground")}>
                    No usage recorded for this scope.
                </p>
            ) : (
                <dl className="grid grid-cols-2 gap-300 sm:grid-cols-3 2xl:grid-cols-6">
                    {kpiColumns.map((name) => {
                        const label = ready?.table.columns.find((column) => column.name === name)?.displayName ?? name;
                        return (
                            <div key={name} className={cn(panelClassName, "relative flex flex-col gap-100 overflow-hidden p-400 pt-500")}>
                                <span aria-hidden className="absolute inset-x-0 top-0 h-100 bg-primary" />
                                <dt className="text-200 font-medium leading-200 text-muted-foreground">{ready ? label : <span className="sr-only">Loading</span>}</dt>
                                <dd className="truncate font-numeric text-600 font-semibold leading-600 text-card-foreground tabular-nums">
                                    {ready ? formatCell(ready.table, ready.row, name) : (
                                        <span aria-busy="true" className="block h-600 w-3/4 animate-pulse rounded-md bg-muted" />
                                    )}
                                </dd>
                                {name === "Credits" && ready && utilisation !== null && (
                                    <div className="mt-100 flex flex-col gap-100">
                                        <div
                                            role="meter"
                                            aria-label="Share of plan credits consumed"
                                            aria-valuemin={0}
                                            aria-valuemax={1}
                                            aria-valuenow={utilisation}
                                            aria-valuetext={String(formatValue(utilisation, usageFormats.share))}
                                            className="h-100 w-full overflow-hidden rounded-full bg-muted"
                                        >
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(utilisation, 1) * 100}%` }} />
                                        </div>
                                        <span className="text-200 leading-200 text-muted-foreground">
                                            {String(formatValue(utilisation, usageFormats.share))} of plan credits
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </dl>
            )}
        </section>
    );
}
