const mongoose = require('mongoose')   // CommonJS

const bookingSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event',
        required:true
    },
    Status:{
        type:String,
        enum:['pending', 'confirmed' , 'cancelled'],
        default:'pending'
    },
    paymentStatus:{
        type : String,
        enum:['paid','unPaid'],
        default:'unPaid',

    },
    amount:{
        type:Number,
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model('Booking', bookingSchema)