"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PromotionTable } from "@/features/marketing/components/PromotionRulesManagement/PromotionTable";
import { PromotionRuleForm } from "@/features/marketing/components/PromotionRulesManagement/PromotionRuleForm";
import { usePromotionRules } from "@/features/marketing/hooks/use-promotion-rules";
import { PromotionRule } from "@/features/marketing/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PromotionRulesPage() {
  const {
    rules,
    loading,
    createRule,
    updateRule,
    deleteRule,
    applyRule,
    revertRule,
  } = usePromotionRules();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PromotionRule | null>(null);

  const handleCreate = () => {
    setSelectedRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: PromotionRule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRule(null);
  };

  const handleSubmit = async (data: any) => {
    let success = false;
    if (selectedRule) {
      success = await updateRule(selectedRule.id, data);
    } else {
      success = await createRule(data);
    }

    if (success) {
      closeModal();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Règles de Promotion"
          description="Configurez des règles automatiques de réductions (ex: 3 pour 2)."
        />
        <Button
          onClick={handleCreate}
          className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Règle
        </Button>
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
        <PromotionTable
          data={rules}
          onEdit={handleEdit}
          onDelete={deleteRule}
          onApply={applyRule}
          onRevert={revertRule}
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRule
                ? "Modifier la règle"
                : "Créer une règle de promotion"}
            </DialogTitle>
            <DialogDescription>
              Définir les conditions et les actions de la promotion dans le
              selecteur.
            </DialogDescription>
          </DialogHeader>

          <PromotionRuleForm
            initialData={selectedRule}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
