import { describe, it, before } from "mocha";
import supertest from "supertest";
import { expect } from "chai";
import FormData from "form-data";
import fs from "fs";
import { app } from "../src/app";
import jwt from "jsonwebtoken";

describe("VacationController", () => {
  interface UserPayload {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    likedList: any[];
    roleId: number;
    createdAt: string;
    updatedAt: string;
  }

  interface JwtPayload {
    user: UserPayload;
    iat: number;
    exp: number;
  }

  let token: string;
  let adminToken: string;
  let testVacationId: string;
  let image: Buffer;
  let regularUser_id: string;
  let startDate: Date;
  let endDate: Date;

  before(async () => {
    // Login as regular user
    const userResponse = await supertest(app.server)
      .post("/api/login")
      .send({ email: "gal@gmail.com", password: "1234qwer" });
    token = userResponse.body;

    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken === "string") {
      throw new Error("Failed to decode token");
    }

    const payload = decodedToken as JwtPayload;

    if (!payload.user || !payload.user._id) {
      throw new Error("User ID not found in token");
    }

    regularUser_id = payload.user._id;

    // Login as admin
    const adminResponse = await supertest(app.server)
      .post("/api/login")
      .send({ email: "yonch.baalil@gmail.com", password: "1234" });
    adminToken = adminResponse.body;

    // Read test image
    image = fs.readFileSync(__dirname + "\\resources\\madrid.jpg");

    // Set startDate to tomorrow midnight.
    startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0); // Set to midnight

    // Set endDate to 7 days after startDate
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const formData = new FormData();
    formData.append("destination", "Test Destination");
    formData.append("description", "Test Description");
    formData.append("price", "1000");
    formData.append("startDate", startDate.toISOString());
    formData.append("endDate", endDate.toISOString());
    formData.append("image", image, {
      filename: "test-image.jpg",
      contentType: "image/jpeg",
    });

    // Add testVacation to DB to be handled in tests and later deleted
    const res = await supertest(app.server)
      .post("/api/vacations")
      .set("Authorization", `Bearer ${adminToken}`)
      .set(formData.getHeaders())
      .send(formData.getBuffer());

    expect(res.status).to.equal(200);
    expect(res.body).to.have.all.keys(
      "_id",
      "createdAt",
      "destination",
      "description",
      "endDate",
      "image",
      "imageUrl",
      "likesCount",
      "likesIds",
      "price",
      "startDate",
      "updatedAt"
    );
    testVacationId = res.body._id;
  });

  describe("GET /vacations/:sortBy/:filterBy/:searchValue?", () => {
    it("should return an array of vacations", async () => {
      const res = await supertest(app.server)
        .get("/api/vacations/startDate/noFilter/")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json");

      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.all.keys(
          "_id",
          "createdAt",
          "destination",
          "description",
          "endDate",
          "image",
          "imageUrl",
          "likesCount",
          "likesIds",
          "price",
          "startDate",
          "updatedAt"
        );
      } else {
        console.log("Warning: Vacations array is empty");
      }
    });
  });

  describe("GET /vacations/:_id", () => {
    it("should return a specific vacation by ID", async () => {
      const res = await supertest(app.server)
        .get(`/api/vacations/${testVacationId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        "_id",
        "createdAt",
        "destination",
        "description",
        "endDate",
        "image",
        "imageUrl",
        "likesCount",
        "likesIds",
        "price",
        "startDate",
        "updatedAt"
      );
    });
  });

  describe("PUT /vacations/:_id", () => {
    it("should edit a vacation", async () => {
      const formData = new FormData();
      formData.append("destination", "Updated Destination");
      formData.append("description", "Updated Description");
      formData.append("price", "1500");
      formData.append(
        "startDate",
        new Date().setDate(startDate.getDate() + 2).toString()
      );
      formData.append(
        "endDate",
        new Date().setDate(endDate.getDate() + 10).toString()
      );
      formData.append("image", image, {
        filename: "updated-image.jpg",
        contentType: "image/jpeg",
      });

      const res = await supertest(app.server)
        .put(`/api/vacations/${testVacationId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .set(formData.getHeaders())
        .send(formData.getBuffer());

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("destination", "Updated Destination");
    });
  });

  describe("PATCH /vacations/:_id/like", () => {
    it("should add regularUser_id to testVacation's likesIds", async () => {
      const res = await supertest(app.server)
        .patch(`/api/vacations/${testVacationId}/like`)
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: regularUser_id });

      expect(res.status).to.equal(200);
      expect(res.body)
        .to.have.property("likesIds")
        .that.includes(regularUser_id);
    });
  });

  describe("DELETE /vacations", () => {
    it("should delete a vacation", async () => {
      const res = await supertest(app.server)
        .delete("/api/vacations")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ _id: testVacationId });

      if (res.status !== 200) {
        console.log("Delete vacation failed. Response:", res.body);
      }

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("_id", testVacationId);
    });
  });
});
