import mongoose from "mongoose";
import { ValidationError } from "../3-models/client-errors";
import { IVacationModel, VacationModel } from "../3-models/vacation-model";

class VacationService {
  public async mainRoute(): Promise<void> {
    try {
      console.log("hello, world");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  // add vacation:
  public async addVacation(
    vacation: IVacationModel,
    image?: Express.Multer.File
  ): Promise<IVacationModel> {
    try {
      const newVacation = new VacationModel(vacation);
      newVacation.image = image?.originalname;
      await newVacation.validate();
      return await newVacation.save();
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  // add many vacations:
  public async addManyVacations(vacations: IVacationModel[]): Promise<void> {
    try {
      await Promise.all(vacations.map((vac) => this.addVacation(vac)));
    } catch (error) {
      throw new Error(`Failed to add vacations: ${error.message}`);
    }
  }

  // get all vacations:
  public async getAllVacations(
    page?: number,
    limit?: number,
    sortByKey: string = "startDate",
    filterBy?: string,
    searchValue?: string
  ): Promise<IVacationModel[]> {
    try {
      const skip = page && limit ? (page - 1) * limit : null;

      // filterBy logic:
      const today = new Date();

      let filterCriteria: any = {};

      if (filterBy === "onGoing") {
        filterCriteria = {
          startDate: { $lt: today },
          endDate: { $gt: today },
        };
      } else if (filterBy === "yetToBegin") {
        filterCriteria = {
          startDate: { $gt: today },
        };
      } else if (mongoose.Types.ObjectId.isValid(filterBy)) {
        filterCriteria = {
          likesIds: { $in: [filterBy] },
        };
      } else if (filterBy === "noFilter") {
        filterCriteria = {};
      }

      // Apply destination criteria if searchValue is provided
      if (searchValue) {
        filterCriteria.destination = {
          $regex: new RegExp(`^${searchValue}`, "i"),
        };
      }

      // sortBy logic:
      const sortOptions: { [key: string]: number } = {
        startDate: 1, // earliest startDate first
        price: 1, // lowest price first
        likesCount: -1, // most likes first
      };

      const sortCriteria = {};
      if (sortOptions.hasOwnProperty(sortByKey)) {
        sortCriteria[sortByKey] = sortOptions[sortByKey];
      } else {
        sortCriteria["startDate"] = 1; // Default sorting key
      }
      const vacations = await VacationModel.find(filterCriteria)
        .populate("image")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .exec();
      return vacations;
    } catch (error) {
      throw new Error(`Failed to get vacations: ${error.message}`);
    }
  }

  // get single vacation by id:
  public async getVacationById(_id: string): Promise<IVacationModel> {
    const vacation = await VacationModel.findById(_id).populate("image").exec();
    return vacation;
  }

  public async toggleLikeAtVacation(
    vacationId: string,
    userId: string
  ): Promise<IVacationModel> {
    try {
      // Find the vacation by vacationId
      const vacation = await VacationModel.findById(vacationId);

      if (!vacation) {
        throw new Error("Vacation not found");
      }

      // Check if userId is already in likesIds array
      const index = vacation.likesIds.indexOf(
        new mongoose.Types.ObjectId(userId)
      );

      if (index === -1) {
        // userId not found in likesIds, add it:
        vacation.likesIds.push(new mongoose.Types.ObjectId(userId));
      } else {
        // userId found in likesIds, remove it:
        vacation.likesIds.splice(index, 1);
      }

      // Save the updated vacation document
      await vacation.save();

      return vacation; // Return the updated vacation document
    } catch (error) {
      throw new Error(`Failed to add like to vacation: ${error.message}`);
    }
  }

  // delete vacation:
  public async deleteVacation(_id: string): Promise<IVacationModel> {
    try {
      const deletedVacation = await VacationModel.findByIdAndDelete(_id).exec();
      if (!deletedVacation) {
        throw new Error("Vacation not found");
      }
      return deletedVacation;
    } catch (error) {
      throw new Error(`Failed to delete vacation: ${error.message}`);
    }
  }

  // edit vacation:
  public async editVacation(
    _id: string,
    vacation: IVacationModel,
    newImage?: Express.Multer.File
  ): Promise<IVacationModel> {
    try {
      // retrieve the current vacation data:
      const existingVacation = await this.getVacationById(_id);
      if (!existingVacation) {
        throw new Error(
          "The vacation you are attempting to edit was not found"
        );
      }

      // update the vacation fields, excluding the _id field:
      const updatedFields: Partial<IVacationModel> = { ...vacation };

      // attach image if new one was sent:
      if (newImage) {
        updatedFields.image = newImage.originalname;
      } else {
        updatedFields.image = existingVacation.image;
      }

      // validate the updated vacation fields:
      const editedVacation = new VacationModel(updatedFields);
      await editedVacation.validate();

      // Perform the update, excluding the _id field
      const updatedVacation = await VacationModel.findByIdAndUpdate(
        _id,
        { $set: updatedFields },
        { new: true } // Return the updated document
      ).exec();
      return updatedVacation;
    } catch (error) {
      throw new Error(`Failed to delete vacation: ${error.message}`);
    }
  }
}

export const vacationService = new VacationService();
