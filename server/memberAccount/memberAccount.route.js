

const express=require("express")
const router=express.Router()
const memberAccountCtrl=require("./memberAccount.controller")


        
    

router.route("/createMemberAccount")
/** POST /member/creatememberaccount - create memberAccount */
.post(memberAccountCtrl.createMemberAccount);

router.route("/verifyContact")
/** POST /member/verifyContact - create otp */
.post(memberAccountCtrl.verifyContact);

router.route("/verifyAuthorization")
/** POST /member/verifyContact - verify Authorization*/
.post(memberAccountCtrl.verifyAuthorization);

router.route("/refreshtoken")
  /** GET member/refreshtoken - get new jwt token */
.get(memberAccountCtrl.getRefreshToken);

router.route("/getAuthorizationType/:name")
  /** GET member/sponsor/:name - search sponsor by  name */
  .get(memberAccountCtrl.getAuthorizationType);

  router.route("/intergatedsystemlogin").
   /** POST /member/intergatedsystemlogin - Login into account for cms to get refresh token and JWT token */
  post(memberAccountCtrl.intergatedsystemlogin)

  router.route("/getMemberEntitleMent")
  /** POST member/getMemberEntitleMent - get Entitlement based on productId */
  .post(memberAccountCtrl.getMemberEntitleMent);

  router.route("/checkDomain/:email")
  .get(memberAccountCtrl.getDomainEmail)


  






module.exports=router;





