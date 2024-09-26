import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../config';

const AddEditObjectModal = ({ show, onHide, parentTypes, object, onSave, editMode = false }) => {
  const [parentTypeId, setParentTypeId] = useState('');
  const [parentObjects, setParentObjects] = useState([]);
  const [objectName, setObjectName] = useState(object.name);
  const [objectParent, setObjectParent] = useState(object.parentid);
  const [isParentTypeDisabled, setIsParentTypeDisabled] = useState(false);
  const [isParentDisabled, setIsParentDisabled] = useState(false);
  const [typeName, setTypeName] = useState('Object');

  useEffect(() => {
      // Fetch type name
      const fetchTypeDetails = async () => {
        try {
          const response = await fetch(`${config.backendUrl}objecttypeGetType.php?typeid=${object.objecttype_id}`);
          const data = await response.json();
          setTypeName(data[0].typeName);

        } catch (err) {
          console.error(err);
        }
      };
      fetchTypeDetails();
  }, [object.objecttype_id]);

  useEffect(() => {
    if (parentTypes.length === 0) {
      setIsParentTypeDisabled(true);
      setIsParentDisabled(true);
    } else if (object.parentid) {
      // Fetch parent object details to determine the parent type
      const fetchParentDetails = async () => {
        try {
          const response = await fetch(`${config.backendUrl}objectGetObject.php?objectid=${object.parentid}`);
          const data = await response.json();
          setParentTypeId(data.objecttype_id); // Set the parent type ID

          // Fetch parent objects based on the parent type ID
          const parentObjectsResponse = await fetch(`${config.backendUrl}objectGetObjects.php?typeid=${data.objecttype_id}`);
          const parentObjectsData = await parentObjectsResponse.json();
          setParentObjects(parentObjectsData);

          setIsParentTypeDisabled(true);
          setIsParentDisabled(true);
        } catch (err) {
          console.error(err);
        }
      };
      fetchParentDetails();
    } else {
      setIsParentTypeDisabled(false);
      setIsParentDisabled(false);
    }
  }, [object.parentid, parentTypes]);

  useEffect(() => {
    if (parentTypeId && !isParentDisabled && !object.parentid) {
      const fetchParentObjects = async () => {
        try {
          const response = await fetch(`${config.backendUrl}objectGetObjects.php?typeid=${parentTypeId}`);
          const data = await response.json();
          setParentObjects(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchParentObjects();
    }
  }, [parentTypeId, isParentDisabled, object.parentid]);

  const handleSave = () => {
    const newObject = {
      id: object.id,
      name: objectName,
      objecttype_id: object.objecttype_id,
      parentid: objectParent,
      typeName: object.typeName,
    };
    onSave(newObject);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? 'Edit ' : 'Add '}{typeName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {parentTypes.length > 0 && (
            <Form.Group controlId="formParentType">
              <Form.Label>Parent Type</Form.Label>
              <Form.Control
                as="select"
                value={parentTypeId}
                onChange={(e) => setParentTypeId(e.target.value)}
                disabled={isParentTypeDisabled}
              >
                <option value="">Select Parent Type</option>
                {parentTypes.map((pt) => (
                  <option key={pt.typeId} value={pt.typeId}>
                    {pt.typeName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}

          {parentTypes.length > 0 && parentTypeId && (
            <Form.Group controlId="formParent">
              <Form.Label>Parent</Form.Label>
              <Form.Control
                as="select"
                value={object.parentid}
                disabled={isParentDisabled}
                onChange={(e) => setObjectParent(e.target.value)}
              >
                <option value="">Select Parent</option>
                {parentObjects.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}

          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder={"Enter " + typeName + " name"}
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
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

export default AddEditObjectModal;
