import React from "react";
import { TopProduct } from "../../types/products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductPerformanceTableProps {
  products: TopProduct[];
}

export function ProductPerformanceTable({
  products,
}: ProductPerformanceTableProps) {
  return (
    <div className="rounded-md border border-gray-100 dark:border-gray-800">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead className="text-right">Ventes</TableHead>
            <TableHead className="text-right">CA Généré</TableHead>
            <TableHead className="text-right">Stock Actuel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-gray-500">
                {product.reference}
              </TableCell>
              <TableCell className="text-right font-bold">
                {product.totalSold}
              </TableCell>
              <TableCell className="text-right text-gray-500">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "MGA",
                  maximumFractionDigits: 0,
                }).format(product.revenue)}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant="secondary"
                  className={`${
                    product.stock > 0
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                  }`}
                >
                  {product.stock}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                Aucune donnée de vente
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
