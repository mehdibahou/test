"use client";
import { useAuth } from "../hooks/useAuth";

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#1B4D3E]"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
