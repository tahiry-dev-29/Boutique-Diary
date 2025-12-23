import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/backend-permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeesListClient } from "@/components/admin/employees/employees-list-client";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function EmployeesPage() {
  const admin = await verifyAdminToken();

  if (!admin) {
    redirect("/admin/login?message=not-authenticated");
  }

  const canView = await hasPermission(admin.role, "employees.view");

  if (!canView) {
    redirect("/admin?message=employees-access-denied");
  }

  const canEdit = await hasPermission(admin.role, "employees.edit");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des employés"
        description="Gérer les comptes administrateurs"
      >
        {canEdit && (
          <Link
            href="/admin/employees/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus size={18} />
            Ajouter un employé
          </Link>
        )}
      </PageHeader>

      <EmployeesListClient />
    </div>
  );
}
