const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  interests: [String],
  photo: String,
  aboutMe:{
    type:String,
    default:""
  }
});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  docPassword
){
  return await bcrypt.compare(candidatePassword,docPassword);
};


module.exports = mongoose.model("User", userSchema);
