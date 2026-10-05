//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSalesModelQuery } from "@/hooks/use-sales-model-query";

const mockExecuteQuery = vi.fn();

vi.mock("@/lib/rayfin-client", () => ({
    getRayfinClient: () => ({ connectors: { salesmodel: { executeQuery: mockExecuteQuery } } }),
}));

const options = { query: "EVALUATE ROW(\"x\", 1)", resultSetRowCountLimit: 10 };

describe("useSalesModelQuery", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls executeQuery with the query and row limit", async () => {
        mockExecuteQuery.mockResolvedValue({ status: "success", table: { columns: [], rows: [] }, requestId: "" });
        const { result } = renderHook(() => useSalesModelQuery(options));

        expect(result.current.isLoading).toBe(true);
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(mockExecuteQuery).toHaveBeenCalledWith(options);
        expect(result.current.data?.status).toBe("success");
    });

    it("exposes an error result as an Error", async () => {
        mockExecuteQuery.mockResolvedValue({ status: "error", requestId: "", error: { category: "query", message: "Bad DAX" } });
        const { result } = renderHook(() => useSalesModelQuery(options));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.error?.message).toBe("Bad DAX");
    });

    it("captures a thrown transport error", async () => {
        mockExecuteQuery.mockRejectedValue(new Error("offline"));
        const { result } = renderHook(() => useSalesModelQuery(options));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.error?.message).toBe("offline");
        expect(result.current.data).toBeUndefined();
    });

    it("re-executes on refetch", async () => {
        mockExecuteQuery.mockResolvedValue({ status: "success", table: { columns: [], rows: [] }, requestId: "" });
        const { result } = renderHook(() => useSalesModelQuery(options));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => result.current.refetch());
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data?.status).toBe("success");
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    });
});
