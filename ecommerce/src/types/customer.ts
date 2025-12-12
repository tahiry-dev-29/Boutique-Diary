// src/types/customer.ts

export type Role = "Admin" | "User" | "SuperAdmin";

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  avatar?: string; // Optional avatar URL
}

// You can also define roles with more structure if needed
export const roles = [
  {
    value: "User",
    label: "User",
    icon: "/icons/user.svg", // Example icon path
  },
  {
    value: "Admin",
    label: "Admin",
    icon: "/icons/admin.svg",
  },
  {
    value: "SuperAdmin",
    label: "Super Admin",
    icon: "/icons/super-admin.svg",
  },
];
