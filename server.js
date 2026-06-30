require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const shopRoutes = require("./src/routes/shopRoutes");
const productRoutes = require("./src/routes/productRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();

// CLIENT_URL can be a single URL or a comma-separated list, e.g.
// CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like curl/Postman (no Origin header), allow if the
      // allow-list is empty (so the app never hard-fails on a missing
      // env var), allow if the origin is explicitly listed, and always
      // allow any *.vercel.app deployment so previews keep working.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      try {
        if (/\.vercel\.app$/.test(new URL(origin).hostname)) {
          return callback(null, true);
        }
      } catch {
        // ignore malformed origin
      }
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check (root, so visiting the Render URL in a browser doesn't 404)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Nearby Hub API is running" });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Nearby Hub API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", orderRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after DB connect
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});