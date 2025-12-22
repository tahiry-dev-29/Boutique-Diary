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
  Users,
  UserPlus,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Customer {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}
// ... (rest of the file remains, I need to match the context chunks)

// I will use replace_file_content carefully.
// I need TWO chunks: one for interface, one for the JSX.
// Since replace_file_content only does ONE chunk per call (unless using multi), I will use multi_replace.
// Wait, the tool is replace_file_content (singular) in the list but I have multi_replace_file_content.
// I will use multi_replace_file_content.

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const isNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => isNew(c.createdAt)).length;

  const activeRate =
    totalCustomers > 0 ? Math.round((newCustomers / totalCustomers) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-6">
      <PageHeader
        title="Clients"
        description="Gérez votre base de clients et consultez leurs informations"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Clients
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {totalCustomers}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nouveaux (30j)
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {newCustomers}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Taux de Nouveaux
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {activeRate}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset pagination on search
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">
                    Date d&apos;inscription
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {customer.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground flex items-center gap-2">
                            {customer.username}
                            {isNew(customer.createdAt) && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5 py-0 h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none"
                              >
                                Nouveau
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail size={14} />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {new Date(customer.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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

          {paginatedCustomers.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {customers.length === 0
                  ? "Aucun client enregistré"
                  : "Aucun client trouvé avec ces critères"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-card rounded-b-xl">
            <div className="text-sm text-muted-foreground">
              Affichage de {paginatedCustomers.length} sur{" "}
              {filteredCustomers.length} résultats
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar (Sheet) */}
      <Sheet
        open={!!selectedCustomer}
        onOpenChange={open => !open && setSelectedCustomer(null)}
      >
        <SheetContent className="sm:max-w-md bg-background dark:bg-background border-l border-border text-foreground p-6 shadow-xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">
              Détails du client
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Informations détaillées sur le compte client.
            </SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-muted">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {selectedCustomer.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedCustomer.username}
                  </h3>
                  <p className="text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                    <Mail size={14} />
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                    Date d&apos;inscription
                  </p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar size={16} className="text-muted-foreground" />
                    {new Date(selectedCustomer.createdAt).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                    ID Client
                  </p>
                  <p className="text-foreground font-mono text-sm tracking-wider">
                    #{selectedCustomer.id.toString().padStart(6, "0")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground">Commandes</p>
                    <p className="text-lg font-bold">
                      {selectedCustomer.ordersCount}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground">Dépensé</p>
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("fr-MG", {
                        style: "currency",
                        currency: "MGA",
                        maximumFractionDigits: 0,
                      }).format(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
