import mongoose, { Document, Schema, model } from "mongoose";
import { Role } from "./enums";
import { VacationModel } from "./vacation-model";

export interface IUserModel extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: Role;
  likedList: mongoose.Types.ObjectId[];
}

export const UserSchema = new Schema<IUserModel>(
  {
    firstName: {
      type: String,
      required: [true, "Missing first name."],
      minlength: [2, "First name cannot ne shorter than 2 characters."],
      maxlength: [20, "First name cannot exceed 20 characters."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Missing last name."],
      minlength: [2, "Last name cannot ne shorter than 2 characters."],
      maxlength: [20, "Last name cannot exceed 20 characters."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Missing email."],
      trim: true,
      unique: true,
      validate: {
        validator: async function (email: string) {
          const user = await this.constructor.findOne({ email });
          return !user;
        },
        message: "There is already an account with this email address.",
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Missing password"],
      minlength: [4, "Password cannot ne shorter than 4 characters."],
    },
    roleId: {
      type: Number,
      enum: [Role.Admin, Role.RegularUser],
    },
    likedList: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true }, // Allow to get virtual fields.
    id: false, // Don't duplicate _id into id.
  }
);

UserSchema.virtual("vacationsLiked", {
  ref: VacationModel,
  localField: "LikedList",
  foreignField: "_id",
});

export const UserModel = model<IUserModel>("UserModel", UserSchema, "users");
