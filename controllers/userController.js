const User = require("./../model/userModel");

exports.getMe = async (req, res, next) => {
    try{
    const user = await User.findById(req.userId);
    res.status(200).json(user);
    }catch(err){
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    }
  };