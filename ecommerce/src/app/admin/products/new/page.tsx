import React from "react";
import { prisma } from "@/lib/prisma";
import NewProductFormWrapper from "./NewProductFormWrapper";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <NewProductFormWrapper categories={categories} />
      </div>
    </div>
  );
}
