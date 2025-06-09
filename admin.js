import express from "express";
import mongoose from "mongoose";
import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "./models/index.js"; // Ensure correct path

    /* ──────────── SHARED HOOK ──────────── */
    async function syncNamesFromCategory(request) {
      const categoryId = request?.payload?.category;
      if (!categoryId) return request;

      const cat = await Models.Category.findById(categoryId)
        .select('name groupName')
        .lean();
      if (!cat) throw new Error('Invalid category selected.');

      request.payload = {
        ...request.payload,
        categoryName: cat.name,
        groupName: cat.groupName,
      };

      return request;
    }

    /* Helper shared by both actions */
async function copyCategoryFields(request) {
  const categoryId = request.payload?.category;
  if (categoryId) {
    const categoryDoc = await Models.Category
      .findById(categoryId)
      .select("name groupName groupImage");

    if (!categoryDoc)
      throw new Error("Invalid category selected.");

    request.payload = {
      ...request.payload,
      categoryName: categoryDoc.name,
      groupName   : categoryDoc.groupName,
      // groupImage : categoryDoc.groupImage,   // uncomment if you exposed it
    };
  }
  return request;
}

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
          productId: {
            isDisabled: true,
            isVisible: { list: true, show: true, edit: false, filter: true },
          },
          category: {
            type: "reference",
            reference: "Category",
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          groupName: {
            isVisible: { list: true, show: true, edit: false, filter: true, new: false },
          },
        },
      },
    },
    {
      resource: Models.Category,
      options: {
        properties: {
          categoryId: { isDisabled: true, isVisible: { list: true, show: true, edit: false, filter: true } },
            groupName: {
            type: "string",
            isVisible: { list: true, show: true, edit: true, filter: true },
            isRequired: true,
          },
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
          /* ───────── AUTO-FILLED FIELDS ───────── */
          categoryName: { isVisible: false }, // filled by hook
          groupName: { isVisible: false }, // ← NEW: filled by hook

          /* ───────── USER-EDITABLE FIELDS ───────── */
          backgroundImage: {
            type: 'string',
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          priority: {
            type: 'number',
            isVisible: { list: true, show: true, edit: true, filter: true },
            availableValues: Array.from({ length: 10 }, (_, i) => ({
              value: i + 1,
              label: String(i + 1),
            })),
          },
        },

        /* ───────── ACTION HOOKS ───────── */
        actions: {
          new: {
            before: syncNamesFromCategory,
          },
          edit: {
            before: syncNamesFromCategory, // keep data consistent on edits too
          },
        },
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
    },
  {
  resource: Models.Banner,   // or Models.Banner
  options : {
    /* ───────────────────────────  FIELD VISIBILITY  ────────────────────────── */
    properties: {
      // — Foreign-key —
      category: {
        reference : "Category",
        isVisible : { list: true, show: true, edit: true, filter: true },
      },

      // — Denormalised category data —
      categoryName: {                     // copied from Category.name
        isVisible : { list: true, show: true, edit: false, filter: true },
      },
      groupName: {                        // copied from Category.groupName
        isVisible : { list: true, show: true, edit: false, filter: true },
      },
      /* If you added groupImage in the schema, keep it read-only too
      groupImage: {
        isVisible : { list: true, show: true, edit: false, filter: true },
        components: { list: AdminJS.bundle('./components/ImageThumb') },
      },
      */

      // — Regular fields —
      image: {
        type      : "string",
        isRequired: true,
        isVisible : { list: true, show: true, edit: true, filter: true },
      },
      priority: {
        type      : "number",
        isRequired: true,
        availableValues: Array.from({ length: 20 }, (_, i) => ({
          value: i + 1,
          label: `${i + 1}`,
        })),
        isVisible : { list: true, show: true, edit: true, filter: true },
      },
      type: {
        type      : "string",
        isRequired: true,
        availableValues: [
          { value: "Banner",       label: "Banner" },
          { value: "Sponsorship",  label: "Sponsorship" },
        ],
        isVisible : { list: true, show: true, edit: true, filter: true },
      },

      createdAt: { isVisible: { list: true, show: true, edit: false } },
      updatedAt: { isVisible: { list: true, show: true, edit: false } },
      _id      : { isVisible: false },
    },

    /* ───────────────────────────────  ACTIONS  ─────────────────────────────── */
    actions: {
      /* Create */
      new: {
        before: async (request) => copyCategoryFields(request),
      },
      /* Update (needed if admin changes the category) */
      edit: {
        before: async (request) => copyCategoryFields(request),
      },
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
