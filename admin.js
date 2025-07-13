import express from "express";
import mongoose from "mongoose";
import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "./models/index.js";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
          categoryName: {
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
        filterProperties: ['orderStatus', 'phoneNumber', '_id'],
        properties: {
          // 🆔 Order Info
          _id: {
            isTitle: true,
            isVisible: { list: true, show: true, edit: false },
            label: 'Order ID',
          },
          'OrdersCartDTO': {
            isVisible: { list: false, show: true, edit: false },
          },

          // 🛒 Cart Summary
          'OrdersCartDTO.totalItemsInCart': { isVisible: { show: true, list: true } },
          'OrdersCartDTO.totalPrice': { isVisible: { show: true, list: true } },
          'OrdersCartDTO.discountedAmount': { isVisible: { show: true, list: true } },
          'OrdersCartDTO.phoneNumber': { isVisible: false },
          'OrdersCartDTO.updatedAt': { isVisible: false },
          'OrdersCartDTO.totalCurrentPrice': { isVisible: false },

          // 🧾 Products in Cart
          'OrdersCartDTO.productsList': {
            isVisible: { list: false, show: true, edit: false },
            label: 'Products in Cart',
          },
          'OrdersCartDTO.productsList.image': { isVisible: false },
          'OrdersCartDTO.productsList.category': { isVisible: false },
          'OrdersCartDTO.productsList.updatedAt': { isVisible: false },
          'OrdersCartDTO.productsList.totalCurrentPrice': { isVisible: false },
          'OrdersCartDTO.productsList.isProductAvailable': { isVisible: false },
          'OrdersCartDTO.productsList.totalDiscountedAmount': { isVisible: false },
          'OrdersCartDTO.productsList.discountPercentage': { isVisible: false },

          'OrdersCartDTO.productsList.productName': { isVisible: { show: true }, label: 'Product Name' },
          'OrdersCartDTO.productsList.categoryName': { isVisible: { show: true }, label: 'Category' },
          'OrdersCartDTO.productsList.quantity': { isVisible: { show: true }, label: 'Quantity' },
          'OrdersCartDTO.productsList.price': { isVisible: { show: true }, label: 'Original Price' },
          'OrdersCartDTO.productsList.discountedPrice': { isVisible: { show: true }, label: 'Discounted Price' },
          'OrdersCartDTO.productsList.totalPrice': { isVisible: { show: true }, label: 'Total Final Price' },

          'deliveryAddress': {
            isVisible: { list: false, show: false, edit: false },
          },
          // 📍 Delivery Address
          'deliveryAddress.type': { isVisible: { show: true }, label: 'Address Type' },
          'deliveryAddress.areaOrStreet': { isVisible: { show: true }, label: 'Street / Area' },
          'deliveryAddress.landmark': { isVisible: { show: true }, label: 'Landmark' },
          'deliveryAddress.pincode': { isVisible: { show: true }, label: 'PIN Code' },
          'deliveryAddress.phoneNumber': { isVisible: false },
          'deliveryAddress.isDefault': { isVisible: { show: true }, label: 'Is Default Address' },

          // 📞 Phone
          phoneNumber: { isVisible: { show: true }, label: 'Phone Number' },

          // 💰 Charges & Payment
          deliveryCharges: { isVisible: { show: true, list: true }, label: 'Delivery Charges' },
          totalPayable: { isVisible: { show: true, list: true }, label: 'Total Payable Amount' },
          paymentMethod: { isVisible: { show: true, list: true }, label: 'Payment Method' },

          // ⏱️ Timestamps
          createdAt: { isVisible: { show: false, list: false }, label: 'Order Created At' },
          updatedAt: { isVisible: { show: false, list: false }, label: 'Order Last Updated At' },

          // ✅ Editable: Order Status
          orderStatus: {
            label: 'Order Status',
            isVisible: { list: true, show: true, edit: true },
            availableValues: [
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'SHIPPED', label: 'Shipped' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'EXPIRED', label: 'Expired' },
            ],
          },
        },

        actions: {
          new: { isAccessible: false },
          delete: { isAccessible: false },
          edit: {
            isAccessible: true,
            before: async (request) => {
              // 🛡️ Prevent updating anything other than orderStatus
              if (request.payload) {
                request.payload = { orderStatus: request.payload.orderStatus };
              }
              return request;
            },
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
      resource: Models.giftProduct,
      options: {
        properties: {
          name: { isTitle: true },

          image: {
            type: 'string',
            isVisible: { list: true, show: true, edit: true, filter: false },
          },
          price: {
            type: 'number',
            isVisible: true,
          },

          discountPrice: {
            type: 'number',
            isVisible: true,
          },

          quantity: {
            type: 'string',
            isVisible: true,
          },

          description: {
            type: 'richtext',
            isVisible: { list: false, show: true, edit: true, filter: false },
          },

          keyFeatures: {
            type: 'textarea',
            isVisible: { list: false, show: true, edit: true, filter: false },
          },

          specifications: {
            type: 'textarea',
            isVisible: { list: false, show: true, edit: true, filter: false },
          },

          stock: {
            type: 'number',
            isVisible: true,
          },
          startAmount: {
            type: 'number',
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
          endAmount: {
            type: 'number',
            isVisible: { list: true, show: true, edit: true, filter: true },
          },
        },

        listProperties: ['name', 'image', 'price', 'discountPrice', 'stock'],
        showProperties: [
          'name', 'image', 'gallery', 'price', 'discountPrice',
          'quantity', 'description', 'keyFeatures', 'specifications', 'stock', 'startAmount','endAmount',
        ],
        editProperties: [
          'name', 'image', 'gallery', 'price', 'discountPrice',
          'quantity', 'description', 'keyFeatures', 'specifications', 'stock','startAmount','endAmount',
        ],
        filterProperties: ['name', 'price', 'stock'],
      },
    },
    {
      resource: Models.Pincode,
      options: {
        properties: {
          pincodes: {
            type: 'array',
            isVisible: { list: true, edit: true, filter: true, show: true },
          },
          createdAt: { isVisible: false },
          updatedAt: { isVisible: false },
        },
        listProperties: ['city', 'state', 'pincodes', 'isActive'],
      }
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
{
  resource: Models.SingleBanner,
  options: {
    properties: {
      image: {
        type: 'string',
        isRequired: true,
        isVisible: { list: true, show: true, edit: true, filter: true },
      },
      createdAt: { isVisible: { list: true, show: true, edit: false } },
      updatedAt: { isVisible: { list: true, show: true, edit: false } },
      _id: { isVisible: false },
    },
    actions: {
      new: {
        isAccessible: async () => {
          const count = await Models.SingleBanner.countDocuments();
          return count === 0; // ⛔️ Block new if one already exists
        },
        before: async (request) => request,
      },
      edit: {
        isAccessible: true,
        before: async (request) => request,
      },
      delete: {
        isAccessible: false, // ⛔️ Prevent deletion
      },
      bulkDelete: {
        isAccessible: false, // ⛔️ Prevent bulk deletion
      },
    },
  },
},

  ],  rootPath: "/admin",
});

// Express Server Setup
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add Socket.IO client to admin layout
admin.options.assets = {
  styles: [],
  scripts: [
    'https://cdn.socket.io/4.0.1/socket.io.min.js',
    '/notification.js'
  ],
};

const adminRouter = AdminJSExpress.buildRouter(admin);
app.use(admin.options.rootPath, adminRouter);

// Keep track of last checked order time
let lastOrderCheck = new Date();

// Function to check for new orders
async function checkNewOrders() {
  try {
    const newOrders = await Models.Order.find({
      createdAt: { $gt: lastOrderCheck },
      orderStatus: 'PENDING'
    });

    if (newOrders.length > 0) {
      newOrders.forEach(order => {
        io.emit('newOrder', {
          _id: order._id,
          phoneNumber: order.phoneNumber,
          totalPayable: order.totalPayable
        });
      });
    }
    
    lastOrderCheck = new Date();
  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
}

// Set up polling interval (10 seconds)
setInterval(checkNewOrders, 10000);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
httpServer.listen(2025, () => {
  console.log("🚀 Admin Panel running at http://localhost:2025/admin");
});
