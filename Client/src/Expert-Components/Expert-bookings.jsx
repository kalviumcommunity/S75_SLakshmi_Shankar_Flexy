
// ============================================
// IMPROVED EXPERT BOOKINGS COMPONENT
// ============================================

import React, { useEffect, useState } from 'react';
import { authenticatedFetch } from '../utils/auth';
import { Calendar, User, Phone, MessageSquare } from 'lucide-react';

const ExpertBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingBooking, setProcessingBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/expert-bookings');
            const data = await response.json();
            
            if (response.ok) {
                setBookings(data.bookings || []);
            } else {
                console.error('Failed to fetch bookings:', data.message);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (bookingId, status) => {
        if (processingBooking === bookingId) return;
        
        setProcessingBooking(bookingId);
        
        try {
            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/update-booking-status', {
                method: 'PATCH',
                body: JSON.stringify({
                    bookingId,
                    status
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking._id === bookingId
                            ? { ...booking, status, updatedAt: new Date().toISOString() }
                            : booking
                    )
                );
                alert(`Booking ${status === 'accepted' ? 'accepted' : 'declined'} successfully!`);
            } else {
                alert(data.message || `Failed to ${status} booking`);
            }
        } catch (error) {
            console.error(`Error ${status}ing booking:`, error);
            alert(`Failed to ${status} booking. Please try again.`);
        } finally {
            setProcessingBooking(null);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="expert-bookings-container">
                <div className="loading-state">
                    <p>Loading booking requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="expert-bookings-container">
            <h2>All Booking Requests</h2>
            
            {bookings.length === 0 ? (
                <div className="empty-state">
                    <MessageSquare size={64} color="#64748b" style={{ margin: '0 auto 24px' }} />
                    <p>No booking requests yet.</p>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card-standalone">
                            <div className="booking-header">
                                <div>
                                    <h3>
                                        <User size={22} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                                        {booking.clientName}
                                    </h3>
                                    <p>
                                        <Phone size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                        {booking.clientPhone}
                                    </p>
                                </div>
                                <span className={`status-badge ${booking.status}`}>
                                    {booking.status}
                                </span>
                            </div>

                            {booking.message && (
                                <div className="booking-message">
                                    <p><strong>Message from client:</strong></p>
                                    <p>"{booking.message}"</p>
                                </div>
                            )}

                            <div className="booking-dates">
                                <p>
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                    <strong>Requested:</strong> {formatDate(booking.createdAt)}
                                </p>
                                {booking.updatedAt !== booking.createdAt && (
                                    <p>
                                        <strong>Updated:</strong> {formatDate(booking.updatedAt)}
                                    </p>
                                )}
                            </div>

                            {booking.status === 'pending' && (
                                <div className="booking-actions">
                                    <button
                                        className="accept"
                                        onClick={() => handleBookingAction(booking._id, 'accepted')}
                                        disabled={processingBooking === booking._id}
                                    >
                                        {processingBooking === booking._id ? 'Processing...' : 'Accept'}
                                    </button>
                                    <button
                                        className="decline"
                                        onClick={() => handleBookingAction(booking._id, 'declined')}
                                        disabled={processingBooking === booking._id}
                                    >
                                        {processingBooking === booking._id ? 'Processing...' : 'Decline'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpertBookings;