import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/backend-permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeesRolesClient } from "@/components/admin/employees/employees-roles-client";

export default async function RolesPage() {
  const admin = await verifyAdminToken();

  if (!admin) {
    redirect("/admin/login?message=not-authenticated");
  }

  const canView = await hasPermission(admin.role, "employees.view");

  if (!canView) {
    redirect("/admin?message=employees-access-denied");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des rôles"
        description="Configurez les permissions pour chaque rôle"
        backHref="/admin/employees"
      />

      <EmployeesRolesClient />
    </div>
  );
}
