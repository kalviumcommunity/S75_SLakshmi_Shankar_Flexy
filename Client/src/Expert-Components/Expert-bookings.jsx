import React, { useEffect, useState } from 'react';
import { authenticatedFetch } from '../utils/auth';

const ExpertBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingBooking, setProcessingBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/expert-bookings');
            const data = await response.json();
            
            if (response.ok) {
                setBookings(data.bookings);
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
                // Update the booking in the local state
                setBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking._id === bookingId
                            ? { ...booking, status, updatedAt: new Date().toISOString() }
                            : booking
                    )
                );
                alert(`Booking ${status} successfully!`);
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'accepted': return '#28a745';
            case 'declined': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
                <p>Loading bookings...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', color: 'white', minHeight: '100vh' }}>
            <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Booking Requests</h2>
            
            {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>No booking requests yet.</p>
                </div>
            ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {bookings.map((booking) => (
                        <div
                            key={booking._id}
                            style={{
                                backgroundColor: '#333',
                                borderRadius: '10px',
                                padding: '20px',
                                marginBottom: '20px',
                                border: '1px solid #444'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>{booking.clientName}</h3>
                                    <p style={{ margin: '0', color: '#ccc', fontSize: '14px' }}>
                                        Phone: {booking.clientPhone}
                                    </p>
                                </div>
                                <span
                                    style={{
                                        padding: '5px 15px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: getStatusColor(booking.status),
                                        color: 'white',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {booking.status}
                                </span>
                            </div>

                            {booking.message && (
                                <div style={{ marginBottom: '15px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#fff' }}>Message:</p>
                                    <p style={{ 
                                        margin: '0', 
                                        color: '#ddd', 
                                        backgroundColor: '#444', 
                                        padding: '10px', 
                                        borderRadius: '5px',
                                        fontStyle: 'italic'
                                    }}>
                                        "{booking.message}"
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '15px', fontSize: '14px', color: '#aaa' }}>
                                <p style={{ margin: '0' }}>Requested on: {formatDate(booking.createdAt)}</p>
                                {booking.updatedAt !== booking.createdAt && (
                                    <p style={{ margin: '0' }}>Updated: {formatDate(booking.updatedAt)}</p>
                                )}
                            </div>

                            {booking.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleBookingAction(booking._id, 'accepted')}
                                        disabled={processingBooking === booking._id}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            backgroundColor: processingBooking === booking._id ? '#ccc' : '#28a745',
                                            color: 'white',
                                            cursor: processingBooking === booking._id ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {processingBooking === booking._id ? 'Processing...' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleBookingAction(booking._id, 'declined')}
                                        disabled={processingBooking === booking._id}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            backgroundColor: processingBooking === booking._id ? '#ccc' : '#dc3545',
                                            color: 'white',
                                            cursor: processingBooking === booking._id ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold'
                                        }}
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
