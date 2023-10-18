const Joi = require('joi');

module.exports = {
  // POST /api/account/register
  createAccount: {
    body: {
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
      phone: Joi.string().regex(/^[1-9][0-9]{9}$/).required(),
      activated: Joi.string().required(),
      cmsData: Joi.string().required(),
      accountType: Joi.string().required(),
      appId: Joi.string().required(),
      userAccountType: Joi.string().required(),
      authenticationType: Joi.string().required(),
      entityId: Joi.string().required(),
      isActive: Joi.string().required(),
      source: Joi.string().required()
    }
  },


  // UPDATE /api/account/refreshtoken
  refreshToken: {
    query: {
      refreshtoken: Joi.string().required(),
    }
  },


  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
