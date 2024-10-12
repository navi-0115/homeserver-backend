// routes/userRoutes.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { checkUserToken } from "../middleware/checkUserToken";
import prisma from "../../prisma/client"; // Adjust the path if necessary

const userRoutes = new OpenAPIHono();

userRoutes.get("/me", checkUserToken, async (c) => {
  const user = c.get("user");

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json({ status: "success", data: userData });
  } catch (error) {
    return c.json({ message: "Failed to fetch user data", error }, 500);
  }
});

export default userRoutes;
