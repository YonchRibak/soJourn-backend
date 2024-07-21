import { NextFunction, Request, Response } from "express";
import { cyber } from "../2-utils/cyber";
import { UnauthorizedError } from "../3-models/client-errors";
import striptags from "striptags";

class SecurityMiddleware {
  public verifyLoggedIn(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const authorization = request.header("authorization");

    const token = authorization?.substring(7); //  7 --> token index

    // If not valid:
    if (!cyber.isTokenValid(token)) {
      const err = new UnauthorizedError("You are not logged in.");
      next(err);
    } else {
      next();
    }
  }

  public verifyAdmin(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const authorization = request.header("authorization");

    const token = authorization?.substring(7); //  7 --> token index

    // If user is not admin:
    if (!cyber.isAdmin(token)) {
      const err = new UnauthorizedError("You are not authorized.");
      next(err);
    } else {
      next();
    }
  }
  // When to skip rate limit
  public skipRateLimit(request: Request): boolean {
    return request.originalUrl.startsWith("/api/vacations/images/");
  }
  // Strip tags from any given string:
  public sanitizeXss(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    for (const prop in request.body) {
      if (typeof request.body[prop] === "string") {
        request.body[prop] = striptags(request.body[prop]);
      }
    }

    next();
  }
}

export const securityMiddleware = new SecurityMiddleware();
