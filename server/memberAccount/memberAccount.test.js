const request = require("supertest");

const app = require("../../index");

describe("Member Account Endpoints", () => {
  it("It should  create member in db", async (done) => {
    const res = await request(app)
      .post("/member/createMemberAccount")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      
      .send({
        phone: "9790630454",
        accountActivationDetails: [
          { otp: "4566", activationChannel: "mobile", otpAttemptDone: "0" },
          { otp: "4566", activationChannel: "email", otpAttemptDone: "0" },
        ],
        memberId: "Member1020",
        sponsorId: "1234",
      });
    expect(res.body.body.code).toEqual("200");
    done();
  });
   
  it("It should fail to create member already member exist in db", async (done) => {
    const res = await request(app)
      .post("/member/createMemberAccount")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        phone: "9790630454",
        accountActivationDetails: [
          { otp: "4566", activationChannel: "mobile", otpAttemptDone: "0" },
          { otp: "4566", activationChannel: "email", otpAttemptDone: "0" },
        ],
        memberId: "Member1020",
        sponsorId: "1234",
      });
      
    
    expect(res.body.body.code).toEqual("601");
    
    done();
  });
})
