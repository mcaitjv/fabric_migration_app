//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { resolveQueryState } from "@/lib/query-state";

const table = {
    columns: [{ name: "Date[Date]", dataType: "DateTime" }, { name: "[Credits]", dataType: "Double" }],
    rows: [["2026-04-15T00:00:00.000", 215.62]],
};

describe("resolveQueryState", () => {
    it("is loading before the first result", () => {
        expect(resolveQueryState({ data: undefined, isLoading: true, error: undefined }, 100)).toEqual({ kind: "loading" });
    });

    it("keeps the previous table while refreshing", () => {
        const state = resolveQueryState(
            { data: { status: "success", table, requestId: "" }, isLoading: true, error: undefined },
            100,
        );
        expect(state).toEqual({ kind: "ready", table, isRefreshing: true });
    });

    it("explains an overflow against the row limit", () => {
        const state = resolveQueryState(
            {
                data: { status: "error", requestId: "", error: { category: "overflow", message: "More than 100 rows." } },
                isLoading: false,
                error: new Error("More than 100 rows."),
            },
            100,
        );
        expect(state).toEqual({
            kind: "error",
            message: "The result exceeded the 100-row limit for this view. More than 100 rows.",
        });
    });

    it("appends the connector's recovery hint", () => {
        const state = resolveQueryState(
            {
                data: {
                    status: "error",
                    requestId: "",
                    error: { category: "api", message: "401 Unauthorized", recoveryHint: "Check the token audience." },
                },
                isLoading: false,
                error: undefined,
            },
            100,
        );
        expect(state).toEqual({ kind: "error", message: "401 Unauthorized Check the token audience." });
    });

    it("surfaces a thrown transport error", () => {
        const state = resolveQueryState({ data: undefined, isLoading: false, error: new Error("offline") }, 100);
        expect(state).toEqual({ kind: "error", message: "offline" });
    });
});
