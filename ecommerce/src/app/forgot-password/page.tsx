"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {}
      <div className="p-6">
        <Link
          href="/login"
          className="inline-flex items-center text-gray-600 hover:text-[#2d7a56] font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Retour</span>
        </Link>
      </div>

      {}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl font-bold text-[#1e293b] mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-gray-500">
            Cette fonctionnalité n&apos;est pas encore disponible.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-[#2d7a56] hover:underline font-medium"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
