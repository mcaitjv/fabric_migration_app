//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { applicationUsage, applyCompanyFilter, companyUsage, dailyUsage, daxString } from "@/queries/usage";

describe("daxString", () => {
    it("wraps and escapes double quotes", () => {
        expect(daxString("emp")).toBe('"emp"');
        expect(daxString('a "b"')).toBe('"a ""b"""');
    });

    it("rejects control characters", () => {
        expect(() => daxString("a\nb")).toThrow();
    });
});

describe("applyCompanyFilter", () => {
    const filtered = "VAR _F = TREATAS({ __COMPANY_VALUES__ }, 'Company'[Name])";

    it("returns the base query when nothing is selected", () => {
        expect(applyCompanyFilter("BASE", filtered, [])).toBe("BASE");
        expect(applyCompanyFilter("BASE", filtered, undefined)).toBe("BASE");
    });

    it("substitutes a sorted, de-duplicated literal list", () => {
        expect(applyCompanyFilter("BASE", filtered, ["titan", "emp", "titan"])).toBe(
            `VAR _F = TREATAS({ "emp", "titan" }, 'Company'[Name])`,
        );
    });
});

describe.each([
    ["companyUsage", companyUsage],
    ["dailyUsage", dailyUsage],
    ["applicationUsage", applicationUsage],
])("%s with a company filter", (_, factory) => {
    it("uses the TREATAS variant and keeps one EVALUATE", () => {
        const { query } = factory({ companies: ["emp", "titan"] });
        expect(query).toContain(`TREATAS({ "emp", "titan" }, 'Company'[Name])`);
        expect(query).toContain("_CompanyFilter,");
        expect(query).not.toContain("__COMPANY_VALUES__");
        expect(query.match(/\bEVALUATE\b/g)).toHaveLength(1);
    });

    it("keeps the unfiltered query when no companies are selected", () => {
        expect(factory({ companies: [] }).query).toBe(factory().query);
        expect(factory().query).not.toContain("TREATAS");
    });
});
