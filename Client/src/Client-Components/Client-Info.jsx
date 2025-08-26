import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { X, ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import Profile from "../assests/profile.png"

const ExpertInfoPage = () => {
    const { id } = useParams();
    const [info, setInfo] = useState(null);
    const [pexelsImages, setPexelsImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchInfo = async () => {
        try {
            const response = await fetch('https://flexy-backend.onrender.com/api/get-by-id', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: id }),
                credentials: 'include'
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
                        <button className='hireButton'>Hire Now</button>

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
        </div>
    );
};

export default ExpertInfoPage;
