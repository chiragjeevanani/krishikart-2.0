import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    farmLocation: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    aadharCard: {
      type: String, // URL
      required: true,
    },

    panCard: {
      type: String, // URL
      required: true,
    },

    fssaiLicense: {
      type: String, // License Number or Image URL? Usually users enter numbers, but if they want proof, it's URL. Prompt implies "feild create karo... FSSAI". Usually implies license number input + potentially upload. I'll store as String to support both (URL or Number), but likely Number + Upload. Given "feild create karo", I'll suspect text input for number and maybe upload. But prompt grouped it with "Aadhaar... PAN... Shop Proof", which are uploads. I will treat as URL for upload to be safe, or just String. Let's start with just String (could be number or URL). Actually, if they want "upload" for others, they might want upload here too. I'll add `fssaiImage` just in case, or just `fssaiLicense`. Let's stick to `fssaiLicense` as a String (could be URL or code). I'll clarify in controller logic. Actually, looking at others, "Aadhaar (photo upload only)" implies others might NOT be photo only? "PAN" -> usually number + photo. "Bank Details" -> text. "Shop & Establishment proof" -> photo.
      // Let's assume FSSAI is a text field for License Number for now unless specified "upload".
      // Wait, "FSSAI (Vendor mandatory...)" usually implies the License Number.
      // "Shop & Establishment proof" implies upload.
      // "Aadhaar (photo upload only)" implies upload.
      // "PAN" implies Number OR Upload.
      // I will add `panCard` as URL (upload) and `panNumber` as String? The prompt says "Aadhaar PAN ...".
      // I'll add `panCardImage` and `panNumber`?
      // "Aadhaar (photo upload only)" -> `aadharCardImage`.
      // "PAN" -> `panCardImage` (and maybe `panNumber`?).
      // "Bank Details" -> Object.
      // "FSSAI" -> `fssaiLicenseNumber`? Or `fssaiImage`?
      // "Shop & establishment proof" -> `shopEstablishmentProofImage`.

      // I'll stick to:
      // aadharCardImage (String URL)
      // panCardImage (String URL)
      // fssaiLicense (String - Number)
      // shopEstablishmentProofImage (String URL)
      // bankDetails (Object)
      required: true,
    },

    shopEstablishmentProof: {
      type: String, // URL
      required: true,
    },

    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },

    role: {
      type: String,
      default: "vendor",
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
