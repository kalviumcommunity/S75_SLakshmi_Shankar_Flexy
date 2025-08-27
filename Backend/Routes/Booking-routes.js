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
        const clientId = req.user.id;

        // Get client and expert details
        const client = await Client.findById(clientId);
        const expert = await Expert.findById(expertId);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (!expert) {
            return res.status(404).json({ message: 'Expert not found' });
        }

        // Check if there's already a pending booking
        const existingBooking = await Booking.findOne({
            clientId,
            expertId,
            status: 'pending'
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You already have a pending booking request with this expert' });
        }

        const newBooking = new Booking({
            clientId,
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
        res.status(500).json({ message: 'Internal server error' });
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
        const expertId = req.user.id;

        const bookings = await Booking.find({ expertId })
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
        const expertId = req.user.id;

        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "declined"' });
        }

        const booking = await Booking.findOne({ _id: bookingId, expertId });

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
