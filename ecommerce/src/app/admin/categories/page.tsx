"use client";

import React, { useState } from "react";
import CategoryList from "@/components/admin/CategoryList";
import CategoryForm from "@/components/admin/CategoryForm";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Catégories
        </h1>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-black text-white hover:bg-gray-800 rounded-lg gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <CategoryForm
            category={selectedCategory}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedCategory(null);
            }}
          />
        </div>
      ) : (
        <CategoryList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
}
