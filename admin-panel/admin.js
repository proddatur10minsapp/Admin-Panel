import express from "express";
import mongoose from "mongoose";
import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Modals from "./models/index.js";

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/products_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Register AdminJS with Mongoose
AdminJS.registerAdapter(AdminJSMongoose);

const admin = new AdminJS({
  resources: [
    {resource: Modals.Product},
    {resource:Modals.Category},
    {resource:Modals.Order},
    {resource:Modals.Customer}
  ],
  rootPath: "/admin",
});

const app = express();
const adminRouter = AdminJSExpress.buildRouter(admin);
app.use(admin.options.rootPath, adminRouter);

app.listen(3000, () => {
  console.log("Admin Panel running at http://localhost:3000/admin");
});
