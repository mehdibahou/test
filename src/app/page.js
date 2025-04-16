"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // States for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const BASE_URL = "http://localhost:3001/api";

  const router = useRouter();

  useEffect(() => {
    // Check if any user exists in the database
    const checkUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/check-users`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setShowSignUp(!data.exists);
        setIsSignUp(!data.exists);
      } catch (error) {
        console.error("Error checking user:", error);
        // Set default to show sign-in form if there's an error
        setShowSignUp(false);
        setIsSignUp(false);
      }
    };

    checkUser();
  }, []);

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match for signup
    if (isSignUp && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const BASE_URL = "http://localhost:3001/api";
      const endpoint = isSignUp ? "/signup" : "/signin";
      const response = await fetch(BASE_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Une erreur s'est produite");
        return;
      }

      router.push("/options/dashboard");
    } catch (error) {
      console.error("Error:", error);
      setError(
        `Une erreur s'est produite lors de ${
          isSignUp ? "l'inscription" : "la connexion"
        }. Veuillez réessayer plus tard.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="horse.jpg"
          alt="Elegant horse background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Form Card */}
        <div className="w-full h-[80%] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Bewell Logo */}
          <div className="w-20 h-full mx-auto mb-6">
            <img src="/logo.png" alt="Bewell logo" className="" />
          </div>

          {/* Error Message */}
          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adresse Email{" "}
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-xl border  border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 text-black outline-none transition-all"
                placeholder="Entrez votre email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 rounded-xl border text-black border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            {/* Confirm Password field for Sign Up */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </div>
            )}

            {/* Remember me and Forgot Password (only show for sign in) */}
            {!isSignUp && (
              <></>
              // <div className="flex items-center justify-between">
              //   <label className="flex items-center">
              //     <input
              //       type="checkbox"
              //       className="w-4 h-4 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]"
              //     />
              //     <span className="ml-2 text-sm text-gray-600">
              //       Se souvenir de moi
              //     </span>
              //   </label>
              //   {/* <button
              //     type="button"
              //     className="text-sm text-[#DC2626] hover:text-[#B91C1C] transition-colors"
              //   >
              //     Mot de passe oublié?
              //   </button> */}
              // </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1B4D3E] text-white py-3 rounded-xl hover:bg-[#153729] transition-colors duration-200 font-medium"
              disabled={loading}
            >
              {loading
                ? isSignUp
                  ? "Inscription..."
                  : "Connexion..."
                : isSignUp
                ? "S'inscrire"
                : "Se connecter"}
            </button>

            {/* Toggle between Sign In and Sign Up */}
            {showSignUp && (
              <p className="text-center text-sm text-gray-600">
                {isSignUp
                  ? "Vous avez déjà un compte?"
                  : "Vous n'avez pas de compte?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#1B4D3E] hover:text-[#153729] font-medium"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
