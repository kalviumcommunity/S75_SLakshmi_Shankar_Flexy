import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ExpertsHome.css";
import { authenticatedFetch, logout } from "../utils/auth";
import { useSocket } from "../utils/SocketContext";
import {
  User,
  Phone,
  Briefcase,
  MessageSquare,
  AlertCircle,
  LogOut,
  Calendar,
  Bell,
  MessageCircle
} from "lucide-react";

const ExpertHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const { socket, connected } = useSocket();

  const fetchExpert = async () => {
    try {
      const response = await authenticatedFetch(
        "https://flexy-backend.onrender.com/api/expert/me",
        { method: "GET" }
      );

      const data = await response.json();
      
      if (data.success) {
        setUser(data.expert);
        localStorage.setItem('expertContact', data.expert.contact);
        localStorage.setItem('expertId', data.expert._id);
      } else {
        throw new Error(data.message || 'Failed to load expert profile');
      }
    } catch (err) {
      console.error("Error fetching expert:", err);
      throw err;
    }
  };

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
      setBookings([]);
    }
  };

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
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, status, updatedAt: new Date().toISOString() }
              : b
          )
        );
        
        showNotification(`Booking ${status} successfully!`, 'success');
      } else {
        showNotification(data.message || `Failed to ${status} booking`, 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification(err.message || "Failed to update booking", 'error');
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleOpenChat = (clientId) => {
    navigate(`/expert-chat/${clientId}`);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewBooking = (data) => {
      console.log('🔔 New booking received:', data);
      
      setBookings((prev) => [data.booking, ...prev]);
      
      showNotification(data.message || 'New booking request received!', 'success');
    };

    socket.on('new-booking', handleNewBooking);

    return () => {
      socket.off('new-booking', handleNewBooking);
    };
  }, [socket, connected]);

  useEffect(() => {
    init();
  }, []);

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted"
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="expert-home">
        <div className="profile-card">
          <p style={{ textAlign: 'center', padding: '60px 0' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expert-home">
      {notification && (
        <div 
          className={`notification-banner ${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '12px',
            background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <Bell size={20} />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <h2>Expert Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: connected ? '#10b981' : '#ef4444',
                display: 'inline-block'
              }}
              title={connected ? 'Connected' : 'Disconnected'}
            />
            <button className="logout-btn-expert" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
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

        {acceptedBookings.length > 0 && (
          <div className="booking-card">
            <h4>
              <MessageCircle size={22} /> Accepted Clients
              <span className="badge">{acceptedBookings.length}</span>
            </h4>

            {acceptedBookings.map((booking) => (
              <div key={booking._id} className="booking-item accepted-booking">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p>
                      <strong>Client:</strong> {booking.clientName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {booking.clientPhone}
                    </p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                      <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Accepted {formatDate(booking.updatedAt || booking.createdAt)}
                    </p>
                  </div>
                  
                  <button
                    className="chat-btn-expert"
                    onClick={() => handleOpenChat(booking.clientId._id || booking.clientId)}
                    style={{
                      padding: '10px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    <MessageCircle size={18} />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {bookings.filter(b => b.status === 'declined').length > 0 && (
          <div className="booking-history">
            <h4>Declined Bookings</h4>
            {bookings.filter(b => b.status === 'declined').map((booking) => (
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