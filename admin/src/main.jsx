import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

const clerkPublishableKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
    throw new Error(
        "Missing VITE_CLERK_PUBLISHABLE_KEY"
    );
}

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <ClerkProvider
        publishableKey={clerkPublishableKey}
    >
        <App />
    </ClerkProvider>
);