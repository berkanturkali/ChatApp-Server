const User = require("./../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };
  
  const createSendToken = (document, statusCode, res) => {
    const token = signToken(document.id);
    document.password = undefined;
    res.status(statusCode).json({
      token,
      email:document.email
    });  
  };

exports.signup = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, interests, photo } = req.body;
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      const err = new Error("Email already exists");
      err.statusCode = 409;
      return next(err);
    }
    const user = new User({
      firstname,
      lastname,
      email,
      password,
      interests,
      photo,
    });
    await user.save();
    res.status(201).send("Success");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error("Please provide valid email or password");
      err.statusCode = 400;
      return next(err);
    }
    const doc = await User.findOne({ email }).select("+password");
    if (!doc || !(await doc.correctPassword(password, doc.password))) {
      const err = new Error("Email or password is incorrect");
      err.statusCode = 402;
      return next(err);
    }
    createSendToken(doc, 200, res);
  };
  exports.getMe = async (req, res, next) => {
    try{
    const account = await User.findById(req.userId);
    res.status(200).json(account);
    }catch(err){
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    }
  };
  
