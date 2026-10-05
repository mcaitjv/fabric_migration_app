//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { QueryTable, SemanticModelQueryResult } from "@microsoft/rayfin-connector-fabric-semanticmodel";

export type QueryState =
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; table: QueryTable; isRefreshing: boolean };

interface QueryStateInput {
    data: SemanticModelQueryResult | undefined;
    isLoading: boolean;
    error: Error | undefined;
}

/**
 * Collapses a connector hook result into one renderable state.
 *
 * A refetch keeps a previous table on screen (`isRefreshing`) rather than
 * flashing back to a skeleton.
 */
export function resolveQueryState(
    { data, isLoading, error }: QueryStateInput,
    resultSetRowCountLimit: number,
): QueryState {
    if (data?.status === "success") {
        return { kind: "ready", table: data.table, isRefreshing: isLoading };
    }
    // A retry after a failure shows the skeleton again, not the stale error.
    if (isLoading) {
        return { kind: "loading" };
    }
    if (data?.status === "error") {
        return { kind: "error", message: describeQueryError(data.error, resultSetRowCountLimit) };
    }
    if (error) {
        return { kind: "error", message: error.message };
    }
    return { kind: "loading" };
}

function describeQueryError(
    error: Extract<SemanticModelQueryResult, { status: "error" }>["error"],
    resultSetRowCountLimit: number,
): string {
    const parts =
        error.category === "overflow"
            ? [`The result exceeded the ${resultSetRowCountLimit.toLocaleString()}-row limit for this view.`, error.message]
            : [error.message];
    if (error.recoveryHint) parts.push(error.recoveryHint);
    return parts.filter(Boolean).join(" ");
}
