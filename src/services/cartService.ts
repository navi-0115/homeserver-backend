import prisma from "../../prisma/client";
import { z } from "@hono/zod-openapi";
import {
  getProductSchema,
  addProductToCartSchema,
} from "../schemas/cartSchema";

/**
 * Get the user's cart.
 * @param userId - The ID of the user whose cart is being fetched.
 */
export const getCart = async (userId: string) => {
  const cartItems = await prisma.orderProduct.findMany({
    where: { order: { userId } },
    include: { product: true },
  });

  return cartItems;
};

/**
 * Add a product to the user's cart.
 * @param userId - The ID of the user adding the product.
 * @param data - The product details to be added to the cart (productId, quantity).
 */
export const addToCart = async (
  userId: string,
  data: z.infer<typeof addProductToCartSchema>
) => {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const cartOrder = await prisma.order.findFirst({
    where: { userId, status: 0 }, // 0 indicates the cart is still active
  });

  // Create an order if it doesn't exist for the user
  const order = cartOrder
    ? cartOrder
    : await prisma.order.create({
        data: { userId, status: 0, totalAmount: 0 },
      });

  const orderProduct = await prisma.orderProduct.create({
    data: {
      orderId: order.id,
      productId: data.productId,
      quantity: data.quantity,
      price: product.price,
    },
  });

  return orderProduct;
};

/**
 * Delete a product from the user's cart.
 * @param userId - The ID of the user removing the product.
 * @param productId - The ID of the product being removed from the cart.
 */
export const deleteFromCart = async (productId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: productId, status: 0 },
    include: { products: true },
  });

  if (!order) {
    throw new Error("No active cart found for user");
  }

  await prisma.orderProduct.delete({
    where: { id: { productId } },
  });

  return true;
};
