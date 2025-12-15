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
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Catégories
          </h2>
          <p className="text-muted-foreground">Gestion des catégories.</p>
        </div>
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
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
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
