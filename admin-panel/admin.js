import express from "express";
import mongoose from "mongoose";
import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "./models/index.js"; // Ensure correct path

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://Manish:Suvarna@cluster.f2upph3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

connectDB().then(() => {
  console.log("📡 Database connection established.");
});

// Register AdminJS with Mongoose
AdminJS.registerAdapter(AdminJSMongoose);

// Admin Panel Configuration
const admin = new AdminJS({
  resources: [
    {
      resource: Models.Product,
      options: {
        properties: {
          productId: { isDisabled: true, isVisible: { list: true, show: true, edit: false, filter: true } },
          category: {
            type: "reference",
            reference: "Category",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
        },
      },
    },
    {
      resource: Models.Category,
      options: {
        properties: {
          categoryId: { isDisabled: true, isVisible: { list: true, show: true, edit: false, filter: true } },
        },
      },
    },
    {
      resource: Models.Order,
      options: {
        properties: {
          orderId: { isDisabled: true, isVisible: { list: true, show: true, edit: false, filter: true } },
        },
      },
    },
    {
      resource: Models.Customer,
      options: {
        properties: {
          custId: { isDisabled: true, isVisible: { list: true, show: true, edit: false, filter: true } },
        },
      },
    },
  ],
  rootPath: "/admin",
});

// Express Server Setup
const app = express();
const adminRouter = AdminJSExpress.buildRouter(admin);
app.use(admin.options.rootPath, adminRouter);

app.listen(2025, () => {
  console.log("🚀 Admin Panel running at http://localhost:2025/admin");
});
