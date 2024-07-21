import express, { NextFunction, Request, Response } from "express";
import { StatusCode } from "../3-models/enums";
import { vacationService } from "../5-services/vacation-service";
import { VacationModel } from "../3-models/vacation-model";
import { securityMiddleware } from "../4-middleware/security-middleware";


// Vacation controller:
class VacationController {
  // Create a router object for listening to HTTP requests:
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.get(
      "/vacations/:sortBy/:filterBy/:searchValue?",
      securityMiddleware.verifyLoggedIn,
      this.getAllVacations
    );
    this.router.get(
      "/vacations/:_id([0-9a-fA-F]{24})",
      securityMiddleware.verifyLoggedIn,
      this.getVacationById
    );

    this.router.post(
      "/vacations",
      securityMiddleware.verifyAdmin,
      this.addVacation
    );

    this.router.delete(
      "/vacations",
      securityMiddleware.verifyAdmin,
      this.deleteVacation
    );
    this.router.put(
      "/vacations/:_id([0-9a-fA-F]{24})",
      securityMiddleware.verifyAdmin,
      this.editVacation
    );

    this.router.post(
      "/vacations/many",
      securityMiddleware.verifyAdmin,
      this.addManyVacations
    );

    this.router.patch(
      "/vacations/:_id([0-9a-fA-F]{24})/like",
      securityMiddleware.verifyLoggedIn,
      this.toggleLikeAtVacation
    );
  }

  // Get http://localhost:4000/api/vacations/:sortBy/:filterBy?page=1&limit=9
  private async getAllVacations(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(request.query.page as string) || null;
      const limit = parseInt(request.query.limit as string) || null;
      const { sortBy, filterBy, searchValue } = request.params;

      const vacations = await vacationService.getAllVacations(
        page,
        limit,
        sortBy,
        filterBy,
        searchValue || ""
      );
      response.status(StatusCode.OK).json(vacations);
    } catch (err: any) {
      next(err);
    }
  }

  // GET http://localhost:4000/api/vacations/:_id
  private async getVacationById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const vacation = await vacationService.getVacationById(_id);
      response.status(StatusCode.OK).json(vacation);
    } catch (err: any) {
      next(err);
    }
  }

  // POST http://localhost:4000/api/vacations
  private async addVacation(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const imageFile = request.file;
      const vacation = new VacationModel(request.body);
      const addedVacation = await vacationService.addVacation(
        vacation,
        imageFile
      );
      response.status(StatusCode.OK).json(addedVacation);
    } catch (err: any) {
      next(err);
    }
  }

  //   POST http://localhost:4000/api/vacations/many
  private async addManyVacations(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vacations = request.body;
      const addedVacations = await vacationService.addManyVacations(vacations);
      response.status(StatusCode.OK).json(addedVacations);
    } catch (err: any) {
      next(err);
    }
  }

  //   DELETE http://localhost:4000/api/vacations
  private async deleteVacation(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.body;
      const deletedVacation = await vacationService.deleteVacation(_id);
      response.status(StatusCode.OK).json(deletedVacation);
    } catch (err: any) {
      next(err);
    }
  }

  //   PUT http://localhost:4000/api/vacations/:_id
  private async editVacation(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params;
      const imageFile = request.file;
      const vacation = request.body;
      const updatedVacation = await vacationService.editVacation(
        _id,
        vacation,
        imageFile
      );
      response.status(StatusCode.OK).json(updatedVacation);
    } catch (err: any) {
      next(err);
    }
  }

  // PATCH http://localhost:4000/api/vacations/:id/like
  private async toggleLikeAtVacation(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { _id } = request.params; // Extract vacation ID from URL params
      const { userId } = request.body; // Extract user ID from request body

      if (!_id || !userId) {
        throw new Error("Vacation ID and User ID are required");
      }

      const addedLikeVacation = await vacationService.toggleLikeAtVacation(
        _id,
        userId
      );
      response.status(StatusCode.OK).json(addedLikeVacation);
    } catch (err: any) {
      next(err);
    }
  }
}

const vacationController = new VacationController();
export const vacationRouter = vacationController.router;
