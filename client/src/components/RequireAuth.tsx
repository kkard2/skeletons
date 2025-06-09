import { Navigate } from "react-router";
import type { JSX } from "react";
import { useAppContext } from "../types";

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { state } = useAppContext();
    if (!state.auth.user) return <Navigate to="/login" />;
    return children;
}
