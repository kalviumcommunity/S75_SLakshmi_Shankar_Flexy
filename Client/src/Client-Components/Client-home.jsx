import React, { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import '../styles/Client-home.css';
import Logo from '../assests/logo.png';
import Loader from './Loader';
import { MapPin, Search, X, AlertCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/auth';

const ClientHome = () => {
    const [allExperts, setAllExperts] = useState([]);
    const [userName, setUserName] = useState('');
    const [locationSet, setLocation] = useState("");
    const [searchSet, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const navigate = useNavigate();

    // Star rating component
    const StarRating = ({ rating = 5 }) => {
        return (
            <div className="stars">
                {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < rating ? '#fbbf24' : '#e5e7eb' }}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const getExperts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/all-experts', {
                method: "GET"
            });

            if (response.ok) {
                const data = await response.json();
                setAllExperts(data.users);
                setSearch("");
                setLocation("");
                setSearchActive(false);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to fetch experts');
            }
        } catch (err) {
            console.error('Error fetching experts:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getByLocation = async () => {
        if (!locationSet.trim()) {
            setError('Please enter a location');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchActive(true);

            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/get-by-location', {
                method: 'POST',
                body: JSON.stringify({ location: locationSet })
            });

            if (response.ok) {
                const data = await response.json();
                setAllExperts(data.data);
                
                if (data.data.length === 0) {
                    setError(`No experts found in ${locationSet}`);
                }
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to search by location');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getByProfession = async () => {
        if (!searchSet.trim()) {
            setError('Please enter a profession');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchActive(true);

            const response = await authenticatedFetch('https://flexy-backend.onrender.com/api/get-by-profession', {
                method: 'POST',
                body: JSON.stringify({ profession: searchSet })
            });

            if (response.ok) {
                const data = await response.json();
                setAllExperts(data.data);
                
                if (data.data.length === 0) {
                    setError(`No ${searchSet}s found`);
                }
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to search by profession');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearch("");
        setLocation("");
        setError(null);
        getExperts();
    };

    const handleInfo = (_id) => {
        navigate(`/expert/${_id}`); 
    };

    const handleChat = (expertId) => {
        navigate(`/chat/${expertId}`);
    };

    // Handle Enter key press
    const handleKeyPress = (e, searchType) => {
        if (e.key === 'Enter') {
            if (searchType === 'location') {
                getByLocation();
            } else {
                getByProfession();
            }
        }
    };

    useEffect(() => {
        getExperts();
        const name = Cookie.get('name') || localStorage.getItem('userName') || 'Guest';
        setUserName(name);
    }, []);

    return (
        <div className='client-home-container'>
            {/* Header */}
            <div className='home-header'>
                <img src={Logo} alt='Flexy' className='home-logo' />
                <div className='user-name'>Welcome, {userName}!</div>
            </div>

            {/* Search Bar */}
            <div className='search-bar'>
                <div className='location'>
                    <MapPin size={20} strokeWidth={2} />
                    <input 
                        type="text" 
                        placeholder="Enter location" 
                        value={locationSet} 
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'location')}
                    />
                </div>
                
                <input 
                    type="text" 
                    placeholder="Search by profession (e.g., Plumber, Electrician)" 
                    className='search-input' 
                    value={searchSet} 
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'profession')}
                />

                {(searchActive || locationSet || searchSet) && (
                    <X 
                        size={20} 
                        strokeWidth={2} 
                        onClick={handleClearSearch} 
                        className='searchIcon'
                        title="Clear search"
                    />
                )}
                
                <Search 
                    size={20} 
                    strokeWidth={2} 
                    className='searchIcon' 
                    onClick={getByProfession}
                    title="Search by profession"
                />
            </div>

            {/* Error Message */}
            {error && !loading && (
                <div style={{
                    background: '#fee2e2',
                    border: '2px solid #fecaca',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <AlertCircle size={20} color="#dc2626" />
                    <span style={{ color: '#991b1b', fontWeight: '600' }}>{error}</span>
                </div>
            )}

            {/* Experts List */}
            <div className='experts-list'>
                {loading ? (
                    <div className="loader">
                        <Loader />
                    </div>
                ) : allExperts.length === 0 && !error ? (
                    <div className='no-data-message'>
                        <p>No experts available at the moment.</p>
                    </div>
                ) : (
                    allExperts.map((expert, index) => (
                        <div className='expert-card' key={expert._id || index}>
                            <div className='expert-details'>
                                <h4>{expert.name}</h4>
                                <p>{expert.profession}</p>
                                <StarRating rating={expert.rating || 5} />
                            </div>
                            <div className='action-buttons'>
                                <button 
                                    className='info-btn' 
                                    onClick={() => handleInfo(expert._id)}
                                    aria-label={`View ${expert.name}'s profile`}
                                >
                                    Info
                                </button>
                                <button 
                                    className='chat-btn' 
                                    onClick={() => handleChat(expert._id)}
                                    aria-label={`Chat with ${expert.name}`}
                                >
                                    Chat
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientHome;