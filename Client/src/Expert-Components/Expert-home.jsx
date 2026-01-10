import React, { useEffect, useState } from "react";
import "../styles/ExpertsHome.css";
import { authenticatedFetch, logout } from "../utils/auth";
import {
  User,
  Phone,
  Briefcase,
  MessageSquare,
  AlertCircle,
  LogOut,
  Calendar,
} from "lucide-react";

const ExpertHome = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [error, setError] = useState(null);

  // FETCH LOGGED-IN EXPERT
  const fetchExpert = async () => {
    try {
      const response = await authenticatedFetch(
        "https://flexy-backend.onrender.com/api/expert/me",
        { method: "GET" }
      );

      const data = await response.json();
      
      if (data.success) {
        setUser(data.expert);
      } else {
        throw new Error(data.message || 'Failed to load expert profile');
      }
    } catch (err) {
      console.error("Error fetching expert:", err);
      throw err;
    }
  };

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    try {
      const response = await authenticatedFetch(
        "https://flexy-backend.onrender.com/api/expert-bookings",
        { method: "GET" }
      );

      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        throw new Error(data.message || 'Failed to load bookings');
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      // Don't throw here, bookings are less critical than profile
      setBookings([]);
    }
  };

  // INIT LOAD
  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([fetchExpert(), fetchBookings()]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load expert dashboard");
    } finally {
      setLoading(false);
    }
  };

  // BOOKING ACTION
  const handleBookingAction = async (bookingId, status) => {
    if (processingBooking === bookingId) return;

    setProcessingBooking(bookingId);

    try {
      const response = await authenticatedFetch(
        "https://flexy-backend.onrender.com/api/update-booking-status",
        {
          method: "PATCH",
          body: JSON.stringify({ bookingId, status }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, status, updatedAt: new Date().toISOString() }
              : b
          )
        );
        
        // Refresh bookings from server
        await fetchBookings();
      } else {
        alert(data.message || `Failed to ${status} booking`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update booking");
    } finally {
      setProcessingBooking(null);
    }
  };

  // EFFECTS
  useEffect(() => {
    init();

    const refresh = () => fetchBookings();
    window.addEventListener("bookingCreated", refresh);

    return () => window.removeEventListener("bookingCreated", refresh);
  }, []);

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ERROR UI
  if (error) {
    return (
      <div className="expert-home">
        <div className="profile-card" style={{ textAlign: "center" }}>
          <AlertCircle size={48} color="#dc2626" />
          <h3 style={{ color: "#dc2626", marginTop: '20px' }}>{error}</h3>
          <button 
            onClick={() => (window.location.href = "/expert-login")}
            style={{
              marginTop: '20px',
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

  // LOADING UI
  if (loading) {
    return (
      <div className="expert-home">
        <div className="profile-card">
          <p style={{ textAlign: 'center', padding: '60px 0' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="expert-home">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Expert Dashboard</h2>
          <button className="logout-btn-expert" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>

        <div className="profile-details">
          <p>
            <User size={18} /> <strong>Name:</strong> {user?.name}
          </p>
          <p>
            <Phone size={18} /> <strong>Contact:</strong> {user?.contact}
          </p>
          <p>
            <Briefcase size={18} /> <strong>Profession:</strong>{" "}
            {user?.profession}
          </p>
        </div>

        <div className="booking-card">
          <h4>
            <MessageSquare size={22} /> Pending Requests
            {pendingBookings.length > 0 && (
              <span className="badge">{pendingBookings.length}</span>
            )}
          </h4>

          {pendingBookings.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
              No pending booking requests.
            </p>
          ) : (
            pendingBookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <p>
                  <strong>Client:</strong> {booking.clientName}
                </p>
                <p>
                  <strong>Phone:</strong> {booking.clientPhone}
                </p>
                {booking.message && (
                  <p>
                    <strong>Message:</strong> "{booking.message}"
                  </p>
                )}
                <p>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {formatDate(booking.createdAt)}
                </p>

                <div className="buttons">
                  <button
                    className="accept"
                    disabled={processingBooking === booking._id}
                    onClick={() =>
                      handleBookingAction(booking._id, "accepted")
                    }
                  >
                    {processingBooking === booking._id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    className="decline"
                    disabled={processingBooking === booking._id}
                    onClick={() =>
                      handleBookingAction(booking._id, "declined")
                    }
                  >
                    {processingBooking === booking._id ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show all bookings history */}
        {bookings.filter(b => b.status !== 'pending').length > 0 && (
          <div className="booking-history">
            <h4>Booking History</h4>
            {bookings.filter(b => b.status !== 'pending').map((booking) => (
              <div key={booking._id} className="history-item">
                <div className="history-header">
                  <span><strong>{booking.clientName}</strong></span>
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  {formatDate(booking.updatedAt || booking.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertHome;
