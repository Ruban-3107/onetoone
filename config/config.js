const { join } = require("bluebird");
const Joi = require("joi");

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require("dotenv").config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(["development", "production", "test", "provision"])
    .default("development"),
  PORT: Joi.number().default(4040),
  OTP_LIMIT_MIN :Joi.number().default(5),
  OTP_USERBLOCK_LIMIT_HR:Joi.number().default(1),
  OTP_MAX_LIMIT:Joi.number().default(5),
  MONGOOSE_DEBUG: Joi.boolean().when("NODE_ENV", {
    is: Joi.string().equal("development"),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  mongoRsConStr:Joi.string(),
  MONGODB_SERVICE_HOST: Joi.string().required().description("Mongo host url"),
  MONGODB_SERVICE_PORT: Joi.number().default(27017),
  MONGODB_DATABASE: Joi.string().required().description("Mongo DB name"),
  MONGODB_USER: Joi.string().when("NODE_ENV", {
    is: Joi.string().equal("production"),
    then: Joi.string().required().description("Mongo user name"),
    otherwise: Joi.string().default(""),
  }),
  MONGODB_PASSWORD: Joi.string().when("NODE_ENV", {
    is: Joi.string().equal("production"),
    then: Joi.string().required().description("Mongo user name"),
    otherwise: Joi.string().default(""),
  }),
  JWT_SECRET: Joi.string().required().description("JWT secret"),
  MESSAGE_QUEUE: Joi.string().required().description("MESSAGE_QUEUE"),
  SALTINGROUNDS: Joi.number().default(10),
  UNKNOWNSPONSORID:Joi.string().default("2022020900001UNK"),
  GUESTSPONSORID:Joi.string().default("2022020900002GUT")
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  otp_limit_min :envVars.OTP_LIMIT_MIN,
  otp_userblock_limit_hr:envVars.OTP_USERBLOCK_LIMIT_HR,
  otp_max_limit:envVars.OTP_MAX_LIMIT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  saltingRounds : envVars.SALTINGROUNDS,
  message_queue: envVars.MESSAGE_QUEUE,
  cms_api_key: envVars.CMS_API_KEY,
  cms_url: envVars.CMS_URL,
  unknownSponsorId:envVars.UNKNOWNSPONSORID,
  guestSponsorId:envVars.GUESTSPONSORID,
  mongoRsConStr:envVars.mongoRsConStr,
  mongo: {
    host: envVars.MONGODB_SERVICE_HOST,
    port: envVars.MONGODB_SERVICE_PORT,
    db: envVars.MONGODB_DATABASE,
    username: envVars.MONGODB_USER,
    password: envVars.MONGODB_PASSWORD,
  },
};

module.exports = config;

