//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useCallback, useMemo, useState } from "react";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { Gauge, Moon, RotateCw, Sun } from "lucide-react";

import { CompanySlicer, type CompanySlicerState } from "@/components/usage/company-slicer";
import { KpiStrip } from "@/components/usage/kpi-strip";
import {
    CompanyCreditsChart,
    CompanyUsageGrid,
    type CompanyVisualState,
} from "@/components/usage/company-usage-visuals";
import { ApplicationUsageChart, DailyUsageChart } from "@/components/usage/trend-and-mix-charts";
import { useThemeContext } from "@/hooks/theme.context";
import { useSalesModelQuery } from "@/hooks/use-sales-model-query";
import { resolveQueryState } from "@/lib/query-state";
import { toRollupDataTables } from "@/lib/to-data-table";
import { findRow, selectedValue } from "@/lib/usage-selection";
import {
    applicationUsage,
    companyList,
    companyUsage,
    companyUsageRollupFlag,
    dailyUsage,
} from "@/queries/usage";

const companyOptions = companyList();

function filterLabel(companies: readonly string[]): string {
    if (companies.length === 0) return "All companies";
    if (companies.length === 1) return companies[0];
    return `${companies.length} companies`;
}

function App() {
    const { isDark, toggleTheme } = useThemeContext();
    /** Slicer selection; empty means all companies. Re-queries every visual. */
    const [filterCompanies, setFilterCompanies] = useState<string[]>([]);
    /** Chart/grid click; re-scopes the KPI cards from the loaded result only. */
    const [focusedCompany, setFocusedCompany] = useState<string | null>(null);

    const filterKey = [...filterCompanies].sort().join("\u0000");
    const { company, daily, application } = useMemo(() => {
        const companies = filterKey ? filterKey.split("\u0000") : [];
        return {
            company: companyUsage({ companies }),
            daily: dailyUsage({ companies }),
            application: applicationUsage({ companies }),
        };
    }, [filterKey]);

    const optionsResult = useSalesModelQuery(companyOptions);
    const slicerState = useMemo<CompanySlicerState>(() => {
        const state = resolveQueryState(
            { data: optionsResult.data, isLoading: optionsResult.isLoading, error: optionsResult.error },
            companyOptions.resultSetRowCountLimit,
        );
        if (state.kind === "loading") return state;
        if (state.kind === "error") return { ...state, onRetry: optionsResult.refetch };
        const companies = state.table.rows
            .map((row) => row[0])
            .filter((value): value is string => typeof value === "string" && value !== "");
        return { kind: "ready", companies };
    }, [optionsResult.data, optionsResult.isLoading, optionsResult.error, optionsResult.refetch]);

    const handleFilterChange = useCallback((companies: string[]) => {
        setFilterCompanies(companies);
        setFocusedCompany(null);
    }, []);

    // Three queries feed six visuals: the company rollup is shared by the
    // KPI cards, the company chart, and the company grid.
    const companyResult = useSalesModelQuery(company);
    const dailyResult = useSalesModelQuery(daily);
    const applicationResult = useSalesModelQuery(application);

    const companyState = useMemo<CompanyVisualState>(() => {
        const state = resolveQueryState(
            { data: companyResult.data, isLoading: companyResult.isLoading, error: companyResult.error },
            company.resultSetRowCountLimit,
        );
        if (state.kind === "loading") return state;
        if (state.kind === "error") return { ...state, onRetry: companyResult.refetch };
        try {
            const { bodyTable, grandTotalTable } = toRollupDataTables(state.table, company.columnMetadata, {
                rollupFlagColumns: [companyUsageRollupFlag],
            });
            return { kind: "ready", bodyTable, grandTotalTable };
        } catch (err) {
            return {
                kind: "error",
                message: err instanceof Error ? err.message : String(err),
                onRetry: companyResult.refetch,
            };
        }
    }, [company, companyResult.data, companyResult.isLoading, companyResult.error, companyResult.refetch]);

    const handleCompanyInteraction = useCallback((events: InteractionEvent[]) => {
        const next = selectedValue(events, "CompanyName");
        if (next !== undefined) setFocusedCompany(next);
    }, []);

    const isRefreshing = companyResult.isLoading || dailyResult.isLoading || applicationResult.isLoading;
    const refreshAll = () => {
        companyResult.refetch();
        dailyResult.refetch();
        applicationResult.refetch();
    };

    return (
        <div className="min-h-full bg-background">
            <div className="mx-auto flex w-full max-w-dashboard flex-col gap-600 px-400 py-600 md:px-800">
                <header className="flex flex-wrap items-end justify-between gap-400 border-b border-border pb-400">
                    <div className="flex items-center gap-300">
                        <span className="flex icon-size-700 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Gauge aria-hidden className="icon-size-400" />
                        </span>
                        <div>
                            <h1 className="font-heading text-hero-700 font-semibold leading-hero-700 text-foreground">
                                Credit usage
                            </h1>
                            <p className="text-300 leading-300 text-muted-foreground">
                                AI credit consumption, cost, and plan balance by company
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-200">
                        <button
                            type="button"
                            onClick={refreshAll}
                            disabled={isRefreshing}
                            aria-busy={isRefreshing}
                            className="inline-flex h-800 items-center gap-200 rounded-md border border-input bg-card px-300 text-300 font-medium text-card-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RotateCw aria-hidden className={isRefreshing ? "icon-size-200 animate-spin" : "icon-size-200"} />
                            {isRefreshing ? "Refreshing…" : "Refresh"}
                        </button>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            className="inline-flex h-800 w-800 items-center justify-center rounded-md border border-input bg-card text-card-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {isDark ? <Sun aria-hidden className="icon-size-200" /> : <Moon aria-hidden className="icon-size-200" />}
                        </button>
                    </div>
                </header>

                <div className="flex flex-col gap-600 lg:flex-row lg:items-start">
                    <div className="w-full shrink-0 lg:w-sidebar">
                        <CompanySlicer state={slicerState} selected={filterCompanies} onChange={handleFilterChange} />
                    </div>

                    <main aria-busy={isRefreshing} className="flex min-w-0 flex-1 flex-col gap-600">
                        {companyState.kind === "ready" ? (
                            <KpiStrip
                                state="ready"
                                table={companyState.grandTotalTable}
                                row={
                                    focusedCompany
                                        ? findRow(companyState.bodyTable, "CompanyName", focusedCompany)
                                        : companyState.grandTotalTable.rows[0]
                                }
                                scopeLabel={focusedCompany ?? filterLabel(filterCompanies)}
                                onClearScope={focusedCompany ? () => setFocusedCompany(null) : undefined}
                            />
                        ) : companyState.kind === "error" ? (
                            <KpiStrip state="error" message={companyState.message} onRetry={companyState.onRetry} />
                        ) : (
                            <KpiStrip state="loading" />
                        )}

                        <div className="grid grid-cols-1 gap-400 xl:grid-cols-3">
                            <div className="h-chart-md xl:col-span-2">
                                <DailyUsageChart result={dailyResult} />
                            </div>
                            <div className="h-chart-md">
                                <ApplicationUsageChart result={applicationResult} />
                            </div>
                            <div className="h-chart-lg">
                                <CompanyCreditsChart
                                    state={companyState}
                                    spec={company.vegaLiteSpec}
                                    onInteraction={handleCompanyInteraction}
                                />
                            </div>
                            <div className="h-chart-lg xl:col-span-2">
                                <CompanyUsageGrid state={companyState} onInteraction={handleCompanyInteraction} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;
