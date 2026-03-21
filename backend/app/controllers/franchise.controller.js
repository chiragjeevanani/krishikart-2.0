import Franchise from "../models/franchise.js";
import Inventory from "../models/inventory.js";
import Product from "../models/product.js";
import handleResponse from "../utils/helper.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import admin from "../services/firebaseAdmin.js";

/**
 * @desc Submit KYC Documents (Aadhaar & PAN)
 * @route POST /franchise/kyc/submit
 * @access Private (Franchise)
 */
export const submitKYC = async (req, res) => {
  try {
    const { aadhaarNumber, panNumber } = req.body;
    const franchiseId = req.franchise._id;

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) return handleResponse(res, 404, "Franchise not found");

    if (franchise.kyc && franchise.kyc.status === "verified") {
      return handleResponse(res, 400, "KYC already verified");
    }

    const kycData = {
      aadhaarNumber,
      panNumber,
      status: "pending",
      submittedAt: new Date(),
    };

    // Handling multiform files
    if (req.files) {
      if (req.files.aadhaarImage) {
        const aadhaarUrl = await uploadToCloudinary(
          req.files.aadhaarImage[0].buffer,
          "franchise/kyc",
        );
        kycData.aadhaarImage = aadhaarUrl;
      }
      if (req.files.panImage) {
        const panUrl = await uploadToCloudinary(
          req.files.panImage[0].buffer,
          "franchise/kyc",
        );
        kycData.panImage = panUrl;
      }
    }

    franchise.kyc = { ...franchise.kyc, ...kycData };
    await franchise.save();

    return handleResponse(
      res,
      200,
      "KYC documents submitted for approval",
      franchise,
    );
  } catch (err) {
    console.error("KYC Submission Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Get KYC Status
 * @route GET /franchise/kyc/status
 * @access Private (Franchise)
 */
export const getKYCStatus = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.franchise._id).select(
      "kyc isVerified",
    );
    return handleResponse(res, 200, "KYC Status Fetched", franchise);
  } catch (err) {
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Get Franchise Inventory (All products with stock)
 * @route GET /franchise/inventory
 * @access Private (Franchise)
 */
export const getInventory = async (req, res) => {
  try {
    const franchiseId = req.franchise._id;

    // Fetch franchise inventory record
    const inventoryRecord = await Inventory.findOne({ franchiseId });

    // Fetch all active products
    const allProducts = await Product.find({ status: "active" })
      .populate("category", "name")
      .populate("subcategory", "name");

    // Map all products to include stock info
    const items = allProducts.map((product) => {
      const stockItem = inventoryRecord?.items?.find(
        (i) => i.productId.toString() === product._id.toString(),
      );

      return {
        id: product._id,
        productId: product,
        currentStock: Math.max(
          0,
          stockItem ? Number(stockItem.currentStock) : 0,
        ),
        franchisePrice: stockItem?.franchisePrice || null,
        mbq: stockItem ? stockItem.mbq : product.stock || 5, // Use product stock as fallback mbq
        lastUpdated: stockItem ? stockItem.lastUpdated : null,
      };
    });

    return handleResponse(res, 200, "Inventory sync successful", items);
  } catch (err) {
    console.error("Get Inventory Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Update Store QR Code
 * @route PUT /franchise/qr-code
 * @access Private (Franchise)
 */
export const updateStoreQRCode = async (req, res) => {
  try {
    const franchiseId = req.franchise._id;

    if (!req.file) {
      return handleResponse(res, 400, "Please upload a QR code image");
    }

    const qrCodeUrl = await uploadToCloudinary(
      req.file.buffer,
      "franchise/qr-codes",
    );

    const franchise = await Franchise.findByIdAndUpdate(
      franchiseId,
      { storeQRCode: qrCodeUrl },
      { new: true },
    );

    return handleResponse(res, 200, "QR Code updated successfully", {
      qrCode: qrCodeUrl,
    });
  } catch (err) {
    console.error("Update QR Code Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Get all active franchises
 * @route GET /franchise/active-stores
 * @access Public
 */
export const getActiveFranchises = async (req, res) => {
  try {
    const franchises = await Franchise.find({ status: "active" }).select(
      "franchiseName ownerName city area state profilePicture location",
    );

    return handleResponse(res, 200, "Active stores fetched", franchises);
  } catch (err) {
    console.error("Fetch Active Franchises Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Reset All Inventory Stock to 100 (Dev/Test Helper)
 * @route POST /franchise/inventory/reset
 * @access Private (Franchise)
 */
export const resetInventoryStock = async (req, res) => {
  try {
    const franchiseId = req.franchise._id;

    // Fetch all products to ensure everything is included
    const allProducts = await Product.find({});

    let inventory = await Inventory.findOne({ franchiseId });

    const newItems = allProducts.map((product) => ({
      productId: product._id,
      currentStock: 100,
      mbq: 5,
      lastUpdated: new Date(),
    }));

    if (!inventory) {
      inventory = new Inventory({
        franchiseId,
        items: newItems,
      });
    } else {
      inventory.items = newItems;
    }

    await inventory.save();

    return handleResponse(
      res,
      200,
      "All inventory items reset to 100 stock successfully",
    );
  } catch (err) {
    console.error("Reset Stock Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};
/**
 * @desc Update Franchise Availability and Location
 * @route PUT /franchise/availability
 * @access Private (Franchise)
 */
export const updateAvailability = async (req, res) => {
  try {
    const { isOnline, lat, lng } = req.body;
    const franchiseId = req.franchise._id;

    const updateData = {};
    if (typeof isOnline === "boolean") updateData.isOnline = isOnline;
    if (lat !== undefined && lng !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    const franchise = await Franchise.findByIdAndUpdate(
      franchiseId,
      { $set: updateData },
      { new: true },
    );

    return handleResponse(
      res,
      200,
      "Availability updated successfully",
      franchise,
    );
  } catch (err) {
    console.error("Update Availability Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Save Franchise FCM Token
 * @route POST /franchise/fcm-token
 * @access Private (Franchise)
 */
export const saveFCMToken = async (req, res) => {
  try {
    const { token, fcm_token, plateform, platform } = req.body;
    const franchiseId = req.franchise._id;
    const finalToken = fcm_token || token;
    const finalPlatform = plateform || platform || "web";

    console.log(
      `[FCM-Backend] Incoming token for Franchise ${franchiseId} [Platform: ${finalPlatform}]:`,
      finalToken,
    );

    if (!finalToken) return handleResponse(res, 400, "FCM Token is required");

    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) return handleResponse(res, 404, "Franchise not found");

    if (!franchise.fcmTokens) franchise.fcmTokens = [];
    if (!franchise.mobile_fcm) franchise.mobile_fcm = [];

    // Determine which array to use: 'web' goes to fcmTokens, everything else to mobile_fcm
    const isWeb = finalPlatform.toLowerCase() === "web";
    const targetArrayName = isWeb ? "fcmTokens" : "mobile_fcm";
    const targetArray = franchise[targetArrayName];

    console.log(
      `[FCM-Backend] Targeted array for Platform "${finalPlatform}": ${targetArrayName}`,
    );

    if (!targetArray.includes(finalToken)) {
      console.log(
        `[FCM-Backend] Registering new unique token for Franchise ${franchiseId} in ${targetArrayName}`,
      );
      targetArray.push(finalToken);

      // Limit tokens (10 per array)
      if (targetArray.length > 10) {
        console.log(
          `[FCM-Backend] Token limit (10) reached for ${targetArrayName} of Franchise ${franchiseId}. Slicing older tokens.`,
        );
        franchise[targetArrayName] = targetArray.slice(-10);
      }
      await franchise.save();
    } else {
      console.log(
        `[FCM-Backend] Token already exists in ${targetArrayName} for Franchise ${franchiseId}.`,
      );
    }

    return handleResponse(res, 200, "FCM token saved successfully");
  } catch (err) {
    console.error("Save FCM Token Error:", err);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * @desc Test Push Notification by Token (Mobile Developer Helper)
 * @route POST /franchise/test-notification
 * @access Private (Franchise)
 */
export const testPushByToken = async (req, res) => {
  // Keep token in a single variable so we can reuse it in catch as well
  const { fcm_token, plateform } = req.body;
  const bodyToken = fcm_token;

  try {
    if (!bodyToken) return handleResponse(res, 400, "fcm_token is required");

    console.log(
      `[FCM-Test] Sending test ping to ${plateform || "device"}:`,
      bodyToken,
    );

    const message = {
      notification: {
        title: "Kisaankart Notification Test",
        body: `Success! Your ${plateform || "device"} is correctly integrated with Kisaankart FCM.`,
      },
      token: bodyToken,
    };

    const response = await admin.messaging().send(message);
    return handleResponse(
      res,
      200,
      "Test notification sent successfully!",
      response,
    );
  } catch (error) {
    console.error("Test Notification Error:", error);

    // Specific handling for stale/invalid tokens
    if (error.code === "messaging/registration-token-not-registered") {
      const franchiseId = req.franchise?._id;
      if (franchiseId && bodyToken) {
        // Pull from both possible arrays to be safe
        await Franchise.findByIdAndUpdate(franchiseId, {
          $pull: {
            fcmTokens: bodyToken,
            mobile_fcm: bodyToken,
          },
        });
        console.log(
          `[FCM-Cleanup] Removed stale token from all possible fields for Franchise ${franchiseId}: ${bodyToken}`,
        );
      }

      return handleResponse(
        res,
        410,
        "FCM Token is no longer valid (NotRegistered). Please generate a fresh token and try again.",
        {
          code: error.code,
          error_message: error.message,
          suggestion:
            "Refresh the token on the device/dashboard and try again.",
        },
      );
    }

    return handleResponse(res, 500, "Failed to send test notification", {
      code: error.code,
      error_message: error.message,
    });
  }
};
