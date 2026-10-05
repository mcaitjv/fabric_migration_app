//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/** Placeholder in the `*-by-company.dax` variants for the TREATAS value list. */
const placeholder = "__COMPANY_VALUES__";

/** Serializes a value as a DAX string literal (quotes are escaped by doubling). */
export function daxString(value: string): string {
    if ([...value].some((ch) => ch.charCodeAt(0) < 0x20)) {
        throw new Error("Company names cannot contain control characters.");
    }
    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Selects the base query, or the company-filtered variant with the selection
 * substituted into its `TREATAS` list. An empty selection means all companies.
 */
export function applyCompanyFilter(
    baseQuery: string,
    filteredQuery: string,
    companies: readonly string[] | undefined,
): string {
    if (!companies?.length) return baseQuery;
    if (!filteredQuery.includes(placeholder)) throw new Error(`Filtered query is missing ${placeholder}.`);
    const values = [...new Set(companies)].sort().map(daxString).join(", ");
    return filteredQuery.replace(placeholder, values);
}
