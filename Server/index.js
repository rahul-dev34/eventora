const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

const mongoose = require('mongoose')
const authRoutes =require('./routes/auth')
const eventRoutes = require('./routes/events')
const bookingRoutes = require('./routes/booking')
dotenv.config()

const app =express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/bookings', bookingRoutes)




const port = process.env.PORT || 5000

mongoose
.connect(process.env.MONGO_URL)
.then(() => {
    console.log("MongoDB connected ✅");
})
.catch((error) => {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1); // DB ke bina server stop kar do
});

app.listen(port ,()=>{
    console.log(`Server is running on Port ${port}`)
})

