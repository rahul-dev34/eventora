const express = require('express')
const router = express.Router()
const {signup , signin , verifyOtp} = require('../controllers/authcontroller')

router.post('/signup',signup)
router.post('/signin',signin)
router.post('/verify-otp',verifyOtp)

module.exports=router
