//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo } from "react";
import { VegaVisual } from "@microsoft/fabric-visuals";

import { PanelEmpty, PanelError, PanelSkeleton, panelClassName } from "@/components/query-states";
import { useThemeContext } from "@/hooks/theme.context";
import { useSalesModelQuery } from "@/hooks/use-sales-model-query";
import { resolveQueryState } from "@/lib/query-state";
import { toDataTable } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import { applicationUsage, dailyUsage } from "@/queries/usage";

type QueryHandle = ReturnType<typeof useSalesModelQuery>;

interface ChartProps {
    result: QueryHandle;
}

const dailyTitle = "Daily credits consumed";

export function DailyUsageChart({ result }: ChartProps) {
    const { theme } = useThemeContext();
    const { columnMetadata, vegaLiteSpec, resultSetRowCountLimit } = dailyUsage();
    const state = resolveQueryState(result, resultSetRowCountLimit);
    const table = state.kind === "ready" ? state.table : undefined;
    const dataTable = useMemo(() => (table ? toDataTable(table, columnMetadata) : undefined), [table, columnMetadata]);

    if (state.kind === "loading") return <PanelSkeleton title={dailyTitle} />;
    if (state.kind === "error") return <PanelError title={dailyTitle} message={state.message} onRetry={result.refetch} />;
    if (!dataTable || dataTable.rows.length === 0) {
        return <PanelEmpty title={dailyTitle} message="No credits were consumed in the model's date range." />;
    }

    return (
        <VegaVisual
            spec={vegaLiteSpec}
            data={dataTable}
            theme={theme}
            header={{ title: dailyTitle, subtitle: "Days with recorded requests" }}
            containerClassName={cn(panelClassName, "h-full")}
        />
    );
}

const applicationTitle = "Credits by application";

export function ApplicationUsageChart({ result }: ChartProps) {
    const { theme } = useThemeContext();
    const { columnMetadata, vegaLiteSpec, resultSetRowCountLimit } = applicationUsage();
    const state = resolveQueryState(result, resultSetRowCountLimit);
    const table = state.kind === "ready" ? state.table : undefined;
    const dataTable = useMemo(() => (table ? toDataTable(table, columnMetadata) : undefined), [table, columnMetadata]);

    if (state.kind === "loading") return <PanelSkeleton title={applicationTitle} />;
    if (state.kind === "error") return <PanelError title={applicationTitle} message={state.message} onRetry={result.refetch} />;
    if (!dataTable || dataTable.rows.length === 0) {
        return <PanelEmpty title={applicationTitle} message="No application usage has been recorded." />;
    }

    return (
        <VegaVisual
            spec={vegaLiteSpec}
            data={dataTable}
            theme={theme}
            header={{ title: applicationTitle, subtitle: "Stacked by LLM model" }}
            containerClassName={cn(panelClassName, "h-full")}
        />
    );
}
