const express = require('express')
const router = express.Router()
const {protect , admin}=require('../middleware/auth')

const {getAllEvents ,getEventsById , createEvent , updateEvent , deleteEvent} =require('../controllers/eventcontroller')

router.get('/', getAllEvents);

router.get('/:id',getEventsById)

router.post('/',protect, admin , createEvent)

router.put('/:id' , protect , admin , updateEvent)

router.delete('/:id' , protect , admin ,deleteEvent)

module.exports = router


