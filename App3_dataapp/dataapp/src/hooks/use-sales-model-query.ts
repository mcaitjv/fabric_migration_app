//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import type { SemanticModelQueryResult } from "@microsoft/rayfin-connector-fabric-semanticmodel";
import { getRayfinClient } from "@/lib/rayfin-client";

interface UseSalesModelQueryOptions {
    /** DAX query string (exactly one EVALUATE). */
    query: string;
    /**
     * Row cap enforced by Analysis Services. Exceeding it returns an
     * `overflow` error instead of a silently truncated table.
     */
    resultSetRowCountLimit: number;
}

interface UseSalesModelQueryResult {
    /** Latest settled result; kept while a refetch is in flight. */
    data: SemanticModelQueryResult | undefined;
    isLoading: boolean;
    error: Error | undefined;
    refetch: () => void;
}

interface Settled {
    key: string;
    data: SemanticModelQueryResult | undefined;
    error: Error | undefined;
}

/**
 * Runs a DAX query through the `salesmodel` Rayfin connector
 * (`client.connectors.salesmodel.executeQuery`) as the signed-in user.
 *
 * Call it once per result table and pass the result down to every visual
 * that shares it, rather than calling it again in each component.
 */
export function useSalesModelQuery(
    options: UseSalesModelQueryOptions,
): UseSalesModelQueryResult {
    const { query, resultSetRowCountLimit } = options;
    const [attempt, setAttempt] = useState(0);
    const [settled, setSettled] = useState<Settled>();

    // Identifies one request; a result only counts once its key is current.
    const key = `${attempt}\u0000${resultSetRowCountLimit}\u0000${query}`;

    useEffect(() => {
        let cancelled = false;

        // Deferred so a synchronous client setup error becomes a rejection.
        Promise.resolve()
            .then(() => getRayfinClient().connectors.salesmodel.executeQuery({ query, resultSetRowCountLimit }))
            .then(
                (result) => {
                    if (cancelled) return;
                    const error = result.status === "error" ? new Error(result.error.message) : undefined;
                    setSettled({ key, data: result, error });
                },
                (err: unknown) => {
                    if (cancelled) return;
                    setSettled({ key, data: undefined, error: err instanceof Error ? err : new Error(String(err)) });
                },
            );

        return () => {
            cancelled = true;
        };
    }, [key, query, resultSetRowCountLimit]);

    const refetch = useCallback(() => setAttempt((n) => n + 1), []);
    const isLoading = settled?.key !== key;

    return {
        data: settled?.data,
        isLoading,
        error: isLoading ? undefined : settled?.error,
        refetch,
    };
}
