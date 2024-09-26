import React from "react";
import { Container, Spinner, Alert } from 'react-bootstrap';


const Loading = () => {
    return(
        <Alert variant="primary">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Alert>
    )
}

export default Loading