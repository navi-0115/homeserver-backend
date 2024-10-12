import prisma from "../../prisma/client";

export const cartService = {
  async existingCart(userId: string, status: number, totalAmount: number) {
    const existingCart = await prisma.order.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        products: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!existingCart) {
      const newCart = await prisma.order.create({
        data: { userId: userId, status: status, totalAmount: totalAmount },
        include: { products: { include: { product: true } } },
      });
      return newCart;
    }

    return existingCart;
  },

  async addCart(
    userId: string,
    productId: string,
    quantity: number,
    price: number
  ) {
    const status = 0;
    const totalAmount = 0;

    const existingCart = await this.existingCart(userId, status, totalAmount);

    const existingItem = await prisma.orderProduct.findFirst({
      where: {
        orderId: existingCart.id,
        productId: productId,
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.orderProduct.update({
        where: { id: existingItem.id },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
      return updatedItem;
    } else {
      const newItem = await prisma.orderProduct.create({
        data: {
          productId: productId,
          quantity: quantity,
          price: price,
          orderId: existingCart.id,
        },
      });
      return newItem;
    }
  },

  async updateCart(itemId: string, quantity: number) {
    const existingItem = await prisma.orderProduct.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!existingItem) {
      throw new Error(`Cart item with ID ${itemId} does not exist.`);
    }

    if (!existingItem.product) {
      throw new Error(
        `Product associated with cart item ${itemId} does not exist.`
      );
    }

    const updatedItem = await prisma.orderProduct.update({
      where: { id: itemId },
      data: { quantity: quantity },
    });

    return updatedItem;
  },

  async removeCartProduct(productId: string) {
    const existingItem = await prisma.orderProduct.findUnique({
      where: { id: productId },
    });

    if (!existingItem) {
      throw new Error(`Cart product with ID ${productId} does not exist.`);
    }

    await prisma.orderProduct.delete({
      where: { id: productId },
    });

    return { message: `Success remove item.` };
  },
};
