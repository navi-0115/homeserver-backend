import type { Context } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { login, register } from "../services/authService";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import { getCookie, setCookie } from "hono/cookie";
import prisma from "../../prisma/client";
import * as authService from "../services/authService";

const authRoute = new OpenAPIHono();
const API_TAGS = ["Auth"];

const setTokenCookie = (c: Context, refreshToken: string) => {
  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 24 * 30,
  });
};

// Register Route
authRoute.openapi(
  {
    method: "post",
    path: "/register",
    summary: "Register a new user",
    description:
      "Register a new user with name, email, password, and confirm password.",
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
      select: {
        name: true;
      }
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
      const token = await login(body);
      return c.json({ status: "success", data: token.accessToken }, 200);
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
    const token = c.req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const result = await authService.getUserProfile(token);

      if (!result) {
        return c.json({ message: "User not found" }, 404);
      }

      return c.json({ status: "success", data: result });
    } catch (error) {
      return c.json({ message: "Failed to fetch user data", error }, 500);
    }
  }
);

// Logout Route
authRoute.openapi(
  {
    method: "post",
    path: "/logout",
    summary: "Log out a user",
    description: "Log out a user by invalidating the refresh token.",
    responses: {
      200: {
        description: "Logout successful",
      },
      401: {
        description: "Refresh token is missing or invalid",
      },
      500: {
        description: "Failed to log out",
      },
    },
    tags: API_TAGS,
  },
  async (c: Context) => {
    const refreshToken = getCookie(c, "refreshToken");
    if (!refreshToken) {
      return c.json({ message: "Refresh token is required" }, 401);
    }

    try {
      await logout(refreshToken);
      setCookie(c, "refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 0,
      });
      return c.json({ message: "Logout successful" }, 200);
    } catch (error: Error | any) {
      return c.json({ message: "Failed to logout" }, 500);
    }
  }
);

export default authRoute;
