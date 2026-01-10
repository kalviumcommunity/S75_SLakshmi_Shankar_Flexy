// ============================================
// FIXED + CLEAN EXPERT HOME COMPONENT
// ============================================

import React, { useEffect, useState } from "react";
import "../styles/ExpertsHome.css";
import { authenticatedFetch } from "../utils/auth";
import {
  User,
  Phone,
  Briefcase,
  Calendar,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const ExpertHome = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [error, setError] = useState(null);

  // -----------------------------
  // FETCH LOGGED-IN EXPERT
  // -----------------------------
  const fetchExpert = async () => {
    const data = await authenticatedFetch("/api/expert/me", {
      method: "GET",
    });
    setUser(data.expert);
  };

  // -----------------------------
  // FETCH BOOKINGS
  // -----------------------------
  const fetchBookings = async () => {
    const data = await authenticatedFetch("/api/expert-bookings", {
      method: "GET",
    });
    setBookings(data.bookings || []);
  };

  // -----------------------------
  // INIT LOAD
  // -----------------------------
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

  // -----------------------------
  // BOOKING ACTION
  // -----------------------------
  const handleBookingAction = async (bookingId, status) => {
    if (processingBooking === bookingId) return;

    setProcessingBooking(bookingId);

    try {
      await authenticatedFetch("/api/update-booking-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status, updatedAt: new Date().toISOString() }
            : b
        )
      );

      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update booking");
    } finally {
      setProcessingBooking(null);
    }
  };

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    init();

    const refresh = () => fetchBookings();
    window.addEventListener("bookingCreated", refresh);

    return () => window.removeEventListener("bookingCreated", refresh);
  }, []);

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  // -----------------------------
  // ERROR UI
  // -----------------------------
  if (error) {
    return (
      <div className="expert-home">
        <div className="profile-card" style={{ textAlign: "center" }}>
          <AlertCircle size={48} color="#dc2626" />
          <h3 style={{ color: "#dc2626" }}>{error}</h3>
          <button onClick={() => (window.location.href = "/expert-login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <div className="expert-home">
      <div className="profile-card">
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

          {loading ? (
            <p>Loading bookings...</p>
          ) : pendingBookings.length === 0 ? (
            <p>No pending booking requests.</p>
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
                  <Calendar size={16} />{" "}
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>

                <div className="buttons">
                  <button
                    className="accept"
                    disabled={processingBooking === booking._id}
                    onClick={() =>
                      handleBookingAction(booking._id, "accepted")
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="decline"
                    disabled={processingBooking === booking._id}
                    onClick={() =>
                      handleBookingAction(booking._id, "declined")
                    }
                  >
                    Decline
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
