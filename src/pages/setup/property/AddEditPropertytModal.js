import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../../config';

const AddEditPropertytModal = ({ show, onHide, object, onSave, editMode = false }) => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [objectName, setObjectName] = useState(object.name);
  const [objectType, setObjectType] = useState(object.propertytype_id);
  const [objectValueList, setObjectValueList] = useState(object.values_list);
  
  useEffect(() => {
      const fetchTypeDetails = async () => {
        try {
          const response = await fetch(`${config.backendUrl}propertyTypeGetPropertyTypes.php`);
          const data = await response.json();
          setPropertyTypes(data);

        } catch (err) {
          console.error(err);
        }
      };
      fetchTypeDetails();
  }, [object.propertytype_id]);

  const handleSave = () => {
    const newObject = {
      id: object.id,
      name: objectName,
      values_list: objectValueList,
      propertytype_id: objectType,
    };
    onSave(newObject);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit ' : 'Add '}Property</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>

        <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder={"Enter Name"}
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formType">
            <Form.Label>Type</Form.Label>
            <Form.Control
              as="select"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
            >
              <option value="">Select Type</option>
              {propertyTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formValueLisy">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder={"Enter Value list"}
              value={objectValueList}
              onChange={(e) => setObjectValueList(e.target.value)}
            />
          </Form.Group>

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

export default AddEditPropertytModal;
