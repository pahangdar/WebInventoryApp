import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import MainPage from './pages/main/MainPage';
import ObjectsList from './pages/object/ObjectsList';
import SetupPage from './pages/setup/SetupPage';
import NavBar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ObjectTypesList from './pages/setup/objectType/ObjectTypesList';
import PropertiesList from './pages/setup/property/PropertiesList';

const App = () => {
  // Initialize the authenticated state
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const userRole = localStorage.getItem('role') || 'user'; // Default role is 'user'
  const [showLogin, setShowLogin] = useState(false);

  const handleShowLogin = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);

  // Handle user logout and update state
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setIsAuthenticated(false); // Update state
  };

  // Handle successful login and update authentication state
  const handleLoginSuccess = () => {
    setIsAuthenticated(!!localStorage.getItem('token')); // Update state after login
    handleCloseLogin(); // Close the login modal after success
  };

  useEffect(() => {
    if (!isAuthenticated) {
      handleShowLogin(); // Show login modal if user is not authenticated
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Container>
        <NavBar handleShowLogin={handleShowLogin} handleLogout={handleLogout} />
        <Routes>
          <Route path="/" element={isAuthenticated ? <MainPage /> : <Navigate to="/login" />} />
          <Route path="/objects/:typeid/:parentid?" element={isAuthenticated ? <ObjectsList /> : <Navigate to="/login" />} />
          <Route path="/setup" element={isAuthenticated && userRole === "admin" ? <SetupPage /> : <Navigate to="/" />} />
          <Route path="/setup/objecttypies" element={isAuthenticated && userRole === "admin" ? <ObjectTypesList /> : <Navigate to="/" />} />
          <Route path="/setup/properties" element={isAuthenticated && userRole === "admin" ? <PropertiesList /> : <Navigate to="/" />} />
          <Route path="/login" element={<LoginModal show={showLogin} handleClose={handleCloseLogin} onLoginSuccess={handleLoginSuccess} />} />
          {/* Add a catch-all route for 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
