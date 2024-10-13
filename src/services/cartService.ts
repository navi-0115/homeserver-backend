import prisma from "../../prisma/client";

export const cartService = {
  async getExistingCart(userId: string) {
    const existingCart = await prisma.cart.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    console.error("error existing");
    return existingCart;
  },

  async createNewCart(userId: string) {
    const newCart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
    return newCart;
  },

  async addItemToCart(userId: string, productId: string, quantity: number) {
    const existingCart = await this.getExistingCart(userId);

    if (!existingCart) {
      throw new Error("Shopping cart is unavailable");
    }

    const existingItem = existingCart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // Update quantity of existing item
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          cartId: existingCart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getExistingCart(userId); // Return updated cart
  },
};
