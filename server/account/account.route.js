const express = require("express");
const validate = require("express-validation");
const paramValidation = require("../../config/param-validation");
const accountCtrl = require("./account.controller");
const { post } = require("request-promise");
const accountRequestWrapper = require("./account.wrapper");

const router = express.Router(); // eslint-disable-line new-cap

// api is used by CMS to create an account and user as registered account on app
// should be moved to api server as this an unprotected route
router
  .route("/register")
  /** POST /account/register - Create new account */
  .post(
    (req, res, next) => new accountRequestWrapper(req).wrap(next),
    accountCtrl.create
  );
  

  
router.route("/accountActivated/update")
  /** PUT /accountActivated/update - update account From CMS */ 
 .put(accountCtrl.updateDataFromCms);  

router.route("/generate-otp")
  /** POST /account/generate-otp - generate otp and update */
  .post(accountCtrl.generateOtp);

router.route("/verify-otp")
  /** POST /account/verify-otp - verify otp and update status of verification */
  .post(accountCtrl.verifyOtp);

router.route('/verify-domain/:domain')
  /** GET /account/verify-domain/:domain - verify domain from email entered by user */
  .get(accountCtrl.get);

router.route("/verify/authentication-type")
  /** post /account/verify/authentication-type- verify employee_code or qr_code entered by user  */
  .post(accountCtrl.verifyAuthType);

// router.route('/verify-employee-email/:email')     // logic to be used by ruban
// /** GET account/verify-domain/:domain - Get domain */
//   .get(accountCtrl.verifyEmployee);

router.route("/register/update")
  /** post /account/register/update- Update account */
  .post(accountCtrl.updateRegisterAccount);

router.route("/activate")
  /** POST /account/activate - generate otp and update */
  .post(accountCtrl.activateAccount);

router.route("/login-otp").post(accountCtrl.loginOtp);
/** POST /account/login-otp */

router.route("/verifyCompany")//******** */ added for company ******************
  .post(accountCtrl.verifyCompany);

router.route("/domain")
  /** GET account/domain - Get list of domain */
  .get(accountCtrl.listDomain);
  
  
router.route("/company")
  /** GET account/company - Get list of company */
  .get(accountCtrl.listCompany);

router.route("/domain/:name")
  /** GET account/domain/:name - search domain by company name */
  .get(accountCtrl.searchDomain);

router.route("/domain")
  /** POST account/domain - Create domain for a guest user */
  .post(accountCtrl.createDomain);

router.route("/intergatedsystemlogin")
  /** POST /account/intergatedsystemlogin - Login into account for cms to get refresh token and JWT token */
  .post(accountCtrl.intergatedsystemlogin);

router.route("/auth/refreshtoken")
  /** GET /account/auth/refreshtoken - get new jwt token account */
  .get(accountCtrl.getrefreshtoken);

router.route("/login")
  /** POST /account/login - Login into account */ // not sure if its used to be checked on frontend
  .post(accountCtrl.login);

router.route("/login-verify")
  /** POST /account/login-verify - Login into account */
  .post(accountCtrl.loginVerify);

router.route("/update")
  /** post /account/update- Update account */ //not sure if its used to be checked on frontend
  .post(accountCtrl.updateAccount);

router.route("/carousel")                      // not used to be removed after testing
  // /** GET account/carousel - Get domain */
  .get(accountCtrl.getCarousel);

router.route("/leaploginvideo")                 // not used to be removed after testing
  // /** GET account/leaploginvideo - Get leap login page setting screen */
  .get(accountCtrl.getLeapLoginVideo);


/** Load user when API with domain route parameter is hit */
router.param('domain', accountCtrl.getDomain);

module.exports = router;
