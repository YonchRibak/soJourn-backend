import express, { NextFunction, Request, Response } from "express";
import { userService } from "../5-services/user-service";
import { StatusCode } from "../3-models/enums";

// Data controller:
class UserController {
  // Create a router object for listening to HTTP requests:
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get("/users", this.getAllUsers);
    this.router.post("/users/me", this.getUserByToken);
  }

  // GET http://localhost:4000/api/users
  private async getAllUsers(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      response.status(StatusCode.OK).json(users);
    } catch (err: any) {
      next(err);
    }
  }

  // GET http://localhost:4000/api/user/me
  private async getUserByToken(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = request.body;
      const user = await userService.getUserByToken(token);
      response.status(StatusCode.OK).json(user);
    } catch (err: any) {
      next(err);
    }
  }
}

const userController = new UserController();
export const userRouter = userController.router;
