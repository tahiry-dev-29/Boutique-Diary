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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: number;
  username: string;
  email: string;
  photo?: string | null;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (id: number) => {
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
    } finally {
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
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

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-100 dark:bg-gray-800 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Clients
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCustomers}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 dark:bg-gray-800 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nouveaux (30j)
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {newCustomers}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 dark:bg-gray-800 border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Taux de Nouveaux
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeRate}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="space-y-4">
        {}
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        {}
        <div className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200/50 dark:bg-gray-900/50">
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
                        <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                          <AvatarImage src={customer.photo || ""} />
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
                          onClick={() => {
                            setCustomerToDelete(customer.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-gray-400 hover:text-destructive"
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

        {}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-b-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {paginatedCustomers.length} sur{" "}
              {filteredCustomers.length} résultats
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
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

      {}
      <Sheet
        open={!!selectedCustomer}
        onOpenChange={open => !open && setSelectedCustomer(null)}
      >
        <SheetContent className="sm:max-w-md bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-6 shadow-xl">
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
                <Avatar className="h-24 w-24 border-4 border-gray-200 dark:border-gray-700">
                  <AvatarImage src={selectedCustomer.photo || ""} />
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

      {}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white text-xl">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => customerToDelete && handleDelete(customerToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
