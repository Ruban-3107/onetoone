const settingModel = require('../setting/setting.model');

const memberId = async () =>{
  return await settingModel.memberUniqueId.findOneAndUpdate({"Id": "member"}, {$inc: {memberId_sequence : 1}},{new: true })
    .exec()
    .then((response) => {
      if(response)
        return response.memberId_name + response.memberId_sequence;

    const err = new APIError('No such setting exists!', httpStatus.NOT_FOUND);
    return Promise.reject(err);
  })
}

module.exports = memberId;