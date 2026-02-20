import User from "../models/user.js";
import handleResponse from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


/**
 * SEND OTP
 */
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validation
    if (!mobile) {
      return handleResponse(res, 400, "Mobile number is required");
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return handleResponse(res, 400, "Invalid mobile number");
    }

    let user = await User.findOne({ mobile });

    // Auto-register if user not exists
    if (!user) {
      user = await User.create({ mobile });
    }

    // Prevent OTP spam (60 seconds cooldown)
    if (
      user.otpExpiresAt &&
      user.otpExpiresAt > new Date(Date.now() + 4 * 60 * 1000)
    ) {
      return handleResponse(
        res,
        429,
        "Please wait 60 seconds before requesting another OTP"
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    user.otpAttempts = 0;

    await user.save();

    // ⚠️ SMS gateway yahan integrate hoga
    console.log("OTP:", otp);

    return handleResponse(res, 200, "OTP sent successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return handleResponse(res, 400, "Mobile & OTP are required");
    }

    /* ✅ DEV MODE LOGIN */
    if (
      mobile === process.env.USER_DEFAULT_PHONE &&
      otp === process.env.USER_DEFAULT_OTP
    ) {
      let user = await User.findOne({ mobile });

      if (!user) {
        user = await User.create({
          mobile,
          fullName: "Dev User",
          isVerified: true,
        });
      }

      const token = jwt.sign(
        { id: user._id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return handleResponse(res, 200, "Login successful (DEV MODE)", {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          fullName: user.fullName || "Dev User",
          role: "user",
        },
      });
    }

    /* 🔽 NORMAL OTP FLOW */
    const user = await User.findOne({ mobile });

    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    if (user.otpExpiresAt < new Date()) {
      return handleResponse(res, 400, "OTP expired");
    }

    if (user.otpAttempts >= 5) {
      return handleResponse(res, 429, "Too many invalid attempts");
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return handleResponse(res, 400, "Invalid OTP");
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return handleResponse(res, 200, "Login successful", {
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        fullName: user.fullName,
        legalEntityName: user.legalEntityName,
        email: user.email,
        profileImage: user.profileImage,
        role: "user",
      },
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};



// export const verifyOTP = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;

//     // Validation
//     if (!mobile || !otp) {
//       return handleResponse(res, 400, "Mobile & OTP are required");
//     }

//     if (!/^\d{6}$/.test(otp)) {
//       return handleResponse(res, 400, "OTP must be 6 digits");
//     }

//     const user = await User.findOne({ mobile });

//     if (!user) {
//       return handleResponse(res, 404, "User not found");
//     }

//     // OTP expired
//     if (user.otpExpiresAt < new Date()) {
//       return handleResponse(res, 400, "OTP expired");
//     }

//     // Too many attempts
//     if (user.otpAttempts >= 5) {
//       return handleResponse(
//         res,
//         429,
//         "Too many invalid attempts, request new OTP"
//       );
//     }

//     // OTP mismatch
//     if (user.otp !== otp) {
//       user.otpAttempts += 1;
//       await user.save();
//       return handleResponse(res, 400, "Invalid OTP");
//     }

//     // Success
//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpiresAt = null;
//     user.otpAttempts = 0;

//     await user.save();

//     return handleResponse(res, 200, "Login successful", {
//       id: user._id,
//       mobile: user.mobile,
//     });
//   } catch (error) {
//     console.error(error);
//     return handleResponse(res, 500, "Internal server error");
//   }
// };
export const getMe = async (req, res) => {
  try {
    return handleResponse(res, 200, "User profile", req.user);
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return handleResponse(res, 400, "Mobile required");

    const user = await User.findOne({ mobile });
    if (!user)
      return handleResponse(res, 404, "User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    console.log("Forgot OTP:", otp);

    return handleResponse(res, 200, "OTP sent for password reset");
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    if (!mobile || !otp || !newPassword)
      return handleResponse(res, 400, "All fields required");

    const user = await User.findOne({ mobile });
    if (!user)
      return handleResponse(res, 404, "User not found");

    if (user.otp !== otp)
      return handleResponse(res, 400, "Invalid OTP");

    if (user.otpExpiresAt < new Date())
      return handleResponse(res, 400, "OTP expired");

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return handleResponse(res, 200, "Password reset successful");
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};

/**
 * UPDATE PROFILE
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      panNumber,
      legalEntityName,
      address,
      preferences,
      profileImage,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (panNumber !== undefined) user.panNumber = panNumber;
    if (legalEntityName !== undefined) user.legalEntityName = legalEntityName;
    if (address !== undefined) user.address = address;
    if (profileImage !== undefined) user.profileImage = profileImage;

    if (preferences) {
      user.preferences = {
        ...user.preferences.toObject(),
        ...preferences,
      };
    }

    await user.save();

    return handleResponse(res, 200, "Profile updated successfully", user);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

/**
 * CHANGE PASSWORD
 */
export const changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.password) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return handleResponse(res, 200, "Password set successfully");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return handleResponse(res, 400, "Invalid old password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return handleResponse(res, 200, "Password changed successfully");
  } catch (error) {
    return handleResponse(res, 500, "Server error");
  }
};

