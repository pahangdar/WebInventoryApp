import React from "react";
import { useState } from 'react';
import { Alert } from "react-bootstrap";

const ShowMessage = ({ heading, body }) => {
    const [show, setShow] = useState(true);
    if (show) {
        return(
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>{heading}</Alert.Heading>
                {(body) && (
                    <p>
                        {body}
                    </p>                
                )}
            </Alert>
        );    
    }
    return <></>;
}

export default ShowMessage;