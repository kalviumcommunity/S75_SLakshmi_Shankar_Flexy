const express = require('express');
const router = express.Router();
const Booking = require('../Schema/Booking-schema');
const Client = require('../Schema/Client-schema');
const Expert = require('../Schema/Expert-schema');
const auth = require('../middleware/auth');

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

router.post('/create-booking', auth, async (req, res) => {
  try {
    const { expertId, message } = req.body;
    const userIdentifier = req.user.id;

    console.log('Booking request data:', { expertId, message, userIdentifier, role: req.user.role });

    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        message: 'Only clients can create bookings',
        success: false 
      });
    }

    if (!userIdentifier) {
      return res.status(400).json({ 
        message: 'User ID not found in token',
        success: false 
      });
    }

    if (!expertId) {
      return res.status(400).json({ 
        message: 'Expert ID is required',
        success: false 
      });
    }

    if (!isValidObjectId(expertId)) {
      return res.status(400).json({ 
        message: 'Invalid expert ID format',
        success: false 
      });
    }

    const client = await Client.findOne({ phone: userIdentifier });
    if (!client) {
      return res.status(404).json({ 
        message: 'Client not found',
        success: false 
      });
    }

    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ 
        message: 'Expert not found',
        success: false 
      });
    }

    const newBooking = new Booking({
      clientId: client._id,
      expertId,
      clientName: client.name,
      clientPhone: client.phone.toString(),
      expertName: expert.name,
      expertProfession: expert.profession,
      message: message || '',
      status: 'pending'
    });

    await newBooking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(expert.contact.toString()).emit('new-booking', {
        booking: newBooking,
        message: `New booking request from ${client.name}`
      });
      
      console.log(`✅ Socket event emitted to expert room: ${expert.contact}`);
    }

    res.status(201).json({
      message: 'Booking request sent successfully',
      booking: newBooking,
      success: true
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      success: false
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  router.get('/testforbooking', async (req, res) => {
    try {
      const allData = await Booking.find();
      return res.status(200).json({
        DATA: allData,
        success: true
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        success: false
      });
    }
  });
}

router.get('/expert-bookings', auth, async (req, res) => {
  try {
    const expertContact = req.user.id;

    if (req.user.role !== 'expert') {
      return res.status(403).json({ 
        message: 'Only experts can access this endpoint',
        success: false 
      });
    }

    const expert = await Expert.findOne({ contact: expertContact });
    
    if (!expert) {
      return res.status(404).json({ 
        message: 'Expert not found',
        searchedContact: expertContact,
        success: false
      });
    }

    const bookings = await Booking.find({ expertId: expert._id })
      .sort({ createdAt: -1 })
      .populate('clientId', 'name phone');

    res.status(200).json({ 
      bookings,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching expert bookings:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
});

router.get('/client-bookings', auth, async (req, res) => {
  try {
    const clientPhone = req.user.id;

    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        message: 'Only clients can access this endpoint',
        success: false 
      });
    }

    const client = await Client.findOne({ phone: clientPhone });
    
    if (!client) {
      return res.status(404).json({ 
        message: 'Client not found',
        searchedPhone: clientPhone,
        success: false
      });
    }

    const bookings = await Booking.find({ clientId: client._id })
      .sort({ createdAt: -1 })
      .populate('expertId', 'name profession contact location');

    res.status(200).json({ 
      bookings,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
});

router.patch('/update-booking-status', auth, async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const expertContact = req.user.id;

    if (req.user.role !== 'expert') {
      return res.status(403).json({ 
        message: 'Only experts can update booking status',
        success: false 
      });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be "accepted" or "declined"',
        success: false 
      });
    }

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ 
        message: 'Invalid booking ID format',
        success: false 
      });
    }

    const expert = await Expert.findOne({ contact: expertContact });
    
    if (!expert) {
      return res.status(404).json({ 
        message: 'Expert not found',
        success: false 
      });
    }

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      expertId: expert._id 
    }).populate('clientId', 'phone');

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found or you are not authorized to update this booking',
        success: false 
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        message: `This booking has already been ${booking.status}`,
        success: false 
      });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    const io = req.app.get('io');
    if (io && booking.clientId) {
      const clientPhone = booking.clientId.phone || booking.clientPhone;
      io.to(clientPhone.toString()).emit('booking-status-update', {
        bookingId: booking._id,
        status,
        expertName: expert.name,
        message: `Your booking has been ${status} by ${expert.name}`
      });
      
      console.log(`✅ Socket event emitted to client room: ${clientPhone}`);
    }

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
      success: true
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
});

module.exports = router;