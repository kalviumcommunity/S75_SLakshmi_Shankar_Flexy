import React from 'react';
import './styles/Landing-page.css';
import client from './assests/client.png'
import expert from './assests/expert.png'
import logo from './assests/logo.png'

const LandingPage = () => {
    return (
        <div className="landing-wrapper">
            <div className="landing-box">
                <div className="left-section">
                    <img className='flexy-logo' src={logo} /> 
                    <h2>Let's get started</h2>
                    <p>Need a worker? Need a job?</p>
                    <p>We connect talent with opportunity.</p>
                    <p>Fast, secure, and effortless hiring.</p>
                    <p>Real-time availability, instant bookings.</p>
                </div>
                <div className="divider"></div>
                <div className="right-section">
                    <div className="option">
                        <a href="/client-sign-up" className='clientTitle'>Client <img src={client} className='clientLogo'></img></a>
                        <div className="underline" />
                    </div>
                    <div className="option">
                        <a href="/expert-sign-up" className='expertTitle'>Expert <img src={expert} className='expertLogo'></img></a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
