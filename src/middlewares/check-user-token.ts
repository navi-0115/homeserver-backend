import { createMiddleware } from "hono/factory";
import { validateToken } from "../libs/jwt"; // Assuming you have a validateToken function
import prisma from "../../prisma/client"; // Adjust the import based on your setup

export const checkUserToken = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ message: "Authorization header is missing" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const decodedToken = await validateToken(token);

  if (!decodedToken?.subject) {
    return c.json({ message: "Invalid or missing token" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.subject },
  });

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  // Set the user object in the context
  c.set("user", user);
  await next();
});
