import express from "express";
import multer from "multer";
import { clerkMiddleware } from "@clerk/express";
import path from "path";
import { createBusinessProfile, updateBusinessProfile, getMyBusinessProfile } from "../controllers/businessProfileController.js";

const bussinessProfileRouter = express.Router();

bussinessProfileRouter.use(clerkMiddleware());

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `Business/${uniqueSuffix}${ext}`);
    },
});

const upload = multer({ storage });

// Create a new business profile
bussinessProfileRouter.post("/", upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "stamp", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]), createBusinessProfile);
// Update a business profile
bussinessProfileRouter.put("/:id", upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "stamp", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]), updateBusinessProfile);

bussinessProfileRouter.get("/me", clerkMiddleware(), getMyBusinessProfile);

export default bussinessProfileRouter;