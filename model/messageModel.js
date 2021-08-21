const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message:{
        type:String,
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    room:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Room'
    },
    createdAt:{
        type:Number
    },
});

module.exports = mongoose.model('Message',messageSchema);