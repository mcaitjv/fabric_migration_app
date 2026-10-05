//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./company-usage.dax?raw";
import filteredQuery from "./company-usage-by-company.dax?raw";
import { applyCompanyFilter } from "./company-filter";
import spec from "./company-usage.json";
import { usageFormats } from "./usage-formats";

const connection = "salesmodel";

/** Seven companies today; the cap guards against unexpected growth. */
const resultSetRowCountLimit = 500;

/** Serialized name of the ROLLUPADDISSUBTOTAL flag column. */
export const companyUsageRollupFlag = "[IsGrandTotal]";

/** Keyed by the exact column names returned by the connector. */
const columnMetadata: ColumnMetadataMap = {
    "Company[NAME]": { name: "CompanyName", displayName: "Company" },
    "[Requests]": { name: "Requests", displayName: "Requests", format: usageFormats.requests },
    "[Credits]": { name: "Credits", displayName: "Credits consumed", format: usageFormats.credits },
    "[Tokens]": { name: "Tokens", displayName: "Tokens", format: usageFormats.tokens },
    "[LLM Cost]": { name: "LLMCost", displayName: "LLM cost", format: usageFormats.cost },
    "[Avg Credits]": { name: "AvgCredits", displayName: "Avg credits / request", format: usageFormats.avgCredits },
    "[Credit Balance]": { name: "CreditBalance", displayName: "Credit balance", format: usageFormats.credits },
};

export interface CompanyUsageParams {
    /** Restrict to these `'Company'[Name]` values; empty or omitted means all. */
    companies?: readonly string[];
}

/**
 * Per-company usage with a grand-total row. One result feeds the KPI cards
 * (grand total), the company chart (body rows), and the company grid (both).
 */
export function companyUsage(params?: CompanyUsageParams) {
    return {
        connection,
        query: applyCompanyFilter(baseQuery, filteredQuery, params?.companies),
        resultSetRowCountLimit,
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
