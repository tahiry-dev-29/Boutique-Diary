"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  XCircle,
  Loader2,
  Save,
  Check,
  TrendingUp,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InventoryAuditModal } from "@/components/admin/InventoryAuditModal";

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface StockProduct {
  id: number;
  name: string;
  reference: string;
  stock: number;
  price: number;
  category: { name: string } | null;
  images: StockImage[];
}

interface StockImage {
  id: number;
  color: string | null;
  stock: number | null;
  url: string;
  reference: string | null;
}

interface AuditItem {
  uniqueId: string;
  productId: number;
  imageId: number | null;
  name: string;
  reference: string;
  variant: string;
  stock: number;
  image: string;
}

type SortConfig = {
  key: keyof AuditItem | "status" | null;
  direction: "asc" | "desc";
};

export default function StockPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounceValue(searchQuery, 500);

  // Pagination State
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({
    totalValue: 0,
    lowStock: 0,
    outStock: 0,
  });

  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const [updating, setUpdating] = useState<number | null>(null);
  const [modifiedStocks, setModifiedStocks] = useState<Record<string, number>>(
    {},
  );
  const [auditItem, setAuditItem] = useState<AuditItem | null>(null);

  useEffect(() => {
    fetchStock();
  }, [page, debouncedSearch]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        search: debouncedSearch,
      });

      const response = await fetch(`/api/admin/stock?${params}`);
      if (!response.ok) throw new Error("Failed to fetch stock");

      const result = await response.json();

      if (Array.isArray(result)) {
        setProducts(result);
      } else {
        setProducts(result.data);
        setMeta(result.meta);
        if (result.stats) setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast.error("Erreur lors du chargement des stocks");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (
    productId: number,
    imageId: number | null,
    currentStock: number,
  ) => {
    const uniqueId = imageId ? `i-${imageId}` : `p-${productId}`;
    const newStock = modifiedStocks[uniqueId];

    if (newStock === undefined || newStock === currentStock) return;

    try {
      setUpdating(imageId || productId);
      const response = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          imageId,
          newStock,
          type: "ADJUSTMENT",
          reason: "Quick Edit",
          note: "Updated from list",
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const result = await response.json();

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            let updatedProduct = { ...p };
            if (result.totalStock !== undefined)
              updatedProduct.stock = result.totalStock;
            if (!imageId && result.newStock !== undefined)
              updatedProduct.stock = result.newStock;

            if (imageId) {
              updatedProduct.images = p.images.map((img) =>
                img.id === imageId ? { ...img, stock: newStock } : img,
              );
            }
            return updatedProduct;
          }
          return p;
        }),
      );

      const { [uniqueId]: _, ...rest } = modifiedStocks;
      setModifiedStocks(rest);
      toast.success("Stock mis à jour");

      fetchStock();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Erreur mise à jour");
    } finally {
      setUpdating(null);
    }
  };

  const handleAuditConfirm = async (data: {
    newStock: number;
    reason: string;
    note: string;
  }) => {
    if (!auditItem) return;
    const { newStock, reason, note } = data;
    const { productId, imageId } = auditItem;

    try {
      const response = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          imageId,
          newStock,
          type: "ADJUSTMENT",
          reason,
          note,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");
      const result = await response.json();

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            let updatedProduct = { ...p };
            if (result.totalStock !== undefined)
              updatedProduct.stock = result.totalStock;
            if (!imageId && result.newStock !== undefined)
              updatedProduct.stock = result.newStock;
            if (imageId) {
              updatedProduct.images = p.images.map((img) =>
                img.id === imageId ? { ...img, stock: newStock } : img,
              );
            }
            return updatedProduct;
          }
          return p;
        }),
      );
      toast.success("Inventaire ajusté avec succès");
      const uniqueId = imageId ? `i-${imageId}` : `p-${productId}`;
      if (modifiedStocks[uniqueId] !== undefined) {
        const { [uniqueId]: _, ...rest } = modifiedStocks;
        setModifiedStocks(rest);
      }

      fetchStock();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'audit");
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Rupture",
        color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
        icon: XCircle,
      };
    if (stock < 5)
      return {
        label: "Faible",
        color:
          "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
        icon: AlertTriangle,
      };
    return {
      label: "En Stock",
      color:
        "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
      icon: Check,
    };
  };

  const flattenItems = React.useMemo(() => {
    return products.flatMap(
      (
        p,
      ): (AuditItem & { type: string; price: number; category?: string })[] => {
        if (p.images && p.images.length > 0) {
          const stockImages = p.images.filter((img) => img.stock !== null);
          if (stockImages.length > 0) {
            return stockImages.map((img) => ({
              type: "variation",
              uniqueId: `i-${img.id}`,
              productId: p.id,
              imageId: img.id,
              name: p.name,
              reference: img.reference || p.reference,
              variant: img.color || "Standard",
              stock: img.stock || 0,
              price: p.price,
              image: img.url,
              category: p.category?.name,
            }));
          }
        }
        return [
          {
            type: "product",
            uniqueId: `p-${p.id}`,
            productId: p.id,
            imageId: null,
            name: p.name,
            reference: p.reference,
            variant: "-",
            stock: p.stock,
            price: p.price,
            image: p.images?.[0]?.url || "/placeholder.png",
            category: p.category?.name,
          },
        ];
      },
    );
  }, [products]);

  const handleSort = (key: keyof AuditItem | "status") => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedItems = React.useMemo(() => {
    if (!sortConfig.key) return flattenItems;

    return [...flattenItems].sort((a, b) => {
      let valA, valB;

      if (sortConfig.key === "status") {
        valA = a.stock;
        valB = b.stock;
      } else {
        valA = a[sortConfig.key as keyof AuditItem];
        valB = b[sortConfig.key as keyof AuditItem];
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (valA! < valB!) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA! > valB!) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [flattenItems, sortConfig]);

  const goToPage = (newPage: number) => {
    setPage(Math.min(Math.max(1, newPage), meta.totalPages));
  };

  return (
    <div className="flex h-full flex-1 flex-col space-y-6">
      <PageHeader
        title="Gestion des Stocks"
        description="Suivez et mettez à jour l'inventaire de vos produits"
        onRefresh={fetchStock}
        isLoading={loading}
      />

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
              <TrendingUp size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valeur du Stock
              </p>
              <h3
                className="text-2xl font-bold text-gray-900 dark:text-white truncate"
                title={new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "MGA",
                }).format(stats.totalValue)}
              >
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "MGA",
                  maximumFractionDigits: 0,
                }).format(stats.totalValue)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Stock Faible
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lowStock}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 shrink-0">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Rupture
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.outStock}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou référence..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th
                    className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Produit
                      {sortConfig.key === "name" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown
                          size={14}
                          className="text-muted-foreground opacity-50"
                        />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort("reference")}
                  >
                    <div className="flex items-center gap-2">
                      Référence
                      {sortConfig.key === "reference" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown
                          size={14}
                          className="text-muted-foreground opacity-50"
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Variation
                  </th>
                  <th
                    className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      État
                      {sortConfig.key === "status" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown
                          size={14}
                          className="text-muted-foreground opacity-50"
                        />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white w-40 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort("stock")}
                  >
                    <div className="flex items-center gap-2">
                      Stock
                      {sortConfig.key === "stock" ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ArrowUpDown
                          size={14}
                          className="text-muted-foreground opacity-50"
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedItems.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      Aucun produit trouvé
                    </td>
                  </tr>
                )}
                {sortedItems.map((item) => {
                  const status = getStockStatus(item.stock);
                  const StatusIcon = status.icon;
                  const isModified =
                    modifiedStocks[item.uniqueId] !== undefined;
                  const currentValue = isModified
                    ? modifiedStocks[item.uniqueId]
                    : item.stock;

                  return (
                    <tr
                      key={item.uniqueId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {item.reference}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.variant !== "-" ? (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                          >
                            {item.variant}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1.5",
                            status.color,
                          )}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            className={cn(
                              "w-20 h-9 text-center bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-primary",
                              isModified &&
                                "ring-2 ring-blue-500 border-blue-500",
                            )}
                            value={currentValue}
                            onChange={(e) =>
                              setModifiedStocks((prev) => ({
                                ...prev,
                                [item.uniqueId]: parseInt(e.target.value) || 0,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateStock(
                                  item.productId,
                                  item.imageId,
                                  item.stock,
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isModified ? (
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() =>
                                handleUpdateStock(
                                  item.productId,
                                  item.imageId,
                                  item.stock,
                                )
                              }
                              disabled={
                                updating === (item.imageId || item.productId)
                              }
                            >
                              {updating === (item.imageId || item.productId) ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Save size={14} />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-600"
                              onClick={() => setAuditItem(item as AuditItem)}
                            >
                              <ClipboardList size={16} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de page <span className="font-medium">{page}</span> sur{" "}
              <span className="font-medium">{meta.totalPages}</span> (
              {meta.total} produits)
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from(
                  { length: Math.min(5, meta.totalPages) },
                  (_, i) => {
                    let pageNum: number;
                    if (meta.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= meta.totalPages - 2) {
                      pageNum = meta.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  },
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(page + 1)}
                disabled={page === meta.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(meta.totalPages)}
                disabled={page === meta.totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <InventoryAuditModal
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        item={auditItem}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
}
