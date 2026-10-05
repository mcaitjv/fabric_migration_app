//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./application-usage.dax?raw";
import filteredQuery from "./application-usage-by-company.dax?raw";
import { applyCompanyFilter } from "./company-filter";
import spec from "./application-usage.json";
import { usageFormats } from "./usage-formats";

const connection = "salesmodel";

/** Application × model pairs (five today); the cap guards against growth. */
const resultSetRowCountLimit = 500;

/** Keyed by the exact column names returned by the connector. */
const columnMetadata: ColumnMetadataMap = {
    "emp CreditLedger[ApplicationName]": { name: "ApplicationName", displayName: "Application" },
    "emp CreditLedger[ModelName]": { name: "ModelName", displayName: "Model" },
    "[Credits]": { name: "Credits", displayName: "Credits consumed", format: usageFormats.credits },
    "[Requests]": { name: "Requests", displayName: "Requests", format: usageFormats.requests },
};

export interface ApplicationUsageParams {
    /** Restrict to these `'Company'[Name]` values; empty or omitted means all. */
    companies?: readonly string[];
}

/** Credits and requests per application, split by LLM model. */
export function applicationUsage(params?: ApplicationUsageParams) {
    return {
        connection,
        query: applyCompanyFilter(baseQuery, filteredQuery, params?.companies),
        resultSetRowCountLimit,
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
