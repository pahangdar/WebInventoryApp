// src/components/AddButton.js
import React from 'react';
import { Button } from 'react-bootstrap';

const AddButton = ({ onClick }) => {
  return (
    <Button variant="primary" onClick={onClick} style={{ margin: '1rem' }}>
      Add New Object
    </Button>
  );
};

export default AddButton;
