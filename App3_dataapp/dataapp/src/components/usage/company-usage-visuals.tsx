//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo } from "react";
import { VegaVisual, type VisualizationSpec } from "@microsoft/fabric-visuals";
import { DataGrid } from "@microsoft/fabric-datagrid";
import type { DataTable, InteractionEventCallback } from "@microsoft/fabric-visuals-core";

import { PanelEmpty, PanelError, PanelSkeleton, panelClassName } from "@/components/query-states";
import { useThemeContext } from "@/hooks/theme.context";
import { cn } from "@/lib/utils";

/** Rendering state for visuals fed by the shared company-usage result. */
export type CompanyVisualState =
    | { kind: "loading" }
    | { kind: "error"; message: string; onRetry: () => void }
    | { kind: "ready"; bodyTable: DataTable; grandTotalTable: DataTable };

interface CompanyVisualProps {
    state: CompanyVisualState;
    onInteraction: InteractionEventCallback;
}

const chartTitle = "Credits by company";

function readCssColor(name: string): string | undefined {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || undefined;
}

export function CompanyCreditsChart({ state, spec, onInteraction }: CompanyVisualProps & { spec: VisualizationSpec }) {
    const { theme } = useThemeContext();
    // Vega renders to SVG and can't resolve var(), so read the token's current
    // value. `theme` is re-read from CSS after the `.dark` class flips, so it
    // is the signal that the token's value has changed.
    const barColor = useMemo(
        () => readCssColor("--color-chart-company"),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- theme marks a CSS token change
        [theme],
    );

    if (state.kind === "loading") return <PanelSkeleton title={chartTitle} />;
    if (state.kind === "error") return <PanelError title={chartTitle} message={state.message} onRetry={state.onRetry} />;
    if (state.bodyTable.rows.length === 0) {
        return <PanelEmpty title={chartTitle} message="No company has consumed credits yet." />;
    }

    return (
        <VegaVisual
            spec={spec}
            data={state.bodyTable}
            theme={theme}
            header={{ title: chartTitle, subtitle: "Select a bar to focus the totals" }}
            // The base theme sets `bar.fill`, which outranks `color`, so override `fill`.
            configVegaLite={barColor ? { bar: { fill: barColor } } : undefined}
            containerClassName={cn(panelClassName, "h-full")}
            onInteraction={onInteraction}
        />
    );
}

const gridTitle = "Company usage detail";

export function CompanyUsageGrid({ state, onInteraction }: CompanyVisualProps) {
    const { theme } = useThemeContext();

    if (state.kind === "loading") return <PanelSkeleton title={gridTitle} />;
    if (state.kind === "error") return <PanelError title={gridTitle} message={state.message} onRetry={state.onRetry} />;
    if (state.bodyTable.rows.length === 0) {
        return <PanelEmpty title={gridTitle} message="No company usage has been recorded." />;
    }

    return (
        <DataGrid
            data={state.bodyTable}
            grandTotals={{ position: "bottom", data: state.grandTotalTable }}
            defaultSort={[{ columnId: "Credits", direction: "desc" }]}
            // A provided grand total can't follow client-side filters.
            capabilities={{ disableFiltering: true }}
            theme={theme}
            header={{ title: gridTitle, subtitle: "Totals from the semantic model" }}
            containerClassName={cn(panelClassName, "h-full")}
            onInteraction={onInteraction}
        />
    );
}
