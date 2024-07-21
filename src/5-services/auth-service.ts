import { cyber } from "../2-utils/cyber";
import { UnauthorizedError, ValidationError } from "../3-models/client-errors";
import { CredentialsModel } from "../3-models/credentials-model";
import { Role } from "../3-models/enums";
import { IUserModel, UserModel } from "../3-models/user-model";

class AuthService {
  // Register new user:
  public async register(user: IUserModel): Promise<string> {
    try {
      await user.validate();
    } catch (err: any) {
      throw new ValidationError(err.message);
    }
    user.roleId = Role.RegularUser;

    user.password = cyber.hashPassword(user.password);
    user.save();

    const token = cyber.getNewToken(user);
    return token;
  }

  // Login:
  public async login(credentials: CredentialsModel): Promise<string> {
    credentials.validateLogin();
    console.log("Attempting login with email:", credentials.email);
    console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY);
    console.log("PASSWORD_SALT:", process.env.PASSWORD_SALT);
    credentials.password = cyber.hashPassword(credentials.password);

    const user = await UserModel.findOne({
      email: credentials.email,
      password: credentials.password,
    });
    if (!user) {
      throw new UnauthorizedError("Incorrect email or password.");
    }

    const token = cyber.getNewToken(user);
    return token;
  }
}

export const authService = new AuthService();
