// const request = require("supertest");
// const app = require("../../index");
// const dbhandler = require("../helpers/test.dbhandler");

// beforeAll(async (done) => {
//   await dbhandler.connect();
//   done();
// });

// /**
//  * Remove and close the db and server.
//  */
// afterAll(async (done) => {
//   await dbhandler.closeDatabase();
//   done();
// });

// describe("Account Endpoints", () => {
//   it("It should fail to login when there is no entry", async (done) => {
//     const res = await request(app)
//       .post("/api/account/login")
//       .set("Accept", "application/json")
//       .set("Content-Type", "application/json")
//       .send({
//         email: "random@random.com",
//         password: "random",
//       });
//     expect(res.statusCode).toEqual(404);
//     done();
//   });

//   it("should create a new account entry", async (done) => {
//     const res = await request(app)
//       .post("/api/account/register")
//       .set("Accept", "application/json")
//       .set("Content-Type", "application/json")
//       .send({
//         email: "random@random.com",
//         phone: "9008007001",
//         password: "random",
//         first_name: "First",
//         last_name: "Last",
//         employee_code: "8989",
//       });

//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("_id");
//     done();
//   });

//   // it("It should fail to login when user is not activated", async (done) => {
//   //   const res = await request(app)
//   //     .post("/api/account/login")
//   //     .set("Accept", "application/json")
//   //     .set("Content-Type", "application/json")
//   //     .send({
//   //       email: "random@random.com",
//   //       password: "random",
//   //     });
//   //   expect(res.statusCode).toEqual(401);
//   //   done();
//   // });

//   it("It should login with valid password", async (done) => {
//     const res = await request(app)
//       .post("/api/account/login")
//       .set("Accept", "application/json")
//       .set("Content-Type", "application/json")
//       .send({
//         email: "random@random.com",
//         password: "random",
//       });
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("jwt");
//     expect(res.body).toHaveProperty("refreshToken");
//     done();
//   });
// });
