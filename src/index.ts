import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { productsRoute } from "./routes/productRoutes";
import { authRoutes } from "./routes/authRoutes";

const app = new OpenAPIHono();

// Web routes
app.use(logger());
app.get("/", (c) => {
  return c.json(
    {
      description:
        "Homeserver API - A platform to purchase home server products such as Raspberry Pi, single-board computers, and related accessories.",
      ui: `/ui`,
    },
    200
  );
});

// Swagger UI documentation
app.get("/ui", swaggerUI({ url: "/spec.json" }));
app.doc("/spec.json", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "Homeserver API",
    description:
      "API for online store that provides a platform for individuals to purchase home server products, such as Raspberry Pi, single-board computers, and related accessories.",
  },
});

// API routes
app.use("*", cors());
app.route("/api/products", productsRoute);
app.route("/auth", authRoutes);

export default app;
