import { Hono } from "hono";
import bcrypt from "bcrypt";
import { zValidator } from "@hono/zod-validator";
import { generateToken } from "../services/jwtService";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema } from "../schemas/authSchemas";

const authRoutes = new Hono();
const prisma = new PrismaClient();

// Registration route
authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const { username, email, password } = c.req.valid("json");

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // Generate JWT token
  const token = generateToken(user.id);

  return c.json({ message: "User registered", token });
});

// Login route
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid email or password" }, 400);
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return c.json({ error: "Invalid email or password" }, 400);
  }

  // Generate JWT token
  const token = generateToken(user.id);

  return c.json({ message: "Logged in successfully", token });
});

export { authRoutes };
