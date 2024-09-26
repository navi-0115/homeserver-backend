import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { productsRoute } from "./routes/productRoutes";

export default new OpenAPIHono({ strict: false })
  .route("/api/products", productsRoute)

  // OpenAPI documentation
  .doc31("/doc", {
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Homeserver API",
      description:
        "API for online store that provides a platform for individuals to purchase home server products, such as Raspberry Pi, single-board computers, and related accessories.",
    },
  })

  // Swagger UI
  .get("/api", swaggerUI({ url: "/doc" }));

// const app = new Hono(); // Create main Hono app instance
// const api = new OpenAPIHono({ strict: false }); //

// // Define the API routes
// api.route("/api/products", productsRoute);

// // OpenAPI documentation route
// api.doc31("/doc", {
//   openapi: "3.1.0",
//   info: {
//     version: "1.0.0",
//     title: "Muslim Friendly API",
//     description:
//       "API for managing products, sites, and contacts for Muslim Friendly Taiwan tourism",
//   },
// });

// // Swagger UI
// app.get("/api", swaggerUI({ url: "/doc" }));

// app.use(
//   "*",
//   cors({
//     origin: (origin) => {
//       const allowedOrigins = ["http://example.com"];
//       return allowedOrigins.includes(origin) || !origin ? origin : null;
//     },
//     credentials: true,
//   })
// );

// // Mount the API on the main app
// app.route("/api", api);

// export default app;
