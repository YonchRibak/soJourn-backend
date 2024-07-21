import { IUserModel } from "../3-models/user-model";
import jwt, { SignOptions } from "jsonwebtoken";
import { appConfig } from "./app-config";
import crypto from "crypto";
import { Role } from "../3-models/enums";

class Cyber {
  public getNewToken(user: IUserModel): string {
    // Remove password form user:

    delete user.password;

    // create container object containing the user"
    const container = { user };

    const options: SignOptions = { expiresIn: "3d" };
    const token = jwt.sign(container, appConfig.jwtSecretKey, options);
    return token;
  }

  // Check if token is valid:
  public isTokenValid(token: string): boolean {
    try {
      // If no token:
      if (!token) return false;

      // Verify token:
      jwt.verify(token, appConfig.jwtSecretKey);

      // All is good:
      return true;
    } catch (err: any) {
      //Some error:
      return false;
    }
  }

  public isAdmin(token: string): boolean {
    // Extract container from token:
    const container = jwt.decode(token) as { user: IUserModel };

    // Extract user:
    const user = container.user;

    return user.roleId === Role.Admin;
  }

  // Hash Password:

  public hashPassword(plainText: string): string {
    const hashedPassword = crypto
      .createHmac("sha512", appConfig.passwordSalt)
      .update(plainText)
      .digest("hex");

    return hashedPassword;
  }
}

export const cyber = new Cyber();
