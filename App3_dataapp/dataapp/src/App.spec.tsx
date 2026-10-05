//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { VisualTheme } from "@microsoft/fabric-visuals-core";
import App from "@/App";
import { ThemeContext } from "@/hooks/theme.context";

// Queries never resolve, so the dashboard stays in its loading state.
vi.mock("@/lib/rayfin-client", () => ({
    getRayfinClient: () => ({
        connectors: { salesmodel: { executeQuery: () => new Promise(() => {}) } },
    }),
}));

function renderApp() {
    return render(
        <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {}, theme: {} as VisualTheme }}>
            <App />
        </ThemeContext.Provider>,
    );
}

describe("App", () => {
    it("renders without throwing", () => {
        expect(() => renderApp()).not.toThrow();
    });

    it("shows the dashboard shell with loading panels", () => {
        renderApp();
        expect(screen.getByRole("heading", { name: "Credit usage" })).toBeInTheDocument();
        expect(screen.getByText("Loading Daily credits consumed…")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /refreshing/i })).toBeDisabled();
    });
});
