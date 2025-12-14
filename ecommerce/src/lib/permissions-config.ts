export const ALL_PERMISSIONS = [
  { id: "products.view", label: "Voir les produits" },
  { id: "products.edit", label: "Modifier les produits" },
  { id: "products.delete", label: "Supprimer les produits" },
  { id: "orders.view", label: "Voir les commandes" },
  { id: "orders.edit", label: "Modifier les commandes" },
  { id: "customers.view", label: "Voir les clients" },
  { id: "customers.edit", label: "Modifier les clients" },
  { id: "employees.view", label: "Voir les employés" },
  { id: "employees.edit", label: "Modifier les employés" },
  { id: "reports.view", label: "Voir les rapports" },
  { id: "settings.view", label: "Voir les paramètres" },
  { id: "settings.edit", label: "Modifier les paramètres" },
  { id: "appearance.edit", label: "Modifier l'apparence" },
] as const;

export interface RoleConfig {
  id: string;
  name: string;
  permissions: string[];
}

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: "superadmin",
    name: "superadmin", // matches DB role string
    permissions: ALL_PERMISSIONS.map((p) => p.id),
  },
  {
    id: "admin",
    name: "admin",
    permissions: ALL_PERMISSIONS
      .filter((p) => !p.id.includes("employees"))
      .map((p) => p.id),
  },
  {
    id: "manager",
    name: "manager",
    permissions: [
      "products.view",
      "products.edit",
      "orders.view",
      "orders.edit",
      "customers.view",
      "reports.view",
    ],
  },
  {
    id: "employee",
    name: "employee",
    permissions: ["products.view", "orders.view", "customers.view"],
  },
];
