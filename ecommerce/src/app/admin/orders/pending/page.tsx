import { PageHeader } from "@/components/admin/PageHeader";

export default function PlaceholderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes en attente"
        description="Gérer les commandes en attente de traitement"
        backHref="/admin/orders"
      />

      <div className="flex items-center justify-center h-[40vh] flex-col gap-4 border rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border-dashed">
        <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-3xl">🚧</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Page en construction
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Cette section de l&apos;interface d&apos;administration est en cours
            de développement. Revenez bientôt !
          </p>
        </div>
      </div>
    </div>
  );
}
