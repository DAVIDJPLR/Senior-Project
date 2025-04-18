/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

export const msalConfig = {
    auth: {
        clientId: "a513410d-2527-46c4-adf1-cc4195d4059f",
        authority: "https://login.microsoftonline.com/83918960-2218-4cd3-81fe-302a8e771da9",
        redirectUri: window.location.hostname.includes('localhost') 
            ? "http://localhost:5173"   // Localhost for development
            : "https://computerhelp.gcc.edu", // Production
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: true, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean): void => {
                if (containsPii) return;
            
                const logMethods: Record<LogLevel, (msg: string) => void> = {
                    [LogLevel.Error]: console.error,
                    [LogLevel.Info]: console.info,
                    [LogLevel.Verbose]: console.debug,
                    [LogLevel.Warning]: console.warn,
                    [LogLevel.Trace]: function (msg: string): void {
                        throw new Error("Function not implemented.");
                    }
                };
            
                const log = logMethods[level];
                if (log) {
                    log(message);
                }
            }
        }	
    }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: ["User.Read"]
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};