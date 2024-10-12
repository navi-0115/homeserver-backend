import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z
    .string()
    .min(1, { message: "Product ID is required" })
    .openapi({ example: "c1m321312" }),
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .min(1, { message: "Quantity must be at least 1" })
    .openapi({ example: 2 }),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .min(1, { message: "Quantity must be at least 1" })
    .openapi({ example: 3 }),
});

export const itemIdSchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
});
