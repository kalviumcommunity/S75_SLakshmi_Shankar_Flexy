import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { X,ArrowBigLeft,ArrowBigRight } from 'lucide-react';


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

            if (response.ok) {
                const data = await response.json();
                setInfo(data.userData);
                fetchPexelsImages(data.userData.profession);
            }
        } catch (err) {
            console.log(err.message);
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
            setPexelsImages(data.photos);
        } catch (error) {
            console.error("Failed to fetch images", error);
        }
    };

    useEffect(() => {
        if (pexelsImages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev === pexelsImages.length - 1 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(interval);
    }, [pexelsImages]);

    useEffect(() => {
        fetchInfo();
    }, [id]);

    return (
        <div className='mainInfo'>
            <div className='infoBox'>
                <X size={20} color='white' strokeWidth={5} className="closeBtn" onClick={() => window.history.back()} />
                {info ? (
                    <>
                        <img
                            src={`https://flexy-backend.onrender.com/uploads/${encodeURIComponent(info.licenseFile.filename)}`}
                            alt={info.name}
                            className='profileImg'
                        />
                        <p className='line'><strong>Name:</strong> {info.name}</p>
                        <p className='line'><strong>Work Field:</strong> {info.profession}</p>
                        <p className='line'><strong>Rating:</strong>★★★★☆</p>
                        <p className='line'><strong>Location:</strong> {info.location}</p>
                        <p className='line'><strong>Work Completion:</strong> {info.exp} Years</p>
                        <p className='line'><strong>Phone:</strong> {info.contact}</p>
                        <button className='hireButton'>Hire Now</button>

                        <div style={{ margin: "30px 0", color: "#272727" }} />
                        
                        <hr />

                        {pexelsImages.length > 0 && (
                            <div className="carousel">
                                {/* <ArrowBigLeft onClick={nextImage} className='arrow' strokeWidth={1.5} /> */}
                                <img src={pexelsImages[currentIndex].src.medium} alt="carousel" style={{ width: '800vh'}}/>
                                {/* <ArrowBigRight onClick={prevImage} className='arrow' strokeWidth={1.5} /> */}
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
