const settingModel = require('../setting/setting.model');

const getSponsorAccId = async () => {
  return await settingModel.sponsorAccount.findOneAndUpdate({ $and : [{"screen": "sponsor_account"},{"sponsorName": {$in: ["_ACC"]}}]}, {$inc: {sponsorAccountId_sequence: 1}},{new: true })
    .exec()
    .then((response) => {
      if (response) {
        console.log(response," response in setting utils")
        console.log(response.sponsorName,"sponsorName response in setting utils")
        console.log(response.sponsorAccountId_sequence,"sponsorAccountId_sequence response in setting utils")
        let sponsorAccountId = response.sponsorName + response.sponsorAccountId_sequence
        console.log(sponsorAccountId)
        return sponsorAccountId;
      }
      const err = new APIError('No such setting exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    })
}

module.exports = getSponsorAccId;