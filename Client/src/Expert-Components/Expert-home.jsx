// ============================================
// IMPROVED EXPERT HOME COMPONENT
// ============================================

import React, { useEffect, useState } from "react";
import "../styles/ExpertsHome.css";
import { authenticatedFetch } from '../utils/auth';
import { User, Phone, Briefcase, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

const ExpertHome = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [error, setError] = useState(null);

  const getUser = async () => {
    try {
      const expertId = localStorage.getItem('expertId');
      
      if (!expertId) {
        setError('Expert ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://flexy-backend.onrender.com/api/get-by-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: expertId }),
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Failed to fetch expert:", response);
        setError('Failed to load profile information');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Network error. Please try again.');
    }
  };

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
        // Update booking in local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === bookingId
              ? { ...booking, status, updatedAt: new Date().toISOString() }
              : booking
          )
        );
        
        // Refresh bookings list
        await fetchBookings();
        
        alert(`Booking ${status === 'accepted' ? 'accepted' : 'declined'} successfully!`);
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('bookingStatusChanged', { 
          detail: { bookingId, status } 
        }));
      } else {
        alert(data.message || `Failed to ${status} booking`);
      }
    } catch (error) {
      console.error(`Error ${status}ing booking:`, error);
      alert(`Network error. Failed to ${status} booking.`);
    } finally {
      setProcessingBooking(null);
    }
  };

  useEffect(() => {
    getUser();
    fetchBookings();

    // Listen for new booking events
    const handleBookingCreated = () => {
      fetchBookings();
    };

    window.addEventListener('bookingCreated', handleBookingCreated);

    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
    };
  }, []);

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  if (error) {
    return (
      <div className="expert-home">
        <div className="profile-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: '#dc2626', marginBottom: '12px', fontSize: '20px' }}>{error}</h3>
          <button 
            onClick={() => window.location.href = '/expert-login'}
            style={{
              marginTop: '24px',
              padding: '12px 32px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="expert-home">
      <div className="profile-card">
        {/* Profile Section */}
        <div className="profile-details">
          <p>
            <strong><User size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />Name:</strong> 
            {user?.name || 'Loading...'}
          </p>
          <p>
            <strong><Phone size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />Contact:</strong> 
            {user?.contact || 'Loading...'}
          </p>
          <p>
            <strong><Briefcase size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />Profession:</strong> 
            {user?.profession || 'Loading...'}
          </p>
        </div>

        {/* Bookings Section */}
        <div className="booking-card">
          <h4>
            <MessageSquare size={24} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} />
            Pending Booking Requests
            {pendingBookings.length > 0 && (
              <span style={{ 
                marginLeft: '12px', 
                background: '#f97316', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '14px',
                fontWeight: '700'
              }}>
                {pendingBookings.length}
              </span>
            )}
          </h4>

          {loading ? (
            <p>Loading booking requests...</p>
          ) : pendingBookings.length === 0 ? (
            <p>No pending booking requests at the moment.</p>
          ) : (
            pendingBookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <p>
                  <strong>Client Name:</strong> {booking.clientName}
                </p>
                <p>
                  <strong>Phone Number:</strong> {booking.clientPhone}
                </p>
                {booking.message && (
                  <p>
                    <strong>Message:</strong> "{booking.message}"
                  </p>
                )}
                <p>
                  <strong><Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Requested:</strong> {new Date(booking.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
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

