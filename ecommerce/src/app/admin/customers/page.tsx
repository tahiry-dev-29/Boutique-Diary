"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Calendar,
  Loader2,
  Eye,
  User,
  Users,
  UserPlus,
  Clock,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
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

  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map((c) => c.id));
    }
  };

  const toggleSelectCustomer = (id: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    setIsBulkLoading(true);
    try {
      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedCustomers }),
      });

      if (!response.ok) throw new Error("Failed to delete");

      const data = await response.json();
      setCustomers((prev) =>
        prev.filter((c) => !selectedCustomers.includes(c.id)),
      );
      toast.success(`${selectedCustomers.length} clients supprimés`);
      setSelectedCustomers([]);
    } catch (error) {
      console.error("Error deleting customers:", error);
      toast.error("Erreur lors de la suppression groupée");
    } finally {
      setIsBulkLoading(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

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
    (customer) =>
      customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setCustomers((prev) => prev.filter((c) => c.id !== id));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalCustomers = customers.length;
  const newCustomers = customers.filter((c) => isNew(c.createdAt)).length;

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
        onRefresh={fetchCustomers}
        isLoading={loading}
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        {}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30 dark:bg-gray-900/50">
                <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent">
                  <TableHead className="w-12 text-center pl-4">
                    <Checkbox
                      checked={
                        selectedCustomers.length ===
                          paginatedCustomers.length &&
                        paginatedCustomers.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      className="rounded-md border-gray-300 data-[state=checked]:bg-black/90 data-[state=checked]:border-black"
                    />
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                    Client
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                    Email
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 hidden md:table-cell">
                    Date d&apos;inscription
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Search className="h-8 w-8 mb-2 opacity-20" />
                        <p>Aucun client trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`hover:bg-muted/30 cursor-pointer transition-colors border-b border-gray-100/50 dark:border-gray-700/50 ${
                        selectedCustomers.includes(customer.id)
                          ? "bg-blue-50/50 dark:bg-blue-900/20 shadow-[inset_4px_0_0_0_#3b82f6]"
                          : ""
                      }`}
                    >
                      <TableCell
                        className="pl-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() =>
                            toggleSelectCustomer(customer.id)
                          }
                          className="rounded-md border-gray-300 data-[state=checked]:bg-black/90 data-[state=checked]:border-black"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                            <AvatarImage
                              src={customer.photo || undefined}
                              alt={customer.username}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 text-xs font-bold">
                              {customer.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {customer.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-50" />
                          {formatDate(customer.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right pr-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmer la suppression
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                                  Voulez-vous vraiment supprimer ce client ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(customer.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
            <div className="text-sm text-gray-500">
              Affichage de{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)}
              </span>{" "}
              sur{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {filteredCustomers.length}
              </span>{" "}
              clients
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                Précédent
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <Sheet
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
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

      {}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white text-xl">
              Confirmer la suppression groupée
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer les {selectedCustomers.length}{" "}
              clients sélectionnés ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Supprimer ({selectedCustomers.length})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {}
      {selectedCustomers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-black/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
              <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
                {selectedCustomers.length}
              </div>
              <span className="text-sm font-medium text-white/90">
                Clients sélectionnés
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-400 hover:bg-rose-500/10 h-10 px-4 rounded-xl gap-2 transition-all active:scale-95 disabled:opacity-50"
                onClick={() => setIsBulkDeleteDialogOpen(true)}
                disabled={isBulkLoading}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
