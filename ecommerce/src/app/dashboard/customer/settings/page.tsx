"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Camera,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    photo: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          username: data.user.username,
          email: data.user.email,
          photo: data.user.photo || "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          photo: formData.photo,
          password: formData.password || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Profil mis à jour avec succès");

        fetchUser();
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Chargement de votre profil...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Paramètres du Compte
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Gérez vos informations personnelles et la sécurité de votre compte
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[32px] p-8 text-center flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={formData.photo} />
                <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                  {formData.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 p-2.5 bg-background border border-border rounded-full shadow-lg text-foreground hover:bg-muted transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">
                {formData.username}
              </h2>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
            <div className="w-full h-px bg-border my-2" />
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={14} />
              Compte client vérifié
            </div>
          </div>
        </div>

        {}
        <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <User size={20} className="text-primary" />
                Informations Personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      required
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Adresse E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <Lock size={20} className="text-primary" />
                Sécurité & Mot de Passe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium pl-1 italic">
                Laissez vide si vous ne souhaitez pas modifier votre mot de
                passe.
              </p>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <Button
                disabled={isSubmitting}
                className="rounded-xl px-10 h-14 font-black text-lg bg-black text-white hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
