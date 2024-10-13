import { OpenAPIHono } from "@hono/zod-openapi";
import { cartService } from "../services/cartService";
import { checkUserToken } from "../middlewares/check-user-token";
import {
  cartItemSchema,
  itemIdSchema,
  updateCartItemSchema,
} from "../schemas/cartSchema";

const API_TAG = ["Cart"];

export const cartRoute = new OpenAPIHono();
// GET cart
cartRoute.openapi(
  {
    method: "get",
    path: "/",
    description: "Get user's cart",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "Cart retrieved successfully",
      },
      404: {
        description: "Failed to get cart",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    try {
      const user: { id: string } = c.get("user" as never);

      // Call existingCart with default status (active cart) and totalAmount
      const status = 0;
      const totalAmount = 0;

      const cart = await cartService.existingCart(user.id);

      return c.json({ cart }, 200);
    } catch (error: Error | any) {
      return c.json(
        { message: "Failed to get cart", error: error.message },
        404
      );
    }
  }
);
// POST add item to cart
cartRoute.openapi(
  {
    method: "post",
    path: "/item",
    description: "Add an item to the cart",
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: cartItemSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Item added to cart successfully",
      },
      400: {
        description: "Invalid input or item addition failed",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    try {
      const user: { id: string } = c.get("user" as never);
      const body = c.req.valid("json");

      // You should also pass the price to the cart service
      const newItem = await cartService.addCart(
        user.id,
        body.productId,
        body.quantity,
        body.price
      );

      return c.json({ message: "Item added to cart", item: newItem }, 201);
    } catch (error: Error | any) {
      return c.json(
        { message: "Failed to add item to cart", error: error.message },
        400
      );
    }
  }
);
// PUT update item in cart
cartRoute.openapi(
  {
    method: "put",
    path: "/item/{itemId}",
    description: "Update quantity of a cart item",
    security: [{ BearerAuth: [] }],
    request: {
      params: itemIdSchema,
      body: {
        content: {
          "application/json": {
            schema: updateCartItemSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Cart item updated successfully",
      },
      404: {
        description: "Cart item not found",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    try {
      const itemId = c.req.param("itemId");
      if (!itemId) {
        return c.json({ message: "itemId is required" }, 400);
      }
      const body = c.req.valid("json");
      const updatedItem = await cartService.updateCart(itemId, body.quantity);

      return c.json({ message: "Cart item updated", item: updatedItem }, 200);
    } catch (error: Error | any) {
      return c.json(
        { message: "Failed to update cart item", error: error.message },
        400
      );
    }
  }
);
// DELETE item from cart
cartRoute.openapi(
  {
    method: "delete",
    path: "/item/{itemId}",
    description: "Remove an item from the cart",
    request: {
      params: itemIdSchema,
    },
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "Cart item removed successfully",
      },
      404: {
        description: "Cart item not found",
      },
    },
    tags: API_TAG,
  },
  async (c) => {
    try {
      const itemId = c.req.param("itemId");
      if (!itemId) {
        return c.json({ message: "itemId is required" }, 400);
      }
      const response = await cartService.removeCartProduct(itemId);

      return c.json(response, 200);
    } catch (error: Error | any) {
      return c.json(
        { message: "Failed to remove cart item", error: error.message },
        404
      );
    }
  }
);
