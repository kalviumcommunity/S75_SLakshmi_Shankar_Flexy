import React, { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import '../styles/Client-home.css';
import Logo from '../assests/homeLogo.png';
import { Filter, Search, MapPinned, X } from 'lucide-react';

const ClientHome = () => {
    const [allExperts, setAllExperts] = useState([]);
    const [userName, setUserName] = useState('');
    const [locationSet, setLocation] = useState("");
    const [searchSet, setSearch] = useState("");
    const [error, setError] = useState([]);
    const navigate = useNavigate();

    const star = [];

    for(let i=1; i<=5; i++){
        star.push(<span key={i}>★</span>)
    }

    const getExperts = async () => {
        try {
            const response = await fetch('https://flexy-backend.onrender.com/api/all-experts', {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAllExperts(data.users);
                
                setSearch("");
                setLocation("");
                setError([]);
            }
            else{
                const data = await response.json();
                setError(data)
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const getByLocation = async () => {
        try {
            const response = await fetch('http://localhost:5000/API/get-by-location', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location: locationSet }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAllExperts(data.data);
                setError([]);
            }else{
                const data = await response.json();
                setError(data)
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const getByName = async () => {
        try {
            const response = await fetch('http://localhost:5000/API/get-by-profession', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    profession: searchSet 
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAllExperts(data.data);
                setError([]);
            }else{
                const data = await response.json();
                setError(data)
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleInfo = (_id) => {
        navigate(`/expert/${_id}`); 
    };
    const handleChat = (expertId) => {
        navigate(`/chat/${expertId}`);
    };


    useEffect(() => {
        getExperts();
        setUserName(Cookie.get('name'));
    }, []);

    return (
        <div className='client-home-container'>
            <div className='home-header'>
                <img src={Logo} alt='Flexy' className='home-logo' />
                <div className='user-name'>{userName}</div>
            </div>

            <div className='search-bar'>
                <div className='location'>
                    <MapPinned size={20} strokeWidth={1.5} />
                    <input type="text" placeholder="Location" value={locationSet} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className='filter' onClick={getByLocation}>
                    <Filter size={16} strokeWidth={1.5} />
                    
                </div>
                <input type="text" placeholder="Search by profession" className='search-input' value={searchSet} onChange={(e) => setSearch(e.target.value)} />
                <X size={20} strokeWidth={1.5} onClick={getExperts} className='searchIcon'/>
                <Search size={20} strokeWidth={1.5} className='searchIcon' onClick={getByName} />
            </div>

            <hr className='hr' />

            <div className='experts-list'>
            {error.length !== 0 ? (
            <div className='no-data-message'>
                <p>No experts found matching your search.</p>
            </div>
        ) : (
            allExperts.map((expert, index) => (
                <div className='expert-card' key={index}>
                    <img
                        src={`http://localhost:5000/uploads/${encodeURIComponent(expert.licenseFile.filename)}`}
                        alt={expert.name}
                        className='expert-image'
                    />
                    <div className='expert-details'>
                        <h4>{expert.name}</h4>
                        <p>{expert.profession}</p>
                        <div className='stars'>
                            {star}
                        </div>
                    </div>
                    <div className='action-buttons'>
                        <button className='info-btn' onClick={() => handleInfo(expert._id)}>Info</button>
                        <button className='chat-btn' onClick={() => handleChat(expert._id)}>Chat</button>
                    </div>
                </div>
            ))
        )}
            </div>
        </div>
    );
};

export default ClientHome;
