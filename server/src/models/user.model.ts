import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  plan: "free" | "pro";
  credits: number;
  isVerified: boolean;
  role: "user" | "admin";
  provider: "local" | "google";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  refreshToken: String;

  comparePassword(password: string): Promise<boolean>;
  generateToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    credits: {
      type: Number,
      default: 3,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    refreshToken: {
      type: String,
    },

    lastLogin: { type: Date },
  },
  { timestamps: true }
);

//
// 🔐 HASH PASSWORD BEFORE SAVE
//
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//
// 🔍 COMPARE PASSWORD METHOD
//
userSchema.methods.comparePassword = async function (
  password: string
) {
  return await bcrypt.compare(password, this.password);
};

//
// 🎟 GENERATE JWT TOKEN
//
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      plan: this.plan,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
};

export default mongoose.model<IUser>("User", userSchema);