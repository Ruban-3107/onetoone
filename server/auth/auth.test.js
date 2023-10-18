// const request = require("supertest");
// const app = require("../../index");
// const dbhandler = require("../helpers/test.dbhandler");
// let jwtToken;
// let refreshToken;

// beforeAll(async (done) => {
//   await dbhandler.connect();
//   request(app)
//     .post("/api/account/register")
//     .send({
//       email: "random@random.com",
//       phone: "9008007001",
//       password: "random",
//       first_name: "First",
//       last_name: "Last",
//       employee_code: "8989",
//     })
//     .end((err, response) => {
//       done();
//     });
// });

// /**
//  * Remove and close the db and server.
//  */
//  afterAll(async (done) => {
//   await dbhandler.closeDatabase();
//   done();
// });

// describe("Auth Endpoints", () => {
//   beforeAll(async (done) => {
//     request(app)
//       .post("/api/account/login")
//       .send({
//         email: "random@random.com",
//         password: "random",
//       })
//       .end((err, response) => {
//         jwtToken = response.body.jwt;
//         refreshToken = response.body.refreshToken;
//         done(); // save the token!
//       });
//   });
//   it("it should validate the token", async (done) => {
//     const res = await request(app)
//       .get("/api/auth/validate")
//       .set("Authorization", `Bearer ${jwtToken}`)
//       .set("Accept", "application/json")
//       .set("Content-Type", "application/json");
//     expect(res.statusCode).toEqual(200);
//     done();
//   });

//   it("It should fetch new refresh token", async (done) => {
//     const res = await request(app)
//       .get("/api/auth/refreshtoken")
//       .set("Accept", "application/json")
//       .set("Content-Type", "application/json")
//       .query({
//         refreshtoken: refreshToken,
//       });
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("jwt");
//     expect(res.body).toHaveProperty("refreshToken");
//     done();
//   });
// });
