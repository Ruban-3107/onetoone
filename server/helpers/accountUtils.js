const settingModel = require('../setting/setting.model');

const accountId = async () =>{
    
  return await settingModel.memberUniqueId.findOneAndUpdate({"Id": "member"}, {$inc: {accountId_sequence : 1}},{new: true })
    .exec()
    .then((response) => {
        
      if(response)
      return response.accountId_name + response.accountId_sequence;

    const err = new APIError('No such setting exists!', httpStatus.NOT_FOUND);
    return Promise.reject(err);
  })
}

module.exports = accountId;