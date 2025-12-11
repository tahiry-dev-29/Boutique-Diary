"use client";

import React from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Trash2, Edit, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProductTableProps {
  products: Product[];
  expandedProductId: number | null;
  onToggleExpand: (productId: number | null) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

export function ProductTable({
  products,
  expandedProductId,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const calculateTotalStock = (product: Product): number => {
    return (
      product.images?.reduce((sum, img) => {
        const imgStock = typeof img === "string" ? 0 : img.stock || 0;
        return sum + imgStock;
      }, 0) || 0
    );
  };

  if (products.length === 0) {
    return (
      <div className="rounded-md border bg-background">
        <EmptyState
          variant="search"
          title="Aucun produit trouvé"
          description="Aucun produit ne correspond à vos critères de recherche."
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
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
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <TableRow
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  onToggleExpand(
                    expandedProductId === product.id
                      ? null
                      : (product.id ?? null),
                  )
                }
              >
                <TableCell>
                  <div className="text-muted-foreground">
                    {expandedProductId === product.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {product.images && product.images[0] ? (
                    <div className="relative">
                      <img
                        src={
                          typeof product.images[0] === "string"
                            ? product.images[0]
                            : product.images[0].url
                        }
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded-md"
                      />
                      {product.images.length > 1 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {product.images.length}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground text-[10px]">
                        No img
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div>{product.name}</div>
                  {product.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {product.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>{product.reference}</TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="secondary">{product.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">
                      Non classé
                    </span>
                  )}
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  {(() => {
                    const totalStock = calculateTotalStock(product);
                    return (
                      <Badge
                        variant={totalStock > 0 ? "outline" : "destructive"}
                        className={
                          totalStock > 0
                            ? "bg-green-50 text-green-700 border-green-200"
                            : ""
                        }
                      >
                        {totalStock}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(product);
                    }}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product);
                    }}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Êtes-vous absolument sûr ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Cela supprimera
                          définitivement le produit &quot;{product.name}&quot;
                          de la base de données.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => product.id && onDelete(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>

              {}
              {expandedProductId === product.id &&
                product.images &&
                product.images.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <div className="bg-muted/30 border-t border-b p-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          Images du produit ({product.images.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                          {product.images.map((img, index) => {
                            const imageData =
                              typeof img === "string" ? { url: img } : img;
                            return (
                              <div
                                key={index}
                                className="bg-background rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
                              >
                                <div className="aspect-square relative">
                                  <img
                                    src={imageData.url}
                                    alt={`${product.name} - Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {index === 0 && (
                                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                                      Principal
                                    </span>
                                  )}
                                </div>
                                <div className="p-2 space-y-1">
                                  {imageData.reference && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">
                                        Réf:
                                      </span>
                                      <span className="text-xs font-bold text-primary">
                                        {imageData.reference}
                                      </span>
                                    </div>
                                  )}
                                  {imageData.color && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">
                                        Couleur:
                                      </span>
                                      <span className="text-xs font-medium">
                                        {imageData.color}
                                      </span>
                                    </div>
                                  )}
                                  {imageData.sizes &&
                                    imageData.sizes.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="text-xs text-muted-foreground">
                                          Tailles:
                                        </span>
                                        {imageData.sizes.map(
                                          (size: string, i: number) => (
                                            <span
                                              key={i}
                                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                                            >
                                              {size}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  {imageData.price !== undefined &&
                                    imageData.price !== null && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">
                                          Prix:
                                        </span>
                                        <span className="text-xs font-bold text-primary">
                                          {formatPrice(imageData.price)}
                                        </span>
                                      </div>
                                    )}
                                  {imageData.stock !== undefined &&
                                    imageData.stock !== null && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">
                                          Stock:
                                        </span>
                                        <span
                                          className={`text-xs font-medium ${
                                            imageData.stock > 0
                                              ? "text-green-600"
                                              : "text-destructive"
                                          }`}
                                        >
                                          {imageData.stock}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
