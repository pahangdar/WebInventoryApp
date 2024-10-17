import React, { useState, useEffect  } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import AlertPopup from './AlertPopup';
import config from '../config';

const LoginModal = ({ show, handleClose, onLoginSuccess  }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // for Popup Alert param
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState({});

    // Parse query parameters from the URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        const passwordParam = queryParams.get('password');
        console.log('emailParam', emailParam);
        console.log('passwordParam', passwordParam);
        if (emailParam) setEmail(emailParam); // Set email if it's in the URL
        if (passwordParam) setPassword(passwordParam); // Set password if it's in the URL
    }, [location.search]); // This effect runs when the location changes

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${config.backendUrl}LoginViaObject.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('role', result.role);
                localStorage.setItem('userName', result.userName);

                handleClose(); // Close the modal on successful login
                onLoginSuccess(); // Notify parent component that login was successful
                navigate('/'); // Redirect to home (or any other page)
            } else {
                setPopupData({
                    message: 'Login failed. Please check your credentials.',
                    delay: 2,
                    bg:'warning',
                  });
                  setShowPopup(true);
                
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleLogin}>
                    <Form.Group controlId="formUsername">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className='mt-3'>
                        Login
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
        <AlertPopup
            show= {showPopup}
            popupData={popupData}
            onClose={() => setShowPopup(false)}
        />
        </>
    );
};

export default LoginModal;
