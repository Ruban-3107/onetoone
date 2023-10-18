/**
 * Created by sandeep on 02/03/21.
 */
const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;

/**
 * Domain Schema
 */
const EmployeeSchema = new mongoose.Schema({
  employee_code: {
    type: String,
  },
  phone :{
    type: Number
  },
  email :{
    type: String
  },
  domain:{
    type: Schema.Types.ObjectId,
    ref: "_domain",
  },
  company_name : {
    type: Array
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
EmployeeSchema.method({
});

/**
 * Statics
 */
EmployeeSchema.statics = {


  verifyEmployee(condition) {
    console.log(condition+" =>condition in verifyEmployee");
    return this.find(condition)
        // .populate('domain')
        .then((employee) => {
          console.log(employee+" employee in then ");
        if (employee) {
          console.log(employee+" => employee in if");
          return employee;
        }
        const err = new APIError('No such employee exists!', httpStatus.NOT_FOUND);
    return Promise.reject(err);
  });
  }
};

// /**
//  * @typedef Domain
//  */
module.exports = mongoose.model('_employee', EmployeeSchema);
