const Event = require("../models/event");

exports.getAllEvents = async (req, res) => {
  try {
    const filters = {};

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.location) {
      filters.location = req.query.location;
    }

    if (req.query.search) {
      filters.title = {
        $regex: req.query.search, // title mein partial match
        $options: "i", // capital/small letter matter nahi karega
      };
    }

    const events = await Event.find(filters);

    return res.json(events);
  } catch (error) {
    console.error("Get all events error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getEventsById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.json(event);
  } catch (error) {
    console.error("Get event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      imageUrl,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      availableSeats: totalSeats, // start mein total seats available hongi
      ticketPrice,
      imageUrl,

      // Admin middleware hai toh ye use karo:
      createdBy: req.user._id,
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      availableSeats,
      imageUrl,
    } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        ticketPrice,
        availableSeats,
        imageUrl,
      },
      {
        new: true, // updated event return karega
        runValidators: true, // schema validation chalegi
      }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.json({
      message: "Event updated",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};