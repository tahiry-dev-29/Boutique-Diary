import React from "react";
import { prisma } from "@/lib/prisma";
import NewProductFormWrapper from "./NewProductFormWrapper";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <NewProductFormWrapper categories={categories} />
    </div>
  );
}
