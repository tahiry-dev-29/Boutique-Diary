// src/app/admin/customers/page.tsx
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { columns } from "./columns";
import { ClientDataTable } from "@/components/admin/ClientDataTable";
import { customerSchema } from "@/types/customer-schema";

// Helper function to get data
async function getCustomers() {
  // This is a placeholder for fetching data from an API.
  // We'll read from a local JSON file for now.
  const data = await fs.readFile(
    path.join(process.cwd(), "src/data/customers.json"),
    "utf-8",
  );

  const customers = JSON.parse(data);
  return z.array(customerSchema).parse(customers);
}

export default async function CustomerPage() {
  const customers = await getCustomers();

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Clients
          </h2>
          <p className="text-muted-foreground">Gestion des clients.</p>
        </div>
      </div>
      <ClientDataTable data={customers} columns={columns} />
    </div>
  );
}
