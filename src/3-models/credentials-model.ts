import Joi from "joi";
import { ValidationError } from "./client-errors";

export class CredentialsModel {
  public email: string;
  public password: string;

  public constructor(credentials: CredentialsModel) {
    this.email = credentials.email;
    this.password = credentials.password;
  }
  //Creating a schema for validating credentials:
  private static credentialsSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(4).max(14),
  });

  public validateLogin(): void {
    // Validating login credentials against credentials schema:

    const result = CredentialsModel.credentialsSchema.validate(this);
    if (result.error) throw new ValidationError(result.error.message);
  }
}
