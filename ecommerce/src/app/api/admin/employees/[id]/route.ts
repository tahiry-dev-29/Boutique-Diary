import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkApiPermission } from "@/lib/backend-permissions";
import { NextRequest, NextResponse } from "next/server";

// GET - Get single employee by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  try {
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const employee = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 },
    );
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  try {
    const id = parseInt(idStr);
    const body = await request.json();
    const { name, email, password, role, isActive } = body;

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check permission
    const permissionError = await checkApiPermission("employees.edit");
    if (permissionError) return permissionError;

    // Build update data
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const employee = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 },
    );
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  try {
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check permission
    const permissionError = await checkApiPermission("employees.edit");
    if (permissionError) return permissionError;

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting employee:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 },
    );
  }
}
