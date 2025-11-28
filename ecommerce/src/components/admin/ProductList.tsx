"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/admin";
import { formatPrice } from "@/lib/formatPrice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Trash2, Edit, Search, X } from "lucide-react";
import { toast } from "sonner";

interface ProductListProps {
  onEdit: (product: Product) => void;
  refreshTrigger: number;
}

export default function ProductList({
  onEdit,
  refreshTrigger,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Produit supprimé avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search term (Name or Reference)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      product.reference.toLowerCase().includes(searchLower);

    // Category
    const matchesCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;

    // Price range
    const price = product.price;
    const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);

    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min Ar"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max Ar"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24"
            />
          </div>

          {(searchTerm ||
            selectedCategory !== "all" ||
            minPrice ||
            maxPrice) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="px-2"
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Product Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-[10px]">
                          No img
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {product.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{product.reference}</TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="secondary">{product.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        Non classé
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.stock > 0 ? "outline" : "destructive"}
                      className={
                        product.stock > 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : ""
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Êtes-vous absolument sûr ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cela
                            supprimera définitivement le produit &quot;
                            {product.name}&quot; de la base de données.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              product.id && handleDelete(product.id)
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
