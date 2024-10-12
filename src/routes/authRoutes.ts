import type { Context } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { login, register, getUserProfile } from "../services/authService";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import { setCookie } from "hono/cookie";

const authRoute = new OpenAPIHono();
const API_TAGS = ["Auth"];

/**
 * Set access token cookie with 10 days expiration
 */
const setTokenCookie = (c: Context, accessToken: string) => {
  setCookie(c, "accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 24 * 10, // 10 days expiration
  });
};

// Register Route
authRoute.openapi(
  {
    method: "post",
    path: "/register",
    summary: "Register a new user",
    description: "Register a new user with name, email, and password.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: registerSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User successfully registered",
      },
      400: {
        description: "Invalid input or registration failed",
      },
    },
    tags: API_TAGS,
  },
  async (c: Context) => {
    const body = await c.req.json();

    try {
      const user = await register(body);
      return c.json({ status: "success", data: user }, 201);
    } catch (error: Error | any) {
      return c.json(
        { status: "failed", error: error.message || "Registration failed!" },
        400
      );
    }
  }
);

// Login Route
authRoute.openapi(
  {
    method: "post",
    path: "/login",
    summary: "Log in a user",
    description: "Log in a user with email and password.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: loginSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      },
      401: {
        description: "Invalid email or password",
      },
    },
    tags: API_TAGS,
  },
  async (c: Context) => {
    const body = await c.req.json();

    try {
      const { accessToken, email, name } = await login(body);
      setTokenCookie(c, accessToken);
      return c.json(
        { status: "success", data: { accessToken, email, name } },
        200
      );
    } catch (error: Error | any) {
      return c.json(
        { status: "failed", error: error.message || "Login failed!" },
        401
      );
    }
  }
);

// Authenticated User Profile Route - /auth/me
authRoute.openapi(
  {
    method: "get",
    path: "/me",
    summary: "Get authenticated user profile",
    security: [{ BearerAuth: [] }],
    description:
      "Fetches the profile of the authenticated user using their JWT token.",
    tags: API_TAGS,
    responses: {
      200: {
        description: "Authenticated user profile",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", example: "cuid_xxxxx" },
                name: { type: "string", example: "John Doe" },
                email: { type: "string", example: "john@example.com" },
                avatarUrl: {
                  type: "string",
                  example: "https://example.com/avatar.jpg",
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
        description: "User not found",
      },
    },
  },
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer", "").trim();
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const result = await getUserProfile(token);

      if (!result) {
        return c.json({ message: "User not found" }, 404);
      }

      return c.json({ status: "success", data: result });
    } catch (error) {
      return c.json({ message: "Failed to fetch user data", error }, 500);
    }
  }
);

export default authRoute;
