//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/**
 * Format strings shared by every usage visual, so cards, charts, tooltips,
 * and grids render the same value identically.
 *
 * Sourced from `INFO.VIEW.COLUMNS()` / `INFO.VIEW.MEASURES()` on the
 * `salesmodel` connector. Where the model defines a `FormatString` it is used
 * verbatim. None of the measures used here define one, so those entries are
 * fallbacks chosen from each measure's data type — replace them if the
 * model later adds format strings. The model does not record a currency for
 * the cost measures, so no currency symbol is applied.
 */
export const usageFormats = {
    /** Model: `'Date'[Date]` FormatString. */
    date: "Long Date",
    /** Fallback: `[Total credits consumed]` / `[Credit Balance]` are Number (decimal). */
    credits: "#,0.00",
    /** Fallback: `[Avg credits per request]` is Number (decimal). */
    avgCredits: "#,0.00",
    /** Fallback: `[TokensUsed]` is Number but holds whole token counts. */
    tokens: "#,0",
    /** Fallback: `[Requests completed till now]` is Integer. */
    requests: "#,0",
    /** Fallback: `[Total LLM Cost]` is Number (decimal); currency not recorded in the model. */
    cost: "#,0.00",
    /** Derived in TypeScript (consumed ÷ plan credits); not a model measure. */
    share: "0.0%",
} as const;
