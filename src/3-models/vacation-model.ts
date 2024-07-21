import mongoose, { Document, Schema, model } from "mongoose";
import { UserModel } from "./user-model";
import { appConfig } from "../2-utils/app-config";

export interface IVacationModel extends Document {
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  image: string;
  imageUrl: string;
  likesIds: mongoose.Types.ObjectId[];
  likesCount: number;
}

export const VacationSchema = new Schema<IVacationModel>(
  {
    destination: {
      type: String,
      required: [true, "Missing destination."],
      minlength: [2, "Destination cannot ne shorter than 2 characters."],
      maxlength: [20, "Destination cannot exceed 20 characters."],
    },
    description: {
      type: String,
      required: [true, "Missing description."],
      minlength: [10, "Description cannot ne shorter than 10 characters."],
      maxlength: [3000, "Description cannot exceed 300 characters."],
    },
    startDate: {
      type: Date,
      required: [true, "Missing start date."],
      validate: {
        validator: function (startDate: Date) {
          // Only validate for new documents (POST requests)
          if (this.isNew) {
            return startDate >= new Date();
          }
          return true;
        },
        message: "Start date cannot be earlier than the current date.",
      },
    },
    endDate: {
      type: Date,
      required: [true, "Missing end date."],
      validate: {
        validator: function (this: IVacationModel, endDate: Date) {
          return this.startDate < endDate;
        },
        message: "End date must be later than start date.",
      },
    },
    price: {
      type: Number,
      required: [true, "Missing price"],
      min: [0, "Price cannot be negative."],
    },
    image: {
      type: String,
    },
    likesIds: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    versionKey: false, // Do not create a "__v" field in new documents.
    timestamps: true,
    toJSON: { virtuals: true }, // Allow to get virtual fields.
    id: false, // Don't duplicate _id into id.
  }
);

VacationSchema.pre<IVacationModel>("save", async function (next) {
  this.likesCount = this.likesIds.length;
  next();
});
VacationSchema.virtual("likes", {
  ref: UserModel, // the model we are connected to.
  localField: "likesIds",
  foreignField: "_id",
});

VacationSchema.virtual("imageUrl").get(function (this: IVacationModel) {
  return appConfig.baseImageUrl + this.image;
});

VacationSchema.virtual("likesCount").get(function (this: IVacationModel) {
  return this.likesIds.length;
});

export const VacationModel = model<IVacationModel>(
  "VacationModel",
  VacationSchema,
  "vacations"
);
