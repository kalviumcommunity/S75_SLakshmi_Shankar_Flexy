const express = require('express');
const router = express.Router();
const Booking = require('../Schema/Booking-schema');
const Client = require('../Schema/Client-schema');
const Expert = require('../Schema/Expert-schema');
const Auth = require('../middleware/auth');

// Create a new booking request
router.post('/create-booking', Auth, async (req, res) => {
    try {
        const { expertId, message } = req.body;
        const userIdentifier = req.user.id;

        console.log('Booking request data:', { expertId, message, userIdentifier, userObj: req.user });

        if (!userIdentifier) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        if (!expertId) {
            return res.status(400).json({ message: 'Expert ID is required' });
        }

        // Get client and expert details - find by phone for client, _id for expert
        const client = await Client.findOne({ phone: userIdentifier });
        const expert = await Expert.findById(expertId);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (!expert) {
            return res.status(404).json({ message: 'Expert not found' });
        }

        // Check if there's already a pending booking
        const existingBooking = await Booking.findOne({
            clientId: client._id,
            expertId,
            status: 'pending'
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You already have a pending booking request with this expert' });
        }

        const newBooking = new Booking({
            clientId: client._id,
            expertId,
            clientName: client.name,
            clientPhone: client.phone.toString(),
            expertName: expert.name,
            expertProfession: expert.profession,
            message: message || ''
        });

        await newBooking.save();

        res.status(201).json({
            message: 'Booking request sent successfully',
            booking: newBooking
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.get('/testforbooking', async(req, res) => {
    try {
        const allData = await Booking.find();
        return res.status(200).json({
            DATA: allData
        })
    } catch(err) {
        return res.status(500).json({
            message: err.message
        })
    }
})

// Get all bookings for an expert
router.get('/expert-bookings', Auth, async (req, res) => {
    try {
        const expertContact = req.user.id;

        // Find expert by contact field (JWT uses contact as id)
        // Try both string and number formats to handle data type mismatches
        const expert = await Expert.findOne({ 
            $or: [
                { contact: expertContact },
                { contact: expertContact.toString() },
                { contact: parseInt(expertContact) }
            ]
        });
        
        if (!expert) {
            return res.status(404).json({ 
                message: 'Expert not found',
                searchedContact: expertContact
            });
        }

        const bookings = await Booking.find({ expertId: expert._id })
            .sort({ createdAt: -1 })
            .populate('clientId', 'name phone');

        res.status(200).json({ bookings });

    } catch (error) {
        console.error('Error fetching expert bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all bookings for a client
router.get('/client-bookings', Auth, async (req, res) => {
    try {
        const clientId = req.user.id;

        const bookings = await Booking.find({ clientId })
            .sort({ createdAt: -1 })
            .populate('expertId', 'name profession contact location');

        res.status(200).json({ bookings });

    } catch (error) {
        console.error('Error fetching client bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update booking status (accept/decline)
router.patch('/update-booking-status', Auth, async (req, res) => {
    try {
        const { bookingId, status } = req.body;
        const expertContact = req.user.id;

        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "declined"' });
        }

        // Find expert by contact field - handle data type mismatches
        const expert = await Expert.findOne({ 
            $or: [
                { contact: expertContact },
                { contact: expertContact.toString() },
                { contact: parseInt(expertContact) }
            ]
        });
        
        if (!expert) {
            return res.status(404).json({ message: 'Expert not found' });
        }

        const booking = await Booking.findOne({ _id: bookingId, expertId: expert._id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or you are not authorized to update this booking' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'This booking has already been processed' });
        }

        booking.status = status;
        booking.updatedAt = new Date();
        await booking.save();

        res.status(200).json({
            message: `Booking ${status} successfully`,
            booking
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
