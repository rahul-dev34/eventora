const mongoose = require('mongoose')
const { type } = require('node:os')

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    action:{
        type:String,
        enum:['account_verification','event_booking']
    },
    createdAt:{
        type:String,
        default:Date.now,
        expires:300
    }
})

module.exports= mongoose.model('otp',otpSchema)