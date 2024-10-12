// authRoutes.ts
import { Context } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { login, register, getUserProfile } from "../services/authService";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import * as jwt from "../libs/jwt";
import { getCookie } from "hono/cookie";

const authRoute = new OpenAPIHono();
const API_TAGS = ["Auth"];

// Middleware to check authentication
const checkUserToken = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await jwt.validateToken(token);
    if (!decoded?.subject) {
      throw new Error("Invalid token");
    }

    c.set("user", { id: decoded.subject });
    await next();
  } catch (error) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};

// /auth/me route to get authenticated user's profile
authRoute.openapi(
  {
    method: "get",
    path: "/me",
    summary: "Get authenticated user profile",
    description: "Retrieve the profile of the currently authenticated user.",
    responses: {
      200: {
        description: "User profile retrieved successfully",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "User not found",
      },
    },
    tags: API_TAGS,
  },
  checkUserToken,
  async (c: Context) => {
    const user = c.get("user");

    try {
      const userProfile = await getUserProfile(user.id);
      return c.json({ status: "success", data: userProfile }, 200);
    } catch (error) {
      return c.json(
        { status: "failed", error: error.message || "User not found" },
        404
      );
    }
  }
);

export default authRoute;
