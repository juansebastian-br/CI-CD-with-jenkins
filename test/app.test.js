const request = require("supertest");
const app = require("../src/app");

describe("Web application", () => {
  test("GET / returns HTTP 200", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET /health returns UP", async () => {
    const response = await request(app).get("/health");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "UP" });
  });
});
