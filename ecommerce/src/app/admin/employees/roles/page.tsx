"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Check,
  X,
  Edit,
  Save,
  Users,
  ShoppingBag,
  ShoppingCart,
  BarChart,
  Settings,
  Palette,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Permission {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  permissions: string[];
  isEditable: boolean;
}

const allPermissions: Permission[] = [
  { id: "products.view", label: "Voir les produits", icon: ShoppingBag },
  { id: "products.edit", label: "Modifier les produits", icon: ShoppingBag },
  { id: "products.delete", label: "Supprimer les produits", icon: ShoppingBag },
  { id: "orders.view", label: "Voir les commandes", icon: ShoppingCart },
  { id: "orders.edit", label: "Modifier les commandes", icon: ShoppingCart },
  { id: "customers.view", label: "Voir les clients", icon: Users },
  { id: "customers.edit", label: "Modifier les clients", icon: Users },
  { id: "employees.view", label: "Voir les employés", icon: Users },
  { id: "employees.edit", label: "Modifier les employés", icon: Users },
  { id: "reports.view", label: "Voir les rapports", icon: BarChart },
  { id: "settings.view", label: "Voir les paramètres", icon: Settings },
  { id: "settings.edit", label: "Modifier les paramètres", icon: Settings },
  { id: "appearance.edit", label: "Modifier l'apparence", icon: Palette },
];

const defaultRoles: Role[] = [
  {
    id: "superadmin",
    name: "superadmin",
    label: "Super Admin",
    description: "Accès complet à toutes les fonctionnalités",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    permissions: allPermissions.map(p => p.id),
    isEditable: false,
  },
  {
    id: "admin",
    name: "admin",
    label: "Administrateur",
    description: "Gestion complète sauf création d'admins",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    permissions: allPermissions
      .filter(p => !p.id.includes("employees"))
      .map(p => p.id),
    isEditable: true,
  },
  {
    id: "manager",
    name: "manager",
    label: "Manager",
    description: "Gestion des produits, commandes et clients",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    permissions: [
      "products.view",
      "products.edit",
      "orders.view",
      "orders.edit",
      "customers.view",
      "reports.view",
    ],
    isEditable: true,
  },
  {
    id: "employee",
    name: "employee",
    label: "Employé",
    description: "Consultation des données uniquement",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    permissions: ["products.view", "orders.view", "customers.view"],
    isEditable: true,
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/settings?key=admin_roles");
      if (response.ok) {
        const data = await response.json();
        // If roles exist in DB, parse/use them
        if (data && data.value) {
          try {
            const parsedRoles = JSON.parse(data.value);
            // Ensure superadmin is never editable and has all permissions
            const securedRoles = parsedRoles.map((r: Role) =>
              r.id === "superadmin"
                ? {
                    ...r,
                    isEditable: false,
                    permissions: allPermissions.map(p => p.id),
                  }
                : r,
            );
            setRoles(securedRoles);
          } catch (e) {
            console.error("Failed to parse roles config", e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Erreur lors du chargement des rôles");
    } finally {
      setLoading(false);
    }
  };

  const saveRolesConfig = async (newRoles: Role[]) => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "admin_roles",
          value: JSON.stringify(newRoles),
        }),
      });

      if (!response.ok) throw new Error("Failed to save roles");
      toast.success("Configuration des rôles enregistrée");
    } catch (error) {
      console.error("Error saving roles:", error);
      toast.error("Erreur lors de la sauvegarde");
      // Revert changes on error?
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (role: Role) => {
    setEditingRole(role.id);
    setEditedPermissions([...role.permissions]);
  };

  const cancelEditing = () => {
    setEditingRole(null);
    setEditedPermissions([]);
  };

  const saveEditing = async () => {
    const updatedRoles = roles.map(role =>
      role.id === editingRole
        ? { ...role, permissions: editedPermissions }
        : role,
    );

    setRoles(updatedRoles);
    setEditingRole(null);
    setEditedPermissions([]);

    // Persist to DB
    await saveRolesConfig(updatedRoles);
  };

  const togglePermission = (permId: string) => {
    setEditedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId],
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="text-primary" size={28} />
            Gestion des rôles
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez les permissions pour chaque rôle
          </p>
        </div>
        <Link
          href="/admin/employees"
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Retour aux employés
        </Link>
      </div>

      {/* Roles grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map(role => {
          const isEditing = editingRole === role.id;
          const currentPermissions = isEditing
            ? editedPermissions
            : role.permissions;

          return (
            <div
              key={role.id}
              className={`bg-card border rounded-xl overflow-hidden transition-all ${
                isEditing
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {/* Role header */}
              <div className="p-4 bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}
                  >
                    {role.label}
                  </span>
                  {!role.isEditable && (
                    <span className="text-xs text-muted-foreground">
                      (non modifiable)
                    </span>
                  )}
                </div>
                {role.isEditable && !isEditing && (
                  <button
                    onClick={() => startEditing(role)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Modifier les permissions"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      title="Annuler"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={saveEditing}
                      disabled={saving}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                      title="Enregistrer"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>

              {/* Permissions */}
              <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                {allPermissions.map(perm => {
                  const hasPermission = currentPermissions.includes(perm.id);
                  const Icon = perm.icon;

                  return (
                    <div
                      key={perm.id}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isEditing
                          ? "hover:bg-muted cursor-pointer"
                          : "opacity-80"
                      }`}
                      onClick={() => isEditing && togglePermission(perm.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {perm.label}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                          hasPermission
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {hasPermission ? <Check size={12} /> : <X size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="px-4 py-3 bg-muted/30 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {currentPermissions.length} / {allPermissions.length}{" "}
                  permissions actives
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield
            className="text-blue-600 dark:text-blue-400 mt-0.5"
            size={20}
          />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">
              Informations sur les rôles
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Le rôle <strong>Super Admin</strong> a un accès complet et ne peut
              pas être modifié. Seul un Super Admin peut créer ou modifier
              d&apos;autres administrateurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
