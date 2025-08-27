import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { X, ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import Profile from "../assests/profile.png";
import { authenticatedFetch } from '../utils/auth';

const ExpertInfoPage = () => {
    const { id } = useParams();
    const [info, setInfo] = useState(null);
    const [pexelsImages, setPexelsImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHiring, setIsHiring] = useState(false);
    const [hireMessage, setHireMessage] = useState('');
    const [showHireModal, setShowHireModal] = useState(false);

    const fetchInfo = async () => {
        try {
            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/get-by-id', {
                method: 'POST',
                body: JSON.stringify({ _id: id })
            });

            const data = await response.json();
            if (response.ok) {
                setInfo(data);
                fetchPexelsImages(data.profession);
            }
        } catch (err) {
            console.log("Error fetching expert info:", err.message);
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
            if (data.photos) setPexelsImages(data.photos);
        } catch (error) {
            console.error("Failed to fetch images:", error);
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

    // Manual carousel navigation
    const prevImage = () => {
        setCurrentIndex(prev => (prev === 0 ? pexelsImages.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex(prev => (prev === pexelsImages.length - 1 ? 0 : prev + 1));
    };

    const handleHireClick = () => {
        setShowHireModal(true);
    };

    const handleHireSubmit = async () => {
        if (isHiring) return;
        
        setIsHiring(true);
        try {
            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/create-booking', {
                method: 'POST',
                body: JSON.stringify({
                    expertId: id,
                    message: hireMessage
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Booking request sent successfully! The expert will review your request.');
                setShowHireModal(false);
                setHireMessage('');
                
                // Trigger a custom event to notify expert dashboard to refresh
                window.dispatchEvent(new CustomEvent('bookingCreated', { 
                    detail: { expertId: id, booking: data.booking } 
                }));
            } else {
                alert(data.message || 'Failed to send booking request');
            }
        } catch (error) {
            console.error('Error sending booking request:', error);
            alert('Failed to send booking request. Please try again.');
        } finally {
            setIsHiring(false);
        }
    };

    const closeHireModal = () => {
        setShowHireModal(false);
        setHireMessage('');
    };

    return (
        <div className='mainInfo'>
            <div className='infoBox'>
                <X size={20} color='white' strokeWidth={5} className="closeBtn" onClick={() => window.history.back()} />
                {info ? (
                    <>
                        <img src={Profile} alt="Profile Picture" />
                        <p className='line'><strong>Name:</strong> {info.name}</p>
                        <p className='line'><strong>Work Field:</strong> {info.profession}</p>
                        <p className='line'><strong>Rating:</strong> ★★★★☆</p>
                        <p className='line'><strong>Location:</strong> {info.location}</p>
                        <p className='line'><strong>Experience:</strong> {info.exp} Years</p>
                        <p className='line'><strong>Phone:</strong> {info.contact}</p>
                        <button className='hireButton' onClick={handleHireClick}>Hire Now</button>

                        <div style={{ margin: "30px 0", color: "#272727" }} />
                        
                        <hr />

                        {pexelsImages.length > 0 && (
                            <div className="carousel">
                                <img 
                                    src={pexelsImages[(currentIndex - 1 + pexelsImages.length) % pexelsImages.length].src.medium} 
                                    alt="previous" 
                                    className="side-image"
                                />
                                <img 
                                    src={pexelsImages[currentIndex].src.medium} 
                                    alt="current" 
                                    className="main-image"
                                />
                                <img 
                                    src={pexelsImages[(currentIndex + 1) % pexelsImages.length].src.medium} 
                                    alt="next" 
                                    className="side-image"
                                />
                            </div>
                        )}

                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            {/* Hire Modal */}
            {showHireModal && (
                <div className="modal-overlay" onClick={closeHireModal}>
                    <div className="hire-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Hire {info?.name}</h3>
                            <X size={20} onClick={closeHireModal} style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="modal-body">
                            <p>Send a message to {info?.name} about your requirements:</p>
                            <textarea
                                value={hireMessage}
                                onChange={(e) => setHireMessage(e.target.value)}
                                placeholder="Describe your project requirements, timeline, and any specific details..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button 
                                onClick={closeHireModal}
                                style={{
                                    padding: '10px 20px',
                                    marginRight: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    backgroundColor: '#f5f5f5',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleHireSubmit}
                                disabled={isHiring}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    backgroundColor: isHiring ? '#ccc' : '#007bff',
                                    color: 'white',
                                    cursor: isHiring ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isHiring ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertInfoPage;
