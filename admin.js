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
          groupName: {
            type: "string",
            isVisible: { list: true, show: true, edit: true, filter: true },
            isRequired: true,
          },
        },
      },
    },
    {
      resource: Models.User,
      options: {
        properties: {
          _id: { isVisible: false },
          userName: { isTitle: true, required: true },
          phoneNumber: { required: true },
          address: { isVisible: false }, // hide the raw address object
        },
        actions: {
          new: { isAccessible: false },     // Disable create
          edit: { isAccessible: false },    // Disable edit
          delete: { isAccessible: false },  // Disable delete
          bulkDelete: { isAccessible: false }, // Disable bulk delete
          list: { isAccessible: true },     // Allow listing
          show: { isAccessible: true },     // Allow viewing single record
        },
      },
    },
    {
      resource: Models.Address,
      options: {
        properties: {
          _id: {
            isVisible: { list: true, show: true, edit: false, filter: true },
            isTitle: true, // To show _id as the title since it's the UUID string
          },
          phoneNumber: {
            isRequired: true,
            type: "string",
          },
          type: {
            type: "string",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          areaOrStreet: {
            type: "string",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          landmark: {
            type: "string",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          isDefault: {
            type: "boolean",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          _class: {
            isVisible: false, // Usually hide metadata fields like _class
          },
        },
        actions: {
          new: { isAccessible: false },     // Disable create
          edit: { isAccessible: false },    // Disable edit
          delete: { isAccessible: false },  // Disable delete
          bulkDelete: { isAccessible: false }, // Disable bulk delete
          list: { isAccessible: true },     // Allow listing
          show: { isAccessible: true },     // Allow viewing single record
        },
      },
    },
    {
      resource: Models.TrendCategory,
      options: {
        properties: {
          category: {
            reference: "Category",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          categoryName: {
            isVisible: false, // Hide categoryName from admin input
          },
          backgroundImage: {
            type: "string",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          priority: {
            type: "number",
            isVisible: { list: true, show: true, edit: true, filter: true },
            availableValues: [
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
              { value: 6, label: "6" },
              { value: 7, label: "7" },
              { value: 8, label: "8" },
              { value: 9, label: "9" },
              { value: 10, label: "10" },
            ]
          }
        },
        actions: {
          new: {
            before: async (request) => {
              const categoryId = request.payload?.category;
              if (categoryId) {
                const categoryDoc = await Models.Category.findById(categoryId);
                if (!categoryDoc) {
                  throw new Error("Invalid category selected.");
                }
                request.payload = {
                  ...request.payload,
                  categoryName: categoryDoc.name,
                };
              }
              return request;
            },
          },
        }

      },
    },
    {
      resource: Models.DeliveryFee,
      options: {
        properties: {
          _id: { isVisible: false }, // Hide internal MongoDB _id
          DeliveryFee: {
            type: "number",
            isRequired: true,
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
        },
      },
    }
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
