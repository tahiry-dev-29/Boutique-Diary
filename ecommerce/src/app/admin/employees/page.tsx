"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MANAGER:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EMPLOYEE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
};

// Mock data
const mockEmployees: Employee[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@boutique.com",
    role: "SUPER_ADMIN",
    phone: "+261 34 00 000 00",
    createdAt: "2024-01-15",
    isActive: true,
  },
  {
    id: "2",
    username: "manager1",
    email: "manager@boutique.com",
    role: "MANAGER",
    phone: "+261 34 11 111 11",
    createdAt: "2024-03-20",
    isActive: true,
  },
  {
    id: "3",
    username: "employee1",
    email: "employee@boutique.com",
    role: "EMPLOYEE",
    createdAt: "2024-06-10",
    isActive: false,
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || emp.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestion des employés
          </h1>
          <p className="text-muted-foreground mt-1">
            {employees.length} employé(s) au total
          </p>
        </div>
        <Link
          href="/admin/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus size={18} />
          Ajouter un employé
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
          />
        </div>

        {/* Role filter */}
        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
        >
          <option value="all">Tous les rôles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Administrateur</option>
          <option value="MANAGER">Manager</option>
          <option value="EMPLOYEE">Employé</option>
        </select>
      </div>

      {/* Employees table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Employé
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden lg:table-cell">
                  Date d&apos;ajout
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map(employee => (
                <tr
                  key={employee.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {employee.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {employee.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[employee.role]}`}
                    >
                      {roleLabels[employee.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} />
                      {employee.email}
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone size={14} />
                        {employee.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {new Date(employee.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        employee.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {employee.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/employees/roles"
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Gestion des rôles
              </h3>
              <p className="text-sm text-muted-foreground">
                Configurer les permissions
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/employees/new"
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Ajouter un employé
              </h3>
              <p className="text-sm text-muted-foreground">
                Créer un nouveau compte
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
