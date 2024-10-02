import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import config from '../../config';
import Loading from '../../components/Loading';
import ShowMessage from '../../components/ShowMessage';
import AlertPopup from '../../components/AlertPopup';
import ConfirmationModal  from '../../components/ConfirmationModal';
import AddEditRecordModal from './AddEditRecordModal';

const TableList = ({ tableConfig }) => { // Pass table configuration as prop
  
  const navigate = useNavigate(); 
  
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addEditObject, setAddEditObject] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);

  const fetchObjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.backendUrl}${tableConfig.endpointGet}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setObjects(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, [tableConfig]);

  const handleBackButtonClick = () => navigate(-1);

  const handleAddButtonClick = () => {
    setAddEditObject(tableConfig.initialObject);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditButtonClick = (editObject) => {
    setAddEditObject(editObject);
    setEditMode(true);
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleSaveObject = async (newObject) => {
    const endpoint = editMode ? tableConfig.endpointEdit : tableConfig.endpointAdd;
    try {
      const response = await fetch(`${config.backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObject),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.ok) {
        setPopupData({ message: `${newObject.name} saved successfully`, delay: 2 });
        setShowPopup(true);
        fetchObjects();
      } else {
        setPopupData({ message: 'Failed to save object: ' + result.message, bg: 'danger' });
        setShowPopup(true);
      }
    } catch (error) {
      setPopupData({ message: 'An error occurred while saving the object.', bg: 'danger' });
      setShowPopup(true);
    }
  };

  const handleDeleteClick = (object) => {
    setSelectedObject(object);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      const response = await fetch(`${config.backendUrl}${tableConfig.endpointDelete}?id=${selectedObject.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.ok) {
        setPopupData({ message: `${selectedObject.name} deleted successfully` });
        setShowPopup(true);
        fetchObjects();
      } else {
        setPopupData({ message: 'Failed to delete object: ' + result.message, bg: 'danger' });
        setShowPopup(true);
      }
    } catch (err) {
      setPopupData({ message: `An error occurred: ${err.message}`, bg: 'danger' });
      setShowPopup(true);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ShowMessage heading={error} />;

  return (
    <>
      <Container>
        <Row className="align-items-center mb-3 mt-3">
          <Col><h3>{tableConfig.title} ({objects.length})</h3></Col>
          <Col className="text-end">
            <Button variant="primary" onClick={handleAddButtonClick}>Add New {tableConfig.title}</Button>
            <Button variant="dark" className='ms-3' onClick={handleBackButtonClick}>Back</Button>
          </Col>
        </Row>
        <Table striped bordered hover>
          <thead>
            <tr>
              {tableConfig.columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {objects.map((object) => (
              <tr key={object.id}>
                {tableConfig.columns.map((col) => (
                  <td key={col.key}>{object[col.key]}</td>
                ))}
                <td>
                  <DropdownButton id="dropdown-basic-button" title="..." variant="outline-dark" size='sm'>
                    <Dropdown.Item onClick={() => handleEditButtonClick(object)}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteClick(object)}>Delete</Dropdown.Item>
                  </DropdownButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      
      {showModal && (
        <AddEditRecordModal
          show={showModal}
          onHide={handleModalClose}
          object={addEditObject}
          onSave={handleSaveObject}
          tableConfig={tableConfig}  // Pass tableConfig for dynamic form
          editMode={editMode}
        />
      )}

      <AlertPopup show={showPopup} popupData={popupData} onClose={() => setShowPopup(false)} />
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedObject?.name}`}
        message={`Are you sure you want to delete ${selectedObject?.name}?`}
      />
    </>
  );
};

export default TableList;
