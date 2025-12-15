"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleConfig, DEFAULT_ROLES } from "@/lib/permissions-config";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availableRoles, setAvailableRoles] =
    useState<RoleConfig[]>(DEFAULT_ROLES);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    isActive: true,
  });

  useEffect(() => {
    fetchRoles();
    fetchEmployee();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/settings?key=admin_roles");
      if (response.ok) {
        const data = await response.json();
        if (data && data.value) {
          const roles = JSON.parse(data.value);
          setAvailableRoles(roles);
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/admin/employees/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const employee = await response.json();
      setFormData(prev => ({
        ...prev,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        isActive: employee.isActive,
      }));
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Impossible de charger les informations de l'employé");
      router.push("/admin/employees");
    } finally {
      setLoading(false);
    }
  };

  // ... handleChange and handleSubmit omitted for brevity as they don't change ...
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/employees/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Employé mis à jour avec succès");
      router.push("/admin/employees");
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/employees"
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Modifier un employé
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifier les informations et les accès
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div>
              <h3 className="font-medium text-foreground">Statut du compte</h3>
              <p className="text-sm text-muted-foreground">
                Désactiver pour bloquer l&apos;accès temporairement
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Rôle *
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none appearance-none"
                >
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 border-t border-border pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Changer le mot de passe
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Laisser vide pour conserver le mot de passe actuel.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nouveau mot de passe"
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <Link
              href="/admin/employees"
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
