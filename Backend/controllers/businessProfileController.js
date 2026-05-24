import BusinessProfile from "../models/businessProfileModel.js";
import { getAuth } from "@clerk/express";
import path from "path";

const API_BASE = 'http://localhost:3000/';

// File to URL function
function uploadedFilesToUrls(req) {
  const urls = {};
  if (!req.files) return urls;

  const logoArr = req.files.logo || [];
  const stampArr = req.files.stamp || [];
  const sigArr = req.files.signature || [];

  if (logoArr[0]) urls.logoUrl = `${API_BASE}uploads/Business/${logoArr[0].filename}`;
  if (stampArr[0]) urls.stampUrl = `${API_BASE}uploads/Business/${stampArr[0].filename}`;
  if (sigArr[0]) urls.signatureUrl = `${API_BASE}uploads/Business/${sigArr[0].filename}`;

  return urls;
}

// Create a business profile
export async function createBusinessProfile(req, res) {
  try {
    const { userId } = getAuth(req) || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);

    const profile = new BusinessProfile({
      owner: userId,
      businessName: body.businessName || "ABC Company",
      email: body.email || "",
      address: body.address || "",
      phone: body.phone || "",
      gst: body.gst || "",
      logoUrl: fileUrls.logoUrl || body.logoUrl || null,
      stampUrl: fileUrls.stampUrl || body.stampUrl || null,
      signatureUrl: fileUrls.signatureUrl || body.signatureUrl || null,
      signatureOwnerName: body.signatureOwnerName || "",
      signatureOwnerTitle: body.signatureOwnerTitle || "",
      defaultTaxPercent: body.defaultTaxPercent !== undefined ? Number(body.defaultTaxPercent) : 18,
    });

    const saved = await profile.save();

    res.status(201).json({
      success: true,
      message: "Business profile created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating business profile:", error.message);
    console.error("Full error:", error);
    console.error("Request body keys:", Object.keys(req.body || {}));
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create business profile"
    });
  }
}

// To Update a business profile
export async function updateBusinessProfile(req, res) {
  try {
    const { userId } = getAuth(req) || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);
    const { id } = req.params;

    const existing = await BusinessProfile.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    if(existing.owner.toString() !== userId){
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not your business profile",
      });
    }

    const update = {};

    if (body.businessName !== undefined) update.businessName = body.businessName;
    if (body.email !== undefined) update.email = body.email;
    if (body.address !== undefined) update.address = body.address;
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.gst !== undefined) update.gst = body.gst;

    if (fileUrls.logoUrl) update.logoUrl = fileUrls.logoUrl;
    else if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl;

    if (fileUrls.stampUrl) update.stampUrl = fileUrls.stampUrl;
    else if (body.stampUrl !== undefined) update.stampUrl = body.stampUrl;

    if (fileUrls.signatureUrl) update.signatureUrl = fileUrls.signatureUrl;
    else if (body.signatureUrl !== undefined) update.signatureUrl = body.signatureUrl;

    if (body.signatureOwnerName !== undefined) update.signatureOwnerName = body.signatureOwnerName;
    if (body.signatureOwnerTitle !== undefined) update.signatureOwnerTitle = body.signatureOwnerTitle;
    if (body.defaultTaxPercent !== undefined) update.defaultTaxPercent = Number(body.defaultTaxPercent);

    const updated = await BusinessProfile.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Business profile updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Error updating business profile:", error.message);
    console.error("Full error:", error);
    console.error("Request body keys:", Object.keys(req.body || {}));
    console.error("Request files:", Object.keys(req.files || {}));
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update business profile"
    });
  }
}

// To get my business profile
export async function getMyBusinessProfile(req, res) {
  try {
    const { userId } = getAuth(req) || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const profile = await BusinessProfile.findOne({ owner: userId }).lean();

    if (!profile) {
      return res.status(204).json({
        success: false,
        message: "Business profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("GetMyBusinessProfile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business profile"
    });
  }
}