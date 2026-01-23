"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { PromoCodeTable } from "@/features/marketing/components/PromoCodeManagement/PromoCodeTable";
import { PromoCodeForm } from "@/features/marketing/components/PromoCodeManagement/PromoCodeForm";
import { usePromoCodes } from "@/features/marketing/hooks/use-promo-codes";
import { PromoCode } from "@/features/marketing/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function PromoCodesPage() {
  const {
    promoCodes,
    loading,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    refresh,
  } = usePromoCodes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);

  const handleCreate = () => {
    setSelectedCode(null);
    setIsModalOpen(true);
  };

  const handleEdit = (code: PromoCode) => {
    setSelectedCode(code);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCode(null);
  };

  const handleSubmit = async (data: any) => {
    let success = false;
    if (selectedCode) {
      success = await updatePromoCode(selectedCode.id, data);
    } else {
      success = await createPromoCode(data);
    }

    if (success) {
      closeModal();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Codes Promo"
          description="Gérez les codes de réduction pour vos clients."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Actualiser
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Code
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <PromoCodeTable
          data={promoCodes}
          onEdit={handleEdit}
          onDelete={deletePromoCode}
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCode ? "Modifier le code promo" : "Créer un code promo"}
            </DialogTitle>
            <DialogDescription>
              {selectedCode
                ? "Modifiez les détails du code de réduction existant."
                : "Configurez un nouveau code de réduction pour vos clients."}
            </DialogDescription>
          </DialogHeader>

          <PromoCodeForm
            initialData={selectedCode}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
