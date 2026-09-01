const OTP = require("../models/otp");
const Booking = require("../models/bookings");
const Event = require("../models/event");

// sendBookingEmail bhi email.js se export hona chahiye
const { sendOtpEmail, sendBookingEmail } = require("../utils/email");

// 6-digit OTP banata hai
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOtp = async (req, res) => {
  try {
    console.log("User:", req.user); // user mil raha hai ya nahi

    const otp = generateOtp();

    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    console.log("Old OTP deleted");

    await OTP.create({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    console.log("New OTP saved");

    await sendOtpEmail(req.user.email, otp, "event_booking");

    console.log("Email sent");

    return res.json({
      message: "OTP sent",
    });
  } catch (error) {
    console.error("Send booking OTP error:", error.message);

    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    // OTP verify
    const otpRecord = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.totalSeats <= 0) {
      return res.status(400).json({
        message: "No tickets available",
      });
    }

    // Same user same event dobara book nahi kar sakta
    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      eventId,
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "You have already booked this event",
      });
    }

    // Payment se pehle pending booking
    await Booking.create({
      userId: req.user.id,
      eventId,
      status: "pending",
      paymentStatus: "unPaid",
      amount: event.ticketPrice,
    });

    // OTP use ho gaya, delete karo
    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    return res.status(201).json({
      message: "Booking created. Complete payment to confirm it.",
    });
  } catch (error) {
    console.error("Book event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentStatus } = req.body;

    if (!["paid", "unPaid"].includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    // Pehle galti: paymentStatus ko booking ID bana diya tha
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "confirmed") {
      return res.json({
        message: "Booking is already confirmed",
      });
    }

    const event = await Event.findById(booking.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.totalSeats <= 0) {
      return res.status(400).json({
        message: "No seats available",
      });
    }

    // Payment paid hone par booking confirm
    if (paymentStatus === "paid") {
      booking.status = "confirmed";
      booking.paymentStatus = "paid";

      event.totalSeats -= 1; // seat ek kam
    }

    await booking.save();
    await event.save();

    await sendBookingEmail(req.user.email, event.title, booking.id);

    return res.json({
      message: "Booking confirmed",
    });
  } catch (error) {
    console.error("Confirm booking error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    // findById sirf ek MongoDB id ke liye hota hai
    const bookings = await Booking.find({
      userId: req.user.id,
    }).populate("eventId");

    return res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Confirmed booking cancel hone par seat wapas add hogi
    if (booking.status === "confirmed") {
      const event = await Event.findById(booking.eventId);

      if (event) {
        event.totalSeats += 1;
        await event.save();
      }
    }

    booking.status = "cancelled"; // === nahi, = use hota hai
    await booking.save();

    return res.json({
      message: "Booking cancelled",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};