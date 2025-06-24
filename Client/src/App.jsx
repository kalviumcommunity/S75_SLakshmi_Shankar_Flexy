import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css'
import './index.css'

import ClientSignUp from './Client-Components/Client-sign-up';
import LandingPage from './Landing-page';
import ClientLogin from './Client-Components/Client-login';
import ClientHome from './Client-Components/Client-home';
import ExpertSiginUp from './Expert-Components/Expert-sigin-up';
import ExpertHome from './Expert-Components/Expert-home';
import ExpertLogin from './Expert-Components/Expert-login';
import ClientInfo from './Client-Components/Client-Info';
import Chat from './Client-Components/Chat';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/client-sign-up' element={<ClientSignUp />} />
        <Route path='/client-login' element={<ClientLogin />} />
        <Route path='/client-home' element={<ClientHome />} />
        <Route path='/expert/:id' element={<ClientInfo />} />
        <Route path='/chat/:expertId' element={<Chat />} />

        <Route path='/expert-sign-up' element={<ExpertSiginUp />} />
        <Route path='/expert-login' element={<ExpertLogin />} />
        <Route path='/expert-home' element={<ExpertHome />} />
      </Routes>
    </Router>
  );
}

export default App;
