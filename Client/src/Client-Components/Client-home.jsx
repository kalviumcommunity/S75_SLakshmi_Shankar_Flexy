/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import '../styles/Client-home.css';
import { MapPin, Search, X, AlertCircle, LogOut, Zap, Shield, Clock, ChevronRight } from 'lucide-react';
import { authenticatedFetch, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const ClientHome = () => {
    const [allExperts, setAllExperts] = useState([]);
    const [userName, setUserName] = useState('');
    const [locationSet, setLocation] = useState("");
    const [searchSet, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const navigate = useNavigate();

    const StarRating = ({ rating = 5 }) => (
        <div className="stars">
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < rating ? '#f97316' : '#e2e8f0' }}>★</span>
            ))}
        </div>
    );

    const getExperts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authenticatedFetch(
                'https://flexy-backend.onrender.com/api/all-experts',
                { method: "GET" }
            );
            const data = await response.json();
            if (data.success) {
                setAllExperts(data.experts || []);
                setSearch("");
                setLocation("");
                setSearchActive(false);
            } else {
                throw new Error(data.message || 'Failed to fetch experts');
            }
        } catch (err) {
            console.error('Error fetching experts:', err);
            setError(err.message || 'Failed to fetch experts');
            setAllExperts([]);
        } finally {
            setLoading(false);
        }
    };

    const getByLocation = async () => {
        if (!locationSet.trim()) { setError('Please enter a location'); return; }
        try {
            setLoading(true);
            setError(null);
            setSearchActive(true);
            const response = await authenticatedFetch(
                'https://flexy-backend.onrender.com/api/get-by-location',
                { method: 'POST', body: JSON.stringify({ location: locationSet }) }
            );
            const data = await response.json();
            if (data.success) {
                setAllExperts(data.data || []);
                if (!data.data || data.data.length === 0) setError(`No experts found in ${locationSet}`);
            } else {
                setError(data.message || 'Failed to search by location');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getByProfession = async () => {
        if (!searchSet.trim()) { setError('Please enter a profession'); return; }
        try {
            setLoading(true);
            setError(null);
            setSearchActive(true);
            const response = await authenticatedFetch(
                'https://flexy-backend.onrender.com/api/get-by-profession',
                { method: 'POST', body: JSON.stringify({ profession: searchSet }) }
            );
            const data = await response.json();
            if (data.success) {
                setAllExperts(data.data || []);
                if (!data.data || data.data.length === 0) setError(`No ${searchSet}s found`);
            } else {
                setError(data.message || 'Failed to search by profession');
            }
        } catch (err) {
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

    const handleInfo = (_id) => navigate(`/expert/${_id}`);

    const handleKeyPress = (e, searchType) => {
        if (e.key === 'Enter') {
            searchType === 'location' ? getByLocation() : getByProfession();
        }
    };

    useEffect(() => {
        getExperts();
        const phone = localStorage.getItem('clientPhone') || 'Guest';
        setUserName(phone);
    }, []);

    return (
        <div className="ch-container">
            {/* Ambient background */}
            <div className="ch-bg-orb ch-orb-1" />
            <div className="ch-bg-orb ch-orb-2" />

            {/* Header */}
            <header className="ch-header">
                <div className="ch-logo-wrap">
                    <div className="ch-logo-icon">
                        <Zap size={22} />
                    </div>
                    <span className="ch-logo-text">Flexy</span>
                </div>
                <div className="ch-header-right">
                    <span className="ch-welcome">
                        Welcome, <strong>{userName}</strong>
                    </span>
                    <button className="ch-logout-btn" onClick={logout} title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="ch-hero">
                <div className="ch-hero-content">
                    <div className="ch-badge">Trusted Platform</div>
                    <h1 className="ch-hero-title">
                        Find Expert<br />
                        <span className="ch-gradient-text">Professionals</span>
                    </h1>
                    <p className="ch-hero-sub">
                        Connect with skilled tradespeople for all your home service needs.
                        Quality work, fair prices, trusted professionals.
                    </p>
                    <div className="ch-feature-pills">
                        <div className="ch-pill"><Shield size={14} /> Verified</div>
                        <div className="ch-pill"><Clock size={14} /> Fast Response</div>
                        <div className="ch-pill"><Zap size={14} /> Quality Guaranteed</div>
                    </div>
                </div>
            </section>

            {/* Search */}
            <div className="ch-search-wrap">
                <div className="ch-search-bar">
                    <div className="ch-location-field">
                        <MapPin size={16} className="ch-field-icon" />
                        <input
                            type="text"
                            placeholder="Location"
                            value={locationSet}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'location')}
                        />
                    </div>
                    <div className="ch-divider" />
                    <div className="ch-profession-field">
                        <input
                            type="text"
                            placeholder="Search profession (e.g., Plumber, Electrician)"
                            value={searchSet}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'profession')}
                        />
                    </div>
                    {(searchActive || locationSet || searchSet) && (
                        <button className="ch-icon-btn ch-clear-btn" onClick={handleClearSearch} title="Clear">
                            <X size={16} />
                        </button>
                    )}
                    <button className="ch-search-btn" onClick={getByProfession}>
                        <Search size={16} />
                        <span>Search</span>
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && !loading && (
                <div className="ch-error-banner">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Experts */}
            <section className="ch-experts-section">
                <div className="ch-section-header">
                    <div>
                        <h2 className="ch-section-title">
                            {searchActive ? "Search Results" : "Featured Experts"}
                        </h2>
                        <p className="ch-section-sub">
                            {allExperts.length} professional{allExperts.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    {!searchActive && (
                        <button className="ch-view-all-btn">
                            View All <ChevronRight size={15} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="ch-loader-wrap">
                        <div className="ch-spinner" />
                    </div>
                ) : allExperts.length === 0 && !error ? (
                    <div className="ch-empty-state">
                        <div className="ch-empty-icon">🔍</div>
                        <p>No experts available at the moment.</p>
                    </div>
                ) : (
                    <div className="ch-experts-grid">
                        {allExperts.map((expert, index) => (
                            <div
                                className="ch-expert-card"
                                key={expert._id || index}
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <div className="ch-card-accent" />
                                <div className="ch-card-body">
                                    <div className="ch-avatar">
                                        {expert.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="ch-expert-info">
                                        <h4 className="ch-expert-name">{expert.name}</h4>
                                        <p className="ch-expert-profession">{expert.profession}</p>
                                        <StarRating rating={expert.rating || 5} />
                                    </div>
                                </div>
                                <div className="ch-card-actions">
                                    <button
                                        className="ch-btn-info"
                                        onClick={() => handleInfo(expert._id)}
                                        aria-label={`View ${expert.name}'s profile`}
                                    >
                                        Info
                                    </button>
                                    <button
                                        className="ch-btn-chat"
                                        onClick={() => navigate(`/chat/${expert._id}`)}
                                        aria-label={`Chat with ${expert.name}`}
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ClientHome;