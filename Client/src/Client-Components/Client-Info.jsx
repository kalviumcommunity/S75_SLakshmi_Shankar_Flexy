import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, MapPin, Phone, Briefcase, Calendar, AlertCircle, Star, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Profile from "../assests/profile.png";
import { authenticatedFetch } from '../utils/auth';
import '../styles/ExpertInfoPage.css';

const ExpertInfoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState(null);
    const [pexelsImages, setPexelsImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHiring, setIsHiring] = useState(false);
    const [hireMessage, setHireMessage] = useState('');
    const [showHireModal, setShowHireModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authenticatedFetch(
                `https://flexy-backend.onrender.com/api/expert/${id}`,
                { method: 'GET' }
            );
            const data = await response.json();
            if (data.success) {
                setInfo(data.expert);
                fetchPexelsImages(data.expert.profession);
            } else {
                setError(data.message || 'Failed to load expert information');
            }
        } catch (err) {
            console.error("Error fetching expert info:", err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPexelsImages = async (query) => {
        try {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=5`, {
                headers: { Authorization: 'aYFzBVJfq5rovLfaU2BbXNgLJKL2AJl6axB01RzN2Qdv5TUHPGr1FfzR' }
            });
            const data = await res.json();
            if (data.photos && data.photos.length > 0) setPexelsImages(data.photos);
        } catch (error) {
            console.error("Failed to fetch images:", error);
        }
    };

    useEffect(() => {
        if (pexelsImages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev === pexelsImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [pexelsImages]);

    useEffect(() => { fetchInfo(); }, [id]);

    const handleHireClick = () => setShowHireModal(true);

    const handleHireSubmit = async () => {
        if (isHiring) return;
        if (!hireMessage.trim()) { alert('Please enter a message describing your requirements.'); return; }
        setIsHiring(true);
        try {
            const response = await authenticatedFetch(
                'https://flexy-backend.onrender.com/api/create-booking',
                { method: 'POST', body: JSON.stringify({ expertId: id, message: hireMessage }) }
            );
            const data = await response.json();
            if (data.success) {
                alert(`Booking request sent successfully! ${info.name} will review your request and get back to you.`);
                setShowHireModal(false);
                setHireMessage('');
                window.dispatchEvent(new CustomEvent('bookingCreated', { detail: { expertId: id, booking: data.booking } }));
            } else {
                alert(data.message || 'Failed to send booking request. Please try again.');
            }
        } catch (error) {
            console.error('Error sending booking request:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setIsHiring(false);
        }
    };

    const closeHireModal = () => { setShowHireModal(false); setHireMessage(''); };
    const handleClose = () => navigate(-1);

    const StarRating = ({ rating = 4 }) => (
        <span className="eip-stars">
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < rating ? '#f97316' : '#1e293b' }}>★</span>
            ))}
        </span>
    );

    if (loading) {
        return (
            <div className="eip-page">
                <div className="eip-bg-orb eip-orb-1" />
                <div className="eip-bg-orb eip-orb-2" />
                <div className="eip-loader-wrap">
                    <div className="eip-spinner" />
                    <p>Loading expert profile…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="eip-page">
                <div className="eip-bg-orb eip-orb-1" />
                <div className="eip-bg-orb eip-orb-2" />
                <div className="eip-error-wrap">
                    <AlertCircle size={48} className="eip-error-icon" />
                    <p className="eip-error-msg">{error}</p>
                    <button className="eip-back-btn" onClick={handleClose}>
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="eip-page">
            {/* Ambient orbs */}
            <div className="eip-bg-orb eip-orb-1" />
            <div className="eip-bg-orb eip-orb-2" />

            {/* Back button */}
            <button className="eip-nav-back" onClick={handleClose}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="eip-card">
                {/* Close button */}
                <button className="eip-close-btn" onClick={handleClose} aria-label="Close">
                    <X size={18} />
                </button>

                {info && (
                    <>
                        {/* Profile header */}
                        <div className="eip-profile-header">
                            <div className="eip-avatar-wrap">
                                <img src={Profile} alt="Profile" className="eip-avatar" />
                                <div className="eip-avatar-ring" />
                            </div>
                            <div className="eip-profile-meta">
                                <h1 className="eip-name">{info.name}</h1>
                                <span className="eip-profession-tag">{info.profession}</span>
                                <div className="eip-rating-row">
                                    <StarRating rating={info.rating || 4} />
                                    <span className="eip-rating-num">{info.rating || 4}.0</span>
                                </div>
                            </div>
                        </div>

                        <div className="eip-divider" />

                        {/* Info grid */}
                        <div className="eip-info-grid">
                            <div className="eip-info-item">
                                <div className="eip-info-icon"><MapPin size={16} /></div>
                                <div>
                                    <span className="eip-info-label">Location</span>
                                    <span className="eip-info-value">{info.location}</span>
                                </div>
                            </div>
                            <div className="eip-info-item">
                                <div className="eip-info-icon"><Calendar size={16} /></div>
                                <div>
                                    <span className="eip-info-label">Experience</span>
                                    <span className="eip-info-value">{info.exp} Year{info.exp !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="eip-info-item">
                                <div className="eip-info-icon"><Phone size={16} /></div>
                                <div>
                                    <span className="eip-info-label">Phone</span>
                                    <span className="eip-info-value">{info.contact}</span>
                                </div>
                            </div>
                            <div className="eip-info-item">
                                <div className="eip-info-icon"><Briefcase size={16} /></div>
                                <div>
                                    <span className="eip-info-label">Profession</span>
                                    <span className="eip-info-value">{info.profession}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hire button */}
                        <button className="eip-hire-btn" onClick={handleHireClick}>
                            Hire Now
                        </button>

                        {/* Portfolio gallery */}
                        {pexelsImages.length > 0 && (
                            <>
                                <div className="eip-divider" />
                                <h3 className="eip-gallery-title">Portfolio Gallery</h3>
                                <div className="eip-carousel">
                                    {pexelsImages.length > 2 && (
                                        <img
                                            src={pexelsImages[(currentIndex - 1 + pexelsImages.length) % pexelsImages.length].src.medium}
                                            alt="previous work"
                                            className="eip-img-side"
                                            onClick={() => setCurrentIndex((currentIndex - 1 + pexelsImages.length) % pexelsImages.length)}
                                        />
                                    )}
                                    <div className="eip-img-main-wrap">
                                        <img
                                            src={pexelsImages[currentIndex].src.medium}
                                            alt="current work"
                                            className="eip-img-main"
                                        />
                                        <div className="eip-carousel-nav">
                                            <button
                                                className="eip-nav-btn"
                                                onClick={() => setCurrentIndex((currentIndex - 1 + pexelsImages.length) % pexelsImages.length)}
                                            ><ChevronLeft size={18} /></button>
                                            <span className="eip-carousel-count">{currentIndex + 1} / {pexelsImages.length}</span>
                                            <button
                                                className="eip-nav-btn"
                                                onClick={() => setCurrentIndex((currentIndex + 1) % pexelsImages.length)}
                                            ><ChevronRight size={18} /></button>
                                        </div>
                                    </div>
                                    {pexelsImages.length > 2 && (
                                        <img
                                            src={pexelsImages[(currentIndex + 1) % pexelsImages.length].src.medium}
                                            alt="next work"
                                            className="eip-img-side"
                                            onClick={() => setCurrentIndex((currentIndex + 1) % pexelsImages.length)}
                                        />
                                    )}
                                </div>

                                {/* Dot indicators */}
                                <div className="eip-dots">
                                    {pexelsImages.map((_, i) => (
                                        <button
                                            key={i}
                                            className={`eip-dot ${i === currentIndex ? 'eip-dot-active' : ''}`}
                                            onClick={() => setCurrentIndex(i)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Hire Modal */}
            {showHireModal && (
                <div className="eip-modal-overlay" onClick={closeHireModal}>
                    <div className="eip-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="eip-modal-header">
                            <div>
                                <p className="eip-modal-label">Send request to</p>
                                <h3 className="eip-modal-title">{info?.name}</h3>
                            </div>
                            <button className="eip-modal-close" onClick={closeHireModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="eip-modal-body">
                            <p className="eip-modal-desc">
                                Describe your project so <strong>{info?.name}</strong> can review your requirements and get back to you.
                            </p>
                            <textarea
                                value={hireMessage}
                                onChange={(e) => setHireMessage(e.target.value)}
                                placeholder="Example: I need a plumber to fix a leaking pipe in my kitchen. The job should be done within 2 days. Please let me know your availability and rates."
                                rows={5}
                                className="eip-modal-textarea"
                            />
                        </div>
                        <div className="eip-modal-footer">
                            <button className="eip-modal-cancel" onClick={closeHireModal}>Cancel</button>
                            <button
                                className="eip-modal-submit"
                                onClick={handleHireSubmit}
                                disabled={isHiring || !hireMessage.trim()}
                            >
                                {isHiring ? 'Sending…' : 'Send Booking Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertInfoPage;