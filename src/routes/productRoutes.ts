import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
} from "../schemas/productSchema";
import {
  getAllProductsService,
  getProductBySlugService,
  createProductService,
  deleteProductByIdService,
  updateProductService,
  //   updateProductBySlugService,
} from "../services/productService";

const API_TAG = ["Products"];

export const productsRoute = new OpenAPIHono();

// Get all products
productsRoute.openapi(
  {
    method: "get",
    path: "/",
    description: "Get all products",
    responses: {
      200: {
        description: "List of products",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    const products = await getAllProductsService();
    return c.json({
      message: "Success",
      data: products,
    });
  }
);

// Get product by Slug
productsRoute.openapi(
  {
    method: "get",
    path: "/slug/{slug}",
    description: "Get product by slug",
    request: {
      params: productSlugSchema,
    },
    responses: {
      200: {
        description: "Product details",
      },
      404: {
        description: "Product not found",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    const slug = c.req.param("slug") as string;
    const product = await getProductBySlugService(slug);

    if (!slug) {
      return c.json(
        { success: false, message: "Slug parameter is required" },
        400
      );
    }

    return product
      ? c.json({
          success: true,
          message: `Product with slug '${slug}' found`,
          data: product,
        })
      : c.json(
          { success: false, message: `Product with slug '${slug}' not found` },
          404
        );
  }
);

// Create a new product
productsRoute.openapi(
  {
    method: "post",
    path: "/",
    description: "Create a new product",
    request: {
      body: {
        content: {
          "application/json": {
            schema: createProductSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Product created successfully",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    const data = c.req.valid("json");
    const newProduct = await createProductService(data);
    return c.json(
      {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      },
      201
    );
  }
);

// Update product by ID (PATCH)
productsRoute.openapi(
  {
    method: "put",
    path: "/{id}",
    description: "Update a product by ID",
    request: {
      params: productIdSchema,
      body: {
        content: {
          "application/json": {
            schema: updateProductSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Product updated successfully",
      },
      404: {
        description: "Product not found",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    const data = c.req.valid("json");
    const id = c.req.param("id") as string;
    const updatedProduct = await updateProductService(id, data);
    return updatedProduct
      ? c.json({
          success: true,
          message: `Product with ID ${id} updated`,
          data: updatedProduct,
        })
      : c.json(
          { success: false, message: `Product with ID ${id} not found` },
          404
        );
  }
);

// Update product by Slug
productsRoute.openapi(
  {
    method: "put",
    path: "/slug/{slug}",
    description: "Update a product by slug",
    request: {
      params: productSlugSchema,
      body: {
        content: {
          "application/json": {
            schema: updateProductSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Product updated successfully",
      },
      404: {
        description: "Product not found",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    const data = c.req.valid("json");
    const slug = c.req.param("slug") as string;
    const updatedProduct = await updateProductService(slug, data);
    return updatedProduct
      ? c.json({
          success: true,
          message: `Product with slug '${slug}' updated`,
          data: updatedProduct,
        })
      : c.json(
          { success: false, message: `Product with slug '${slug}' not found` },
          404
        );
  }
);

// Delete product by ID
productsRoute.openapi(
  {
    method: "delete",
    path: "/{id}",
    description: "Delete product by ID",
    request: {
      params: productIdSchema,
    },
    responses: {
      200: {
        description: "Product deleted successfully",
      },
      404: {
        description: "Product not found",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    const id = c.req.param("id") as string;
    const deletedProduct = await deleteProductByIdService(id);
    return deletedProduct
      ? c.json({
          success: true,
          message: `Product with ID ${id} has been deleted`,
        })
      : c.json(
          { success: false, message: `Product with ID ${id} not found` },
          404
        );
  }
);
