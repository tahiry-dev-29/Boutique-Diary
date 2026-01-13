import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["Admin", "User", "SuperAdmin"]),
  createdAt: z.string().datetime(),
  avatar: z.string().url().optional(),
});
