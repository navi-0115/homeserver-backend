import { OpenAPIHono } from "@hono/zod-openapi";
import { checkUserToken } from "../middlewares/check-user-token";
import { addItemSchema } from "../schemas/cartSchema";
import { cartService } from "../services/cartService";

const API_TAG = ["Cart"];

export const cartRoute = new OpenAPIHono()
  // GET /cart - Fetch user's cart
  .openapi(
    {
      method: "get",
      path: "/",
      summary: "Get the user's shopping cart",
      description: "Fetches the user's current shopping cart.",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Successfully retrieved cart",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string", example: "cuid_xxxxx" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        productId: { type: "string", example: "cuid_xxxxx" },
                        name: { type: "string", example: "Raspberry Pi 4" },
                        imageUrl: {
                          type: "string",
                          example: "https://example.com/image.jpg",
                        },
                        price: { type: "number", example: 19999 },
                        quantity: { type: "number", example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized, token missing or invalid",
        },
        404: {
          description: "Cart not found",
        },
      },
      tags: API_TAG,
    },
    async (c) => {
      try {
        const user: { id: string } = c.get("user" as never);
        let cart = await cartService.getExistingCart(user.id);

        if (!cart) {
          cart = await cartService.createNewCart(user.id);
        }

        return c.json(cart);
      } catch (error: Error | any) {
        return c.json(
          { message: "Failed to get cart", error: error.message },
          404
        );
      }
    }
  )

  // POST /cart/items - Add an item to the cart
  .openapi(
    {
      method: "post",
      path: "/items",
      summary: "Add an item to the shopping cart",
      description: "Adds a product to the user's cart.",
      security: [{ BearerAuth: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: addItemSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Successfully added item to cart",
        },
        400: {
          description: "Invalid input or addition failed",
        },
      },
      tags: API_TAG,
    },
    async (c) => {
      try {
        const user: { id: string } = c.get("user" as never);
        const body = c.req.valid("json");
        const updatedCart = await cartService.addItemToCart(
          user.id,
          body.productId,
          body.quantity
        );

        return c.json(updatedCart, 201);
      } catch (error: Error | any) {
        return c.json(
          { message: "Failed to add item to cart", error: error.message },
          400
        );
      }
    }
  );
