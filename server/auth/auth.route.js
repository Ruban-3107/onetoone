const express = require('express');
const validate = require('express-validation');
const expressJwt = require('express-jwt');
const paramValidation = require('../../config/param-validation');
const authCtrl = require('./auth.controller');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /auth - Returns token if correct username and password is provided */
router.route('/validate')
  .get(authCtrl.validate);

/** GET /auth/refreshtoken - Protected route,
 * To get the fresh access token */
router.route('/refreshtoken')
  // .get( validate(paramValidation.refreshToken),authCtrl.getrefreshtoken);
.get(authCtrl.getrefreshtoken);

module.exports = router;
