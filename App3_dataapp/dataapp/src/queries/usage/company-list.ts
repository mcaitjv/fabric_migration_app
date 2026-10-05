//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./company-list.dax?raw";

const connection = "salesmodel";

/** Seven companies today; the cap keeps the slicer list bounded. */
const resultSetRowCountLimit = 1000;

/** Keyed by the exact column names returned by the connector. */
const columnMetadata: ColumnMetadataMap = {
    "Company[NAME]": { name: "CompanyName", displayName: "Company" },
};

/** Every company in the model, for the company slicer (no visual spec). */
export function companyList() {
    return { connection, query, resultSetRowCountLimit, columnMetadata };
}
