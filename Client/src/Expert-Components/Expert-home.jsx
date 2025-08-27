// ExpertHome.jsx
import React, { useEffect, useState } from "react";
import "../styles/ExpertsHome.css";

const ExpertHome = () => {


  const [user, setUser] = useState([]);

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


  useEffect(() => {
    getUser();
    console.log(localStorage.getItem('expertId'))
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
          <h4>Booking</h4>
          <p><strong>Name:</strong> name</p>
          <p><strong>Location:</strong> location</p>
          <div className="buttons">
            <button className="accept">Accept</button>
            <button className="decline">Decline</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExpertHome;
