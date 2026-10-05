//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { columnValue, findRow, planUtilisation, selectedValue } from "@/lib/usage-selection";

const table: DataTable = {
    columns: [
        { name: "CompanyName", displayName: "Company" },
        { name: "Credits", displayName: "Credits consumed", format: "#,0.00" },
    ],
    rows: [
        ["aeh", 123],
        ["titan", 300.28],
    ],
};

describe("columnValue / findRow", () => {
    it("reads a cell by column name", () => {
        expect(columnValue(table, table.rows[1], "Credits")).toBe(300.28);
        expect(columnValue(table, table.rows[1], "Missing")).toBeUndefined();
        expect(columnValue(table, undefined, "Credits")).toBeUndefined();
    });

    it("finds a row by column value", () => {
        expect(findRow(table, "CompanyName", "aeh")).toEqual(["aeh", 123]);
        expect(findRow(table, "CompanyName", "nobody")).toBeUndefined();
    });
});

describe("selectedValue", () => {
    const select = (values: unknown[]) => ({
        action: "select" as const,
        selections: [{ predicates: [{ type: "set" as const, name: "CompanyName", values }] }],
    });

    it("returns the single selected value", () => {
        expect(selectedValue([select(["titan"])], "CompanyName")).toBe("titan");
    });

    it("returns null on clear or an ambiguous selection", () => {
        expect(selectedValue([{ action: "clear" }], "CompanyName")).toBeNull();
        expect(selectedValue([select(["aeh", "titan"])], "CompanyName")).toBeNull();
    });

    it("returns undefined when there are no events", () => {
        expect(selectedValue([], "CompanyName")).toBeUndefined();
    });
});

describe("planUtilisation", () => {
    it("divides consumed credits by total plan credits", () => {
        expect(planUtilisation(1110.21, 16889.79)).toBeCloseTo(1110.21 / 18000);
    });

    it("returns null for missing or empty plans", () => {
        expect(planUtilisation(null, 10)).toBeNull();
        expect(planUtilisation(0, 0)).toBeNull();
    });
});
