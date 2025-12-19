

export type Role = "Admin" | "User" | "SuperAdmin";

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  avatar?: string; 
}


export const roles = [
  {
    value: "User",
    label: "User",
    icon: "/icons/user.svg", 
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
