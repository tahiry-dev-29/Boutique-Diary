"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/");
      } else {
        setError(data.message || "Échec de la connexion");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="identifier"
            className="block text-sm font-semibold text-gray-700"
          >
            Adresse électronique *
          </label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Adresse électronique"
            className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d7a56] focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700"
          >
            Mot de passe *
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d7a56] focus:border-transparent transition-all"
            required
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-500 hover:underline decoration-gray-400"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-[#2d7a56] hover:bg-[#236345] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d7a56] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Connexion..." : "Me connecter"}
        </button>
      </form>

      {}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">ou</span>
        </div>
      </div>

      {}
      <Link
        href="/register"
        className="block w-full py-3 px-4 border-2 border-[#1e293b] rounded-full text-center text-base font-bold text-[#1e293b] hover:bg-gray-50 transition-colors"
      >
        Vous n&apos;avez pas encore de compte ?
      </Link>
    </div>
  );
}
