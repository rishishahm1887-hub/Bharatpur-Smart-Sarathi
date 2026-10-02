import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

const ProtectedRoute = ({ children }) => {
    const {
        isLoaded,
        isSignedIn,
    } = useAuth();

    console.log("AUTH:", {
        isLoaded,
        isSignedIn,
    });

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="text-slate-600">
                        Loading authentication...
                    </p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;