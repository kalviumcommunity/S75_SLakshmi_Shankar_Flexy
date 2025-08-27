// ExpertHome.jsx
import React, { useEffect, useState } from "react";
import "../styles/ExpertsHome.css";
import { authenticatedFetch } from '../utils/auth';

const ExpertHome = () => {
  const [user, setUser] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(null);

  const getUser = async () => {
    try {
      const response = await fetch(
        "https://flexy-backend.onrender.com/api/get-by-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: localStorage.getItem('expertId') }), // pass logged-in expert ID
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Failed to fetch expert:", response);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === bookingId
              ? { ...booking, status, updatedAt: new Date().toISOString() }
              : booking
          )
        );
        await fetchBookings(); // Refresh bookings after successful action
        alert(`Booking ${status}ed successfully!`);
        
        // Notify other components that booking status changed
        window.dispatchEvent(new CustomEvent('bookingStatusChanged', { 
          detail: { bookingId, status } 
        }));
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
    getUser();
    fetchBookings();
    console.log(localStorage.getItem('expertId'))

    // Listen for new booking events to refresh automatically
    const handleBookingCreated = () => {
      fetchBookings();
    };

    window.addEventListener('bookingCreated', handleBookingCreated);

    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
    };
  }, [])

  return (
    <div className="expert-home">
      {/* Profile Section */}
      <div className="profile-card">
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Contact:</strong> {user.contact}</p>
          <p><strong>Profession:</strong> {user.profession}</p>
        </div>

        <div className="booking-card">
          <h4>Booking Requests</h4>
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p>No booking requests yet.</p>
          ) : (
            bookings.filter(booking => booking.status === 'pending').map((booking) => (
              <div key={booking._id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <p><strong>Client:</strong> {booking.clientName}</p>
                <p><strong>Phone:</strong> {booking.clientPhone}</p>
                {booking.message && (
                  <p><strong>Message:</strong> "{booking.message}"</p>
                )}
                <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                <div className="buttons">
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
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ExpertHome;
