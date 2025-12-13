// src/app/admin/customers/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Calendar,
  Loader2,
  Trash2,
  Eye,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

interface Customer {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    customer =>
      customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success("Client supprimé avec succès");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Erreur lors de la suppression");
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
    <div className="flex h-full flex-1 flex-col space-y-6 p-8">
      <PageHeader
        title="Clients"
        description={`${customers.length} client(s) enregistré(s)`}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
        />
      </div>

      {/* Customers table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white hidden md:table-cell">
                  Date d&apos;inscription
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map(customer => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {customer.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail size={14} />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} />
                      {new Date(customer.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
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

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {customers.length === 0
                ? "Aucun client enregistré"
                : "Aucun client trouvé avec ces critères"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
