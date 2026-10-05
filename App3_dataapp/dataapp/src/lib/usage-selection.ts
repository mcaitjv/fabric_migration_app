//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { DataTable, InteractionEvent } from "@microsoft/fabric-visuals-core";

/** Reads a cell by its `ColumnDef.name`; `undefined` if the column or row is missing. */
export function columnValue(
    table: DataTable,
    row: readonly unknown[] | undefined,
    name: string,
): unknown {
    const index = table.columns.findIndex((column) => column.name === name);
    return index < 0 || !row ? undefined : row[index];
}

/** First row whose `name` column equals `value`. */
export function findRow(table: DataTable, name: string, value: unknown): unknown[] | undefined {
    const index = table.columns.findIndex((column) => column.name === name);
    return index < 0 ? undefined : table.rows.find((row) => row[index] === value);
}

/**
 * Reduces visual interaction events to a single selected value of `field`.
 *
 * Returns the selected value, `null` when the selection was cleared (or the
 * selection does not constrain `field` to one value), and `undefined` when
 * the events carry nothing to act on.
 */
export function selectedValue(events: readonly InteractionEvent[], field: string): string | null | undefined {
    let result: string | null | undefined;
    for (const event of events) {
        if (event.action === "clear") {
            result = null;
            continue;
        }
        const values = event.selections.flatMap((selection) =>
            selection.predicates.flatMap((predicate) =>
                predicate.type === "set" && predicate.name === field ? predicate.values : [],
            ),
        );
        const distinct = [...new Set(values)];
        result = distinct.length === 1 && typeof distinct[0] === "string" ? distinct[0] : null;
    }
    return result;
}

/** Share of plan credits consumed: consumed ÷ (consumed + remaining balance). */
export function planUtilisation(consumed: unknown, balance: unknown): number | null {
    if (typeof consumed !== "number" || typeof balance !== "number") return null;
    const planCredits = consumed + balance;
    return planCredits > 0 ? consumed / planCredits : null;
}
