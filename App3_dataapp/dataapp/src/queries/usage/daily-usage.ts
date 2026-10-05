//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./daily-usage.dax?raw";
import filteredQuery from "./daily-usage-by-company.dax?raw";
import { applyCompanyFilter } from "./company-filter";
import spec from "./daily-usage.json";
import { usageFormats } from "./usage-formats";

const connection = "salesmodel";

/** One row per active day; the Date table holds 730 days, so this bounds a full scan. */
const resultSetRowCountLimit = 1000;

/** Keyed by the exact column names returned by the connector. */
const columnMetadata: ColumnMetadataMap = {
    "Date[Date]": { name: "Date", displayName: "Date", format: usageFormats.date },
    "[Credits]": { name: "Credits", displayName: "Credits consumed", format: usageFormats.credits },
    "[LLM Cost]": { name: "LLMCost", displayName: "LLM cost", format: usageFormats.cost },
    "[Requests]": { name: "Requests", displayName: "Requests", format: usageFormats.requests },
};

export interface DailyUsageParams {
    /** Restrict to these `'Company'[Name]` values; empty or omitted means all. */
    companies?: readonly string[];
}

/** Daily credits, cost, and requests for days with activity. */
export function dailyUsage(params?: DailyUsageParams) {
    return {
        connection,
        query: applyCompanyFilter(baseQuery, filteredQuery, params?.companies),
        resultSetRowCountLimit,
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
