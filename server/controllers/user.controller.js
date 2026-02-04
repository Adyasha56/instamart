import { User } from "../models/User.js";
import { Responses } from "../utils/response.js";

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      message: "User profile retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!name && !email && !phone) {
      return Responses.failResponse(
        res,
        "At least one field (name, email, or phone) is required",
        400
      );
    }

    // Check if email already exists (if being updated)
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return Responses.failResponse(res, "Email already in use", 409);
      }
    }

    // Check if phone already exists (if being updated)
    if (phone && phone !== req.user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return Responses.failResponse(res, "Phone number already in use", 409);
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return Responses.failResponse(res, "User not found", 404);
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Responses.failResponse(
        res,
        "Current password, new password, and confirmation are required",
        400
      );
    }

    if (newPassword !== confirmPassword) {
      return Responses.failResponse(
        res,
        "New password and confirmation do not match",
        400
      );
    }

    if (newPassword.length < 6) {
      return Responses.failResponse(
        res,
        "New password must be at least 6 characters",
        400
      );
    }

    // Get user with password field
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return Responses.failResponse(res, "User not found", 404);
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return Responses.failResponse(res, "Current password is incorrect", 401);
    }

    // Check if new password is same as current
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return Responses.failResponse(
        res,
        "New password must be different from current password",
        400
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
