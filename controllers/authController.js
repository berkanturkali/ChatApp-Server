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
      email:document.email,
      fullname:`${document.firstname} ${document.lastname}`
    });  
  };

exports.signup = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      const err = new Error("User already exists");
      err.statusCode = 409;
      return next(err);
    }
    const user = new User({
      firstname,
      lastname,
      email,
      password
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

  exports.protect = async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      const err = new Error("Pleaselogin.");
      err.statusCode = 401;
      return next(err);
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      const err = new Error("Token is not valid");
      err.statusCode = 401;
      return next(err);
    }
    req.userId = user._id;
    next();
  };
  
