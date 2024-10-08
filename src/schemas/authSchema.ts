import { z } from "@hono/zod-openapi";

export const loginSchema = z.object({
  email: z.string().email().min(1, "Email is required").max(255).openapi({
    description: "The email of the user.",
    example: "user@mail.com",
  }),
  password: z.string().min(6, "Password is required").max(255).openapi({
    description: "The password of the user.",
    example: "secret",
  }),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required").max(255).openapi({
    description: "The name of the user.",
    example: "User",
  }),
});
