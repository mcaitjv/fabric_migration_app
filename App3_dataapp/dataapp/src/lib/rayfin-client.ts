//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { ConnectorsRayfinClient } from "@microsoft/rayfin-client";
import { fabricSemanticModel } from "@microsoft/rayfin-connector-fabric-semanticmodel";
import {
    type SalesmodelSchema,
    connectorConfig as salesmodelConfig,
} from "../../rayfin/connectors/salesmodel/schema";

/**
 * Connectors declared in `rayfin/rayfin.yml`. The key must match the
 * connector `name` there, the `connectors` option, and the runtime map.
 */
export type AppConnectorsSchema = {
    salesmodel: SalesmodelSchema;
};

export type AppRayfinClient = ConnectorsRayfinClient<
    Record<string, never>,
    Record<string, never>,
    AppConnectorsSchema
>;

let _client: AppRayfinClient | undefined;

/**
 * Returns the pre-configured RayfinClient singleton.
 *
 * The same instance backs Fabric sign-in (`rayfin-auth.service.ts`) and the
 * typed connectors API, so connector calls run as the signed-in user.
 */
export function getRayfinClient(): AppRayfinClient {
    if (!_client) {
        const apiUrl = import.meta.env.VITE_RAYFIN_API_URL;
        const publishableKey = import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY;

        if (!apiUrl || !publishableKey) {
            throw new Error(`Missing required env vars for creating rayfin client - run 'npx rayfin up'`);
        }

        _client = new ConnectorsRayfinClient<
            Record<string, never>,
            Record<string, never>,
            AppConnectorsSchema
        >(
            {
                baseUrl: apiUrl,
                publishableKey,
                authStorage: true,
                useProxy: false,
                connectors: { salesmodel: salesmodelConfig },
            },
            // Decodes the Arrow response and normalises it into a status union.
            { salesmodel: fabricSemanticModel() },
        );
    }

    return _client;
}
