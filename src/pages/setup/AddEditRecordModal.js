import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddEditRecordModal = ({ show, onHide, object, onSave, tableConfig, editMode = false }) => {
  const [formData, setFormData] = useState({});

  // Populate form data on object change or on modal open
  useEffect(() => {
    setFormData(object || {});
  }, [object]);

  // Handle form input changes
  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [field.key]: value,
    }));
  };

  // Handle Save
  const handleSave = () => {
    onSave(formData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit' : 'Add'} {tableConfig.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Dynamically generate form fields based on table configuration */}
          {tableConfig.columns.map((col) => (
            <Form.Group controlId={`form${col.key}`} key={col.key}>
              <Form.Label>{col.label}</Form.Label>
              {col.type === 'select' ? (
                <Form.Control
                  as="select"
                  value={formData[col.key] || ''}
                  onChange={(e) => handleInputChange(e, col)}
                >
                  <option value="">Select {col.label}</option>
                  {col.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Control>
              ) : (
                <Form.Control
                  type={col.type || 'text'}
                  placeholder={`Enter ${col.label}`}
                  value={formData[col.key] || ''}
                  onChange={(e) => handleInputChange(e, col)}
                />
              )}
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEditRecordModal;
