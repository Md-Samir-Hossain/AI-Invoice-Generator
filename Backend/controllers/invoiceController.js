import mongoose from "mongoose"
import { Invoice } from "../models/invoiceModel.js"
import { getAuth } from "@clerk/express"

const API_BASE = 'http://localhost:3000/';

// Computes subtotal, tax amount, and total for an invoice.

const computeInvoiceTotals = (items = [], taxPercent = 0) => {
    // Make sure its an array and filter out any null/undefined items
    const safe = Array.isArray(items) ? items.filter(Boolean) : [];
    
    // Sum each line: quantity × unit price
    const subtotal = safe.reduce((sum, item) => {
        const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
        return sum + lineTotal;
    }, 0);

    // Tax amount derived from the subtotal
    const taxAmount = subtotal * (Number(taxPercent) || 0) / 100;

    // Grand total = subtotal + tax
    const total = subtotal + taxAmount;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
};

// Parse form data items

const parseItems = (items) => {
    if (!items) return [];
    
    // If it's already an array, return it
    if (Array.isArray(items)) return items;
    
    // If it's a string, try to parse it as JSON
    try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to parse items:", error);
        return [];
    }
};

// Check if string is obj id

const isObjIdString = (value) => {
    return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
};

// Helper function for uploading files to public urls

function uploadedFilesToUrls(req) {
  const urls = {};
  if (!req.files) return urls;
  const mapping = {
    logoName: "logoDataUrl",
    stampName: "stampDataUrl",
    signatureNameMeta: "signatureDataUrl",
    logo: "logoDataUrl",
    stamp: "stampDataUrl",
    signature: "signatureDataUrl",
  };
  // Object.keys() takes an object and gives you a list (an array) of all its labels (keys).
  Object.keys(mapping).forEach((field) => {
    const arr = req.files[field];
    if (Array.isArray(arr) && arr[0]) {
      const filename =
        arr[0].filename || (arr[0].path && path.basename(arr[0].path));
      if (filename) urls[mapping[field]] = `${API_BASE}/uploads/${filename}`;
      // Before the above line runs: urls = {}
      // After the above line runs (for a logo): urls = {logoDataUrl: "http://localhost:5000/uploads/logo-12345.png"}
    }
  });
  return urls;
}

// Generate a unique invoice number

async function generateUniqueInvoiceNumber(attempts = 8) {
  for(let i = 0; i < attempts; i++) {
    const ts = Date.now().toString();
    const suffix = Math.floor(Math.random() * 900000).toString().padStart(6, "0");
    const candidate = `INV-${ts.slice(-6)}-${suffix}`;

    const exists = await Invoice.exists({ invoiceNumber: candidate });
    if (!exists) return candidate;
    await new Promise((r) => setTimeout(r, 2));
  }
  return new mongoose.Types.ObjectId().toString();
}