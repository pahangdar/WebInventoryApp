import React, { useState, useEffect, forwardRef   } from 'react';
import { Form, InputGroup, Button, Row, Col, Image } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa'; // For visibility toggle icons
import config from '../../config';
import { parseInlineCss } from '../../utils/cssUtils';

const ObjectPropertyInput = forwardRef(({
  id,
  name,
  type,
  values_list,
  formValues,
  handleInputChange,
  editable,
  uploadImage, // Function to handle image upload
  deleteImage, // Function to handle image deletion
  onSave, // New prop for handling save
  onCancel, // New prop for handling save
  cssStyles,
}, ref) => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const inputValue = formValues[id] ?? ''; 
  const options = values_list
    ? values_list.split(',').map((option) => option.trim())
    : [];

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const [images, setImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]); // Track newly added images
  const [deletedImages, setDeletedImages] = useState([]); // Track deleted images
  
  // Initialize the image list from formValues
  useEffect(() => {
    if (formValues[id]) {
      const initialImages = formValues[id].split(','); // Parse the comma-separated string into an array
      setImages(initialImages);
    }
  }, [formValues, id]);

  // Trigger the onSave callback to handle image removal when saving
  useEffect(() => {
    if (onSave) {
      onSave(removeDeletedImagesFromServer); // Provide the delete image handler
    }
  }, [onSave]);

  // Trigger the onCancel callback to handle image removal when canceling
  useEffect(() => {
    if (onCancel) {
      onCancel(removeNewImagesFromServer); // Provide the delete image handler
    }
  }, [onCancel]);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    const uploadedImages = [];

    for (let file of files) {
      // Upload image and get the server path
      const serverFilePath = await uploadImage(file);
      uploadedImages.push(serverFilePath);
    }

    // Update the image list and pass the comma-separated string to the parent
    const updatedImages = [...images, ...uploadedImages];
    setImages(updatedImages);
    setAddedImages([...addedImages, ...uploadedImages]); // Track newly added images
    handleInputChange(id, updatedImages.join(','));
  };

  const handleDeleteImage = async (imagePath) => {
    // // Add to the deleted images list if it is an original image
    // if (!addedImages.includes(imagePath)) {
    //   setDeletedImages([...deletedImages, imagePath]);
    // } else {
    //   // If it was a newly added image, remove it from the addedImages state and server
    //   handleCancelNewImage(imagePath);
    // }
    setDeletedImages([...deletedImages, imagePath]);

    // Update the displayed images
    const updatedImages = images.filter((image) => image !== imagePath);
    setImages(updatedImages);
    handleInputChange(id, updatedImages.join(','));
  };

   // Remove deleted images from the server when confirmed
   const removeDeletedImagesFromServer = async () => {
    for (let imagePath of deletedImages) {
      await deleteImage(imagePath); // Remove the image from the server
    }
    setDeletedImages([]); // Clear deleted images list after saving
    setAddedImages([]);
  };

   // Remove new added images from the server when cancel
   const removeNewImagesFromServer = async () => {
    for (let imagePath of addedImages) {
      await deleteImage(imagePath); // Remove the image from the server
      const updatedImages = images.filter((image) => image !== imagePath);
      setImages(updatedImages);
    }
    setAddedImages([]); // Clear new added images list after canceling
    setDeletedImages([]);
  };

  const inlineStyles = cssStyles ? parseInlineCss(cssStyles) : {};

  return (
    <Form.Group controlId={`property-${id}`} className="mb-3">
      <Form.Label>{name}</Form.Label>
      {options.length > 0 ? (
        <Form.Select
          ref={ref}
          value={inputValue}
          onChange={(e) => handleInputChange(id, e.target.value)}
          disabled={!editable}
          style={inlineStyles}
          aria-label={`Select ${name}`}
        >
          <option value="" disabled>
            Select {name}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </Form.Select>
      ) : String(type) === '6' ? (
        <>
          <Form.Control
            type="file"
            ref={ref}
            multiple
            onChange={handleFileSelect}
            disabled={!editable}
            style={inlineStyles}
          />
          <Row className="mt-2">
            {images.map((imagePath, index) => (
              <Col xs={4} key={index} className="mb-2">
                <div style={{ position: 'relative' }}>
                  <Image src={config.backendUrl + imagePath} thumbnail fluid />
                  {editable && (
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => handleDeleteImage(imagePath)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        // Handle password type with a toggle
        <InputGroup>
          <Form.Control
            type={showPassword ? 'text' : getInputType(type)}
            ref={ref}
            value={inputValue}
            onChange={(e) => handleInputChange(id, e.target.value)}
            disabled={!editable}
            placeholder={editable ? `Enter ${name}` : ''}
            style={inlineStyles}
          />
          {String(type) === '5' && (
            <InputGroup.Text onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </InputGroup.Text>
          )}
        </InputGroup>
      )}
    </Form.Group>
  );
});

// Helper function to map type codes to input types
const getInputType = (type) => {
  switch (String(type)) {
    case '1':
      return 'number';
    case '2':
      return 'text';
    case '3':
      return 'date';
    case '4':
      return 'email';
    case '5':
      return 'password';
    default:
      return 'text';
  }
};

export default ObjectPropertyInput;
