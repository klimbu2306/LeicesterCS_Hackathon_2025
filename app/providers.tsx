"use client";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "../authConfig";
import { ReactNode } from "react";

// Initialize MSAL outside of the component to prevent re-initialization on re-renders
const msalInstance = new PublicClientApplication(msalConfig);
msalInstance.initialize();

export default function Providers({ children }: { children: ReactNode }) {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
