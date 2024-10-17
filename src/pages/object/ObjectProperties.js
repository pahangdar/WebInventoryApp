import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import config from '../../config';
import Loading from '../../components/Loading';
import ShowMessage from '../../components/ShowMessage';
import ObjectPropertyInput from './ObjectPropertyInput';
import AlertPopup from '../../components/AlertPopup';

const ObjectProperties = ({ objectId, setId, editable = false, showTitle = false, onUnsavedChanges, startEdit = false }) => {

  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [editMode, setEditMode] = useState(startEdit);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // for Popup Alert param
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({});

  const saveFunctions = useRef([]); // Track save functions for each ObjectPropertyInput
  const firstInputRef = useRef(null); // Ref for the first input

  const userRole = localStorage.getItem('role');

  // Focus the first input when edit mode is enabled
  useEffect(() => {
    if (editMode && firstInputRef.current) {
      firstInputRef.current.focus(); // Focus the first input field
    }
  }, [editMode]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.backendUrl}objectGetObjectProperties.php?objectid=${objectId}&setid=${setId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDetails(data);

        const initialFormValues = data.reduce((acc, curr) => {
          acc[curr.id] = curr.value ?? '';
          return acc;
        }, {});
        setFormValues(initialFormValues);
        setOriginalValues(initialFormValues);

      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [objectId, setId]);

  const handleInputChange = (id, value) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    // Call all save functions before proceeding to save the rest of the form
    for (const saveFunction of saveFunctions.current) {
      if (typeof saveFunction === 'function') {
        await saveFunction(); // Invoke each function to remove deleted images
      }
    }
    
    
    const updatedProperties = Object.keys(formValues).reduce((acc, key) => {
      if (formValues[key] !== originalValues[key]) {
        acc[key] = formValues[key];
      }
      return acc;
    }, {});

    try {
      const response = await fetch(`${config.backendUrl}objectUpdateObjectProperties.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objectId, properties: updatedProperties }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setPopupData({
        message: `${setName}'s Data saved successfully!`,
        delay: 2,
      });
      setShowPopup(true);
      setOriginalValues(formValues); // Update original values
      setHasUnsavedChanges(false);
      onUnsavedChanges(false);
      setEditMode(false);

    } catch (err) {
      alert(`An error occurred: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      // If no unsaved changes, directly reset to original values
      setFormValues(originalValues);
      setEditMode(false);
    }
  };

  const handleConfirmCancel = () => {
    setFormValues(originalValues);
    setEditMode(false);
    setShowConfirmModal(false);
    setHasUnsavedChanges(false);
    onUnsavedChanges(false);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${config.backendUrl}uploadImage.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.filePath; // Return the file path from the server response

    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const deleteImage = async (filePath) => {
    try {
      const response = await fetch(`${config.backendUrl}deleteImage.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }), // Send the file path to delete
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      const data = await response.json();
      return data.success; // The server should return a success message

    } catch (error) {
      console.error('Image deletion error:', error);
      return false;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ShowMessage heading={error} />;
  }

  const setName = details.length > 0 ? details[0].setName : '';

  return (
    <>
    <Container>
      <Form>
        <Row className="align-items-center mb-3 mt-3">
          {showTitle && (
            <Col>
              <h3>{setName} Properties</h3>
            </Col>
          )}
          <Col className="text-end">
            {editable && !editMode && userRole !== 'user' && (
              <Button
                onClick={handleEditToggle}
                variant={showTitle ? "primary" : "outline-dark"}
                size={showTitle ? "" : "sm"}
              >
                Edit {setName}
              </Button>
            )}
            {editable && editMode && userRole !== 'user' && (
              <>
                <Button
                  onClick={handleSave}
                  variant= {hasUnsavedChanges ? "success" : "outline-dark"}
                  size={showTitle ? "" : "sm"}
                  className='me-3'
                >
                  Save {setName}
                </Button>
                <Button onClick={handleCancelEdit} variant= {hasUnsavedChanges ? "secondary" : "outline-dark"} size={showTitle ? "" : "sm"}>
                  Cancel Edit
                </Button>
              </>
            )}
          </Col>
        </Row>
        {details.map(({ id, name, values_list, type, cssStyles }, index) => (
          <ObjectPropertyInput
            key={id}
            ref={index === 0 ? firstInputRef : null} // Attach the ref to the first input
            id={id}
            name={name}
            type={type}
            values_list={values_list}
            formValues={formValues}
            handleInputChange={handleInputChange}
            editable={editMode}
            uploadImage={uploadImage}
            deleteImage={deleteImage}
            onSave={(saveFunc) => saveFunctions.current.push(saveFunc)} // Collect save functions
            cssStyles={cssStyles}
          />
        ))}
      </Form>
    </Container>

    <Modal
      show={showConfirmModal}
      onHide={handleCloseModal}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Discard {setName} Changes?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        You have unsaved changes. Are you sure you want to discard them?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Stay on Page
        </Button>
        <Button variant="primary" onClick={handleConfirmCancel}>
          Discard Changes
        </Button>
      </Modal.Footer>
    </Modal>

    <AlertPopup
      show= {showPopup}
      popupData={popupData}
      onClose={() => setShowPopup(false)}
    />

    </>
  );
};

export default ObjectProperties;
