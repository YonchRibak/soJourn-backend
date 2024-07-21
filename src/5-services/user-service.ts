import { IUserModel, UserModel } from "../3-models/user-model";
import jwt from "jsonwebtoken";

class UserService {
  public async getAllUsers(): Promise<IUserModel[]> {
    const users = await UserModel.find().exec();
    return users;
  }

  public async getUserById(_id: string): Promise<IUserModel> {
    const user = await UserModel.findById(_id);
    return user;
  }

  public async getUserByToken(token: string): Promise<IUserModel> {
    // Extract container from token:
    const container = jwt.decode(token) as { user: IUserModel };
    console.log(container);
    // Extract user:
    const user = container?.user;

    return user;
  }
}

export const userService = new UserService();
