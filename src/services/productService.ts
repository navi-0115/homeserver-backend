import prisma from "../../prisma/client";

// Fetch all products from the database
export async function getAllProductsService() {
  return await prisma.product.findMany({ orderBy: { id: "desc" } });
}

// Fetch product by id
export async function getProductByIdService(id: string) {
  return await prisma.product.findUnique({ where: { id } });
}

// Fetch product by slug
export async function getProductBySlugService(slug: string) {
  return await prisma.product.findUnique({ where: { slug } });
}

// Create a new product
export async function createProductService(data: {
  name: string;
  price: number;
  description?: string;
  image?: string;
  stock: number;
}) {
  const slug = data.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, ""); // Create slug from name

  return await prisma.product.create({
    data: { ...data, slug },
  });
}

// Update a product by ID
export async function updateProductService(
  id: string,
  data: {
    name?: string;
    price?: number;
    description?: string;
    image?: string;
    stock?: number;
    slug?: string;
  }
) {
  if (data.name) {
    data.slug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""); // Create slug from name
  }

  return await prisma.product.update({ where: { id }, data });
}

// Delete a product by ID
export async function deleteProductByIdService(id: string) {
  return await prisma.product.delete({ where: { id } });
}
