import prisma from "../../prisma/client";

// Fetch all products from the database
export async function getAllProductsService() {
  return await prisma.product.findMany({ orderBy: { id: "desc" } });
}

// Fetch product by id
// export async function getProductByIdService(id: string) {
//   const product = await prisma.product.findUnique({ where: { id } });
//   if (!product) {
//     throw new Error(`Product with id ${id} not found`);
//   }
//   return product;
// }

// Fetch product by slug
export async function getProductBySlugService(slug: string) {
  // lowercase
  slug = slug.toLowerCase();

  const product = await prisma.product.findFirst({
    where: { slug },
  });

  if (!product) {
    throw new Error(`Product with slug ${slug} not found`);
  }

  return product;
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
    .replace(/[^a-z0-9-]/g, "");

  return await prisma.product.create({
    data: { ...data, slug },
  });
}

// Update a product by ID or Slug
export async function updateProductService(
  id: string,
  data: {
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
    stock?: number;
    slug?: string;
  }
) {
  if (data.name) {
    data.slug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  const product = await prisma.product.update({ where: { id }, data });

  if (!product) {
    throw new Error(`Product with ${id}`);
  }

  return product;
}

// Delete a product by ID
export async function deleteProductByIdService(id: string) {
  const productExist = await prisma.product.delete({ where: { id } });
  if (!productExist) {
    throw new Error(`Product with id ${id} not found`);
  }
  return productExist;
}
