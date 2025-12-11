"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Search, User, Mail, Calendar } from "lucide-react";

interface Customer {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

interface CustomerListProps {
  refreshTrigger?: number;
}

export default function CustomerList({ refreshTrigger }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error("Erreur lors du chargement des clients");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Client supprimé avec succès");
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      } else {
        const data = await response.json();
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Clients ({customers.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez vos clients inscrits
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {customers.length === 0
              ? "Aucun client inscrit pour le moment"
              : "Aucun client ne correspond à votre recherche"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date d&apos;inscription
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                        {customer.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {customer.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {customer.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(customer.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={deletingId === customer.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === customer.id ? (
                        <div className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
