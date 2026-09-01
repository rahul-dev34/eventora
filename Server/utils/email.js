const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // tera email
    pass: process.env.EMAIL_PASSWORD  // tera password/app password
  }
});

 exports.sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendOtpEmail = async(email,otp,type)=>{
  const title = type === 'account_verification' ? 'verify your Eventora account' : 'Event Booking'
  const msg = type === 'account_verification' ? 'Please use the following OTP to verify your new Eventora account.' : 'Please use the following OTP to verify and confirm your event Booking .'

    const mailOptions ={
        from:process.env.EMAIL_USER,
        to:email,
        subject:title,
        html:`<div style='font-family: Arial, sans-serif; text-align: center; padding:20px'>
            <h2 style="color: #111">${title}</h2>
            <p style= 'color: #555; font-size:16px;'>${msg}</p>
            <div style = 'margin:20px auto; padding:15px; font-size:24px;'>${otp}</div>
            <p style='color: #999 ;font-size:12px ;'>this code expires in 5 minute
         </div>`
    }
    await transporter.sendMail(mailOptions)
}