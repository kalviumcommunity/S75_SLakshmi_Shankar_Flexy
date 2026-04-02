import React, { useState, useEffect } from 'react';
import './styles/Landing-page.css';
import client from './assests/client.png';
import expert from './assests/expert.png';
import logo from './assests/logo.png';

const offers = [
    "✓ Real-time availability of workers & experts",
    "✓ Instant booking & secure payments",
    "✓ Verified professionals and trusted clients",
    "✓ Transparent profiles and ratings",
    "✓ Easy onboarding and smooth communication"
];

const LandingPage = () => {
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="landing-wrapper">
            <div className="landing-box">
                {/* Left Section */}
                <div className="left-section">
                    <img className="flexy-logo" src={logo} alt="Flexy Logo" title="Flexy Platform" />
                    
                    <h1>Flexy</h1>
                    <p className="tagline">Your bridge between skills and opportunities.</p>
                    
                    <h3>Why Flexy?</h3>
                    <p>
                        Flexy is designed to make hiring and finding work simple, fast, 
                        and reliable. Whether you are a business seeking skilled talent, 
                        or a professional looking for new opportunities — we connect you instantly.
                    </p>

                    <h3>What we offer</h3>
                    <div className="offer-container">
                        <p className="offer-text">
                            {offers[currentOfferIndex]}
                        </p>
                    </div>

                    <h3>Our Mission</h3>
                    <p>
                        At Flexy, we believe in empowering individuals and businesses by 
                        removing barriers to employment. Our goal is to create a 
                        professional ecosystem where skills meet demand — efficiently 
                        and transparently.
                    </p>
                </div>

                {/* Right Section */}
                <div className="right-section">
                    <h2>Get Started</h2>
                    <p>Choose your path and join thousands of satisfied users</p>
                    
                    <div className="option">
                        <a href="/client-sign-up">
                            <span className="clientTitle">I'm a Client</span>
                            <img src={client} className="clientLogo" alt="Client" />
                        </a>
                    </div>
                    
                    <div className="option">
                        <a href="/expert-sign-up">
                            <span className="expertTitle">I'm an Expert</span>
                            <img src={expert} className="expertLogo" alt="Expert" />
                        </a>
                    </div>

                    <div className="trust-indicators">
                        <span className="trust-item">🛡️ Secure</span>
                        <span className="trust-item">✓ Verified</span>
                        <span className="trust-item">⭐ Trusted</span>
                    </div>
                </div>
            </div>
  
        </div>
    );
};

export default LandingPage;         
