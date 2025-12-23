"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function CustomerAuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.email || formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Connexion réussie !");
        router.push("/shop");
      } else {
        toast.error(data.message || "Identifiants invalides");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        );
        setIsLogin(true);
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          rememberMe: false,
        });
      } else {
        toast.error(data.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {}
        <div className="bg-gray-100 rounded-3xl shadow-2xl shadow-emerald-100/50 overflow-hidden">
          {}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Bienvenue !" : "Créer un compte"}
            </h1>
            <p className="text-emerald-100 text-sm">
              {isLogin
                ? "Connectez-vous pour accéder à votre compte"
                : "Inscrivez-vous pour profiter de nos offres"}
            </p>
          </div>

          {}
          <div className="px-8 py-8">
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-5"
            >
              {}
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Nom d'utilisateur"
                    value={formData.username}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                  />
                </div>
              )}

              {}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Adresse email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              {}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {}
              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                  />
                </div>
              )}

              {}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600">
                      Se souvenir de moi
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
              )}

              {}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "S'inscrire"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({
                      username: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      rememberMe: false,
                    });
                  }}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {isLogin ? "Créer un compte" : "Se connecter"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {}
        <p className="text-center text-gray-500 text-sm mt-6">
          En continuant, vous acceptez nos{" "}
          <a href="#" className="text-emerald-600 hover:underline">
            Conditions d&apos;utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="text-emerald-600 hover:underline">
            Politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  );
}
