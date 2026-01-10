import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, MapPin, Phone, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import Profile from "../assests/profile.png";
import { authenticatedFetch } from '../utils/auth';

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

            // Use the correct endpoint: GET /api/expert/:id
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
                headers: {
                    Authorization: 'aYFzBVJfq5rovLfaU2BbXNgLJKL2AJl6axB01RzN2Qdv5TUHPGr1FfzR'
                }
            });
            const data = await res.json();
            if (data.photos && data.photos.length > 0) {
                setPexelsImages(data.photos);
            }
        } catch (error) {
            console.error("Failed to fetch images:", error);
            // Non-critical error, continue without images
        }
    };

    // Auto carousel
    useEffect(() => {
        if (pexelsImages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev === pexelsImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [pexelsImages]);

    useEffect(() => {
        fetchInfo();
    }, [id]);

    const handleHireClick = () => {
        setShowHireModal(true);
    };

    const handleHireSubmit = async () => {
        if (isHiring) return;

        if (!hireMessage.trim()) {
            alert('Please enter a message describing your requirements.');
            return;
        }
        
        setIsHiring(true);
        try {
            const response = await authenticatedFetch(
                'https://flexy-backend.onrender.com/api/create-booking',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        expertId: id,
                        message: hireMessage
                    })
                }
            );

            const data = await response.json();
            
            if (data.success) {
                alert(`Booking request sent successfully! ${info.name} will review your request and get back to you.`);
                setShowHireModal(false);
                setHireMessage('');
                
                // Trigger custom event to notify expert dashboard
                window.dispatchEvent(new CustomEvent('bookingCreated', { 
                    detail: { expertId: id, booking: data.booking } 
                }));
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

    const closeHireModal = () => {
        setShowHireModal(false);
        setHireMessage('');
    };

    const handleClose = () => {
        navigate(-1); // Go back to previous page
    };

    // Star rating display
    const StarRating = ({ rating = 4 }) => {
        return (
            <span style={{ color: '#fbbf24', fontSize: '18px', letterSpacing: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < rating ? '#fbbf24' : '#e5e7eb' }}>
                        ★
                    </span>
                ))}
            </span>
        );
    };

    if (loading) {
        return (
            <div className='mainInfo'>
                <div className='infoBox'>
                    <p style={{ textAlign: 'center', padding: '60px 0', fontSize: '18px', color: '#64748b' }}>
                        Loading expert information...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='mainInfo'>
                <div className='infoBox'>
                    <X size={20} className="closeBtn" onClick={handleClose} />
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 20px' }} />
                        <p style={{ fontSize: '20px', color: '#dc2626', fontWeight: '600', marginBottom: '12px' }}>
                            {error}
                        </p>
                        <button 
                            onClick={handleClose}
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
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='mainInfo'>
            <div className='infoBox'>
                <X size={20} className="closeBtn" onClick={handleClose} />
                
                {info && (
                    <>
                        {/* Profile Image */}
                        <img src={Profile} alt="Profile Picture" />
                        
                        {/* Info Lines with Icons */}
                        <p className='line'>
                            <strong>Name:</strong> {info.name}
                        </p>
                        
                        <p className='line'>
                            <strong>Profession:</strong> {info.profession}
                        </p>
                        
                        <p className='line'>
                            <strong>Rating:</strong> <StarRating rating={info.rating || 4} />
                        </p>
                        
                        <p className='line'>
                            <strong>Location:</strong> {info.location}
                        </p>
                        
                        <p className='line'>
                            <strong>Experience:</strong> {info.exp} Year{info.exp !== 1 ? 's' : ''}
                        </p>
                        
                        <p className='line'>
                            <strong>Phone:</strong> {info.contact}
                        </p>

                        {/* Hire Button */}
                        <button className='hireButton' onClick={handleHireClick}>
                            Hire Now
                        </button>

                        {/* Portfolio Images */}
                        {pexelsImages.length > 0 && (
                            <>
                                <hr />
                                <h3 style={{ 
                                    textAlign: 'center', 
                                    color: '#0f172a', 
                                    marginBottom: '24px',
                                    fontSize: '20px',
                                    fontWeight: '700'
                                }}>
                                    Portfolio Gallery
                                </h3>
                                <div className="carousel">
                                    {pexelsImages.length > 2 && (
                                        <img 
                                            src={pexelsImages[(currentIndex - 1 + pexelsImages.length) % pexelsImages.length].src.medium} 
                                            alt="previous work" 
                                            className="side-image"
                                            onClick={() => setCurrentIndex((currentIndex - 1 + pexelsImages.length) % pexelsImages.length)}
                                        />
                                    )}
                                    <img 
                                        src={pexelsImages[currentIndex].src.medium} 
                                        alt="current work" 
                                        className="main-image"
                                    />
                                    {pexelsImages.length > 2 && (
                                        <img 
                                            src={pexelsImages[(currentIndex + 1) % pexelsImages.length].src.medium} 
                                            alt="next work" 
                                            className="side-image"
                                            onClick={() => setCurrentIndex((currentIndex + 1) % pexelsImages.length)}
                                        />
                                    )}
                                </div>
                                <p style={{ 
                                    textAlign: 'center', 
                                    color: '#94a3b8', 
                                    fontSize: '14px',
                                    marginTop: '16px'
                                }}>
                                    {currentIndex + 1} of {pexelsImages.length}
                                </p>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Hire Modal */}
            {showHireModal && (
                <div className="modal-overlay" onClick={closeHireModal}>
                    <div className="hire-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Hire {info?.name}</h3>
                            <X size={24} onClick={closeHireModal} style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="modal-body">
                            <p>
                                Send a detailed message to <strong>{info?.name}</strong> about your project requirements:
                            </p>
                            <textarea
                                value={hireMessage}
                                onChange={(e) => setHireMessage(e.target.value)}
                                placeholder="Example: I need a plumber to fix a leaking pipe in my kitchen. The job should be done within 2 days. Please let me know your availability and rates."
                                rows={6}
                            />
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeHireModal}>
                                Cancel
                            </button>
                            <button 
                                onClick={handleHireSubmit}
                                disabled={isHiring || !hireMessage.trim()}
                            >
                                {isHiring ? 'Sending Request...' : 'Send Booking Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertInfoPage;
