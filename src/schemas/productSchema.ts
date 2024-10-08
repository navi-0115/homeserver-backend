// products/schema.ts
import { z } from "@hono/zod-openapi";

//Creating product
export const createProductSchema = z.object({
  name: z
    .string()
    .min(6, "Name is required")
    .openapi({ example: "Rasberry Pi 5" }),
  price: z
    .number()
    .min(0, "Price must be greater than 0")
    .openapi({ example: 120000 }),
  description: z.string().optional().openapi({
    example:
      "With 2–3× the speed of the previous generation, and featuring silicon designed in‑house for the best possible performance, we’ve redefined the Raspberry Pi experience.",
  }),
  // image: z.string().url().optional().openapi({
  //   example: "https://studio.youtube.com/channel/UCp_B66Jg1nCh04bdciEaXJg",
  // }),
  stock: z
    .number()
    .min(0, "Stock must be greater than 0")
    .openapi({ example: 5 }),
});

//Updating product
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(6, "Name is required")
    .openapi({ example: "Rasberry Pi 5" }),
  price: z
    .number()
    .min(0, "Price must be greater than 0")
    .openapi({ example: 120000 }),
  description: z.string().optional(),
  // imageURL: z.string().url().optional().openapi({
  //   example: "https://studio.youtube.com/channel/UCp_B66Jg1nCh04bdciEaXJg",
  // }),
  stock: z
    .number()
    .min(0, "Stock must be greater than 0")
    .openapi({ example: 5 }),
});

// for product id schema
export const productIdSchema = z.object({
  id: z.coerce.string().min(1),
});

// for product slug schema
export const productSlugSchema = z.object({
  slug: z
    .string()
    .min(5)
    .regex(/^[a-z0-9-]+$/, { message: "Invalid slug!" })
    .openapi({ example: "raspberry-pi-5" }),
});
