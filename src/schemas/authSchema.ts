import { z } from "zod";

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(3).openapi({ example: "budi server" }),
  email: z.string().email().openapi({ example: "budi@example.com" }),
  password: z.string().min(8),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email().openapi({ example: "budi@example.com" }),
  password: z.string(),
});
