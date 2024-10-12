// middleware/checkUserToken.ts
import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import prisma from "../../prisma/client";
import { validateToken } from "../libs/jwt";

type Env = {
  Variables: {
    user: {
      id: string;
    };
  };
};

export const checkUserToken = createMiddleware<Env>(async (c, next) => {
  const tokenCookie = getCookie(c, "refreshToken");
  const authHeader = c.req.header("Authorization");

  // Get the token either from cookie or header
  const token = tokenCookie
    ? tokenCookie
    : authHeader
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return c.json({ message: "Not allowed. Token is required" }, 401);
  }

  try {
    const decodedToken = await validateToken(token);

    if (!decodedToken?.subject) {
      return c.json({ message: "Not allowed. Token is invalid" }, 401);
    }

    const userId = decodedToken.subject;

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    // Set user in context
    c.set("user", user);

    await next();
  } catch (error) {
    return c.json({ message: "Token validation failed" }, 401);
  }
});
