const express = require('express');
const authRoutes = require('./server/auth/auth.route');
const accountRoutes = require('./server/account/account.route');
const memberRoutes=require('./server/memberAccount/memberAccount.route')
const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);


// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount auth routes at /account
router.use('/account', accountRoutes);

//mount memberAccount at /member
router.use('/account/member',memberRoutes)






module.exports = router;
