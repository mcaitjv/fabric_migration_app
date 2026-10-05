//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { applicationUsage, companyUsage, dailyUsage, usageFormats } from "@/queries/usage";

const factories = { applicationUsage, companyUsage, dailyUsage };

describe.each(Object.entries(factories))("%s", (_, factory) => {
    const result = factory();

    it("targets the salesmodel connector with a single EVALUATE", () => {
        expect(result.connection).toBe("salesmodel");
        expect(result.query.match(/\bEVALUATE\b/g)).toHaveLength(1);
    });

    it("bounds the result set with a positive integer row limit", () => {
        expect(Number.isInteger(result.resultSetRowCountLimit)).toBe(true);
        expect(result.resultSetRowCountLimit).toBeGreaterThan(0);
    });

    it("gives every column a Vega-safe name", () => {
        for (const column of Object.values(result.columnMetadata)) {
            expect(column.name).not.toMatch(/[.[\]\\"']/);
        }
    });

    it("only uses shared format strings", () => {
        const shared = new Set<string>(Object.values(usageFormats));
        for (const column of Object.values(result.columnMetadata)) {
            if (column.format !== undefined) expect(shared.has(column.format)).toBe(true);
        }
    });

    it("encodes only fields defined in the column metadata", () => {
        const names = new Set(Object.values(result.columnMetadata).map((column) => column.name));
        const fields = JSON.stringify(result.vegaLiteSpec).matchAll(/"field":"([^"]+)"/g);
        for (const [, field] of fields) expect(names.has(field)).toBe(true);
    });
});

describe("companyUsage", () => {
    it("formats the same measure identically to the other visuals", () => {
        const company = companyUsage().columnMetadata;
        const daily = dailyUsage().columnMetadata;
        expect(company["[Credits]"].format).toBe(daily["[Credits]"].format);
        expect(company["[LLM Cost]"].format).toBe(daily["[LLM Cost]"].format);
        expect(company["[Requests]"].format).toBe(daily["[Requests]"].format);
    });
});
