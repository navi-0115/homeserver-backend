import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create some users
  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "user1@mail.com",
      password: "password123",
      avatarUrl: "https://example.com/avatar1.png",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@mail.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "user2@mail.com",
      password: "password456",
      avatarUrl: "https://example.com/avatar2.png",
    },
  });

  // Create some products (real-world data about Raspberry Pi and related devices)
  const product1 = await prisma.product.upsert({
    where: { slug: "raspberry-pi-4" },
    update: {},
    create: {
      name: "Raspberry Pi 4 Model B",
      imageUrl: "https://example.com/raspberry-pi-4.jpg",
      description:
        "The Raspberry Pi 4 Model B is the latest version of the popular single-board computer.",
      slug: "raspberry-pi-4",
      price: 55, // Price in USD
      stock: 150,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: "raspberry-pi-400" },
    update: {},
    create: {
      name: "Raspberry Pi 400",
      imageUrl: "https://example.com/raspberry-pi-400.jpg",
      description:
        "The Raspberry Pi 400 is a complete personal computer built into a compact keyboard.",
      slug: "raspberry-pi-400",
      price: 70,
      stock: 100,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: "odroid-n2+" },
    update: {},
    create: {
      name: "Odroid N2+",
      imageUrl: "https://example.com/odroid-n2.jpg",
      description:
        "The Odroid N2+ is a powerful single-board computer designed for high-performance projects.",
      slug: "odroid-n2+",
      price: 80,
      stock: 60,
    },
  });

  // Create an order for user1
  const order1 = await prisma.order.create({
    data: {
      status: 1, // e.g., 1 for 'Pending'
      totalAmount: 110, // Sum of the order
      userId: user1.id,
      products: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: product1.price,
          },
          {
            productId: product2.id,
            quantity: 1,
            price: product2.price,
          },
        ],
      },
    },
  });

  // Create an order for user2
  const order2 = await prisma.order.create({
    data: {
      status: 2, // e.g., 2 for 'Shipped'
      totalAmount: 80, // Sum of the order
      userId: user2.id,
      products: {
        create: [
          {
            productId: product3.id,
            quantity: 1,
            price: product3.price,
          },
        ],
      },
    },
  });

  console.log({ user1, user2, product1, product2, product3, order1, order2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
