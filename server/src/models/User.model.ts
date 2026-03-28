import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import isValidEmail from "../utils/email.validator.js";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  otp?: string | undefined;
  otpExpiresAt?: Date | undefined;
  isVerified: boolean;
  accountStatus: "ACTIVE" | "DEACTIVE";
  isKycVerified: boolean;
  otpAttempts: number;
  lastOtpSent: Date;
  fcmToken?: string | null | undefined;
  stripeAccountId?: string | undefined;
  rating: {
    average: number;
    count: number;
  };
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [50, "Username cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      validate: {
        validator: isValidEmail,
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "DEACTIVE"],
      default: "ACTIVE"
    },
    isKycVerified: {
      type: Boolean,
      default: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpSent: {
      type: Date,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    stripeAccountId: {
      type: String,
      select: false,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    badges: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;