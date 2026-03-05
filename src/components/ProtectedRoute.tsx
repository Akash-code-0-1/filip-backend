import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const admin = useSelector((state: RootState) => state.auth.admin);

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}