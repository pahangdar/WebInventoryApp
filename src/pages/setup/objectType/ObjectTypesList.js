import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import config from '../../../config';
import Loading from '../../../components/Loading';
import ShowMessage from '../../../components/ShowMessage';
import AlertPopup from '../../../components/AlertPopup';
import ConfirmationModal  from '../../../components/ConfirmationModal';
import AddEditObjectModal from './AddEditObjectModal';

const ObjectTypesList = ({ typeid: propTypeId, parentid: propParentId, showAsPage = true }) => {
  
  const { typeid: urlTypeId, parentid: urlParentId } = useParams();
  //const { typeid: propTypeId, parentid: propParentId } = props;


  // Determine which parameters to use
  const typeid = propTypeId || urlTypeId;
  const parentid = propParentId || urlParentId;
  //const parentid = propParentId !== undefined ? propParentId : urlParentId;

  // Determine if we're in URL mode
  const isFromUrl = !!urlTypeId;

  const navigate = useNavigate(); // Get navigate function
  
  const [objects, setObjects] = useState([]);
  const [typeName, setTypename] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [parentTypes, setParentTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // for AddEditObjectModal's param
  const [addEditObject, setAddEditObject] = useState({});
  const [editMode, setEditMode] = useState(false);
  // for Popup Alert param
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  // for ConfirmationModal's param
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  // for ObjectDetails param
  const [detailsEditable, setDetailsEditable] = useState(false);


  const fetchObjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${config.backendUrl}objectGetObjects.php?` + 
            (typeid ? `typeid=${typeid}` : '') +
            (parentid ? (typeid ? '&' : '') + `parentid=${parentid}` : '');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  }, [parentid, typeid]);

  const handleRowClick = (objectId) => {
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null); // Deselect if clicking the same row
    } else {
      setSelectedObjectId(objectId);
    }
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };


  const handleAddButtonClick = () => {
    const newObject = {
      id: 0,
      name: '',
      objecttype_id: typeid,
      parentid: parentid,
      typeName: typeName,
    };
    setAddEditObject(newObject);
    setEditMode(false);
    setShowModal(true);
    // for ObjectDetails
    setDetailsEditable(true);
  };
  
  const handleEditButtonClick = (editObject) => {
    setAddEditObject(editObject);
    setEditMode(true);
    setShowModal(true);
    // for ObjectDetails
    setDetailsEditable(false);
  };
  

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSaveObject = async (newObject) => {
    const endpoint = editMode ? 'objectEdit.php' : 'objectAdd.php';
    
    try {
      const response = await fetch(`${config.backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newObject),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      
      if (result.ok) {
        const newObjectId = result.id;
        setPopupData({
          message: `(${newObject.typeName}) ${newObject.name} saved successfully`,
          delay: 2,
        });
        setShowPopup(true);
        fetchObjects(); // Refresh the list to include the new object
        if (!editMode) {
          handleRowClick(newObjectId);  
        }
      } else {
        setPopupData({
          message: 'Failed to save object: ' + result.message,
          bg: "danger"
        });
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error saving object:', error);
      setPopupData({
        message: "An error occurred while saving the object.",
        bg: "danger"
      });
      setShowPopup(true);
    }
  };
  
  const handleDeleteClick = (object) => {
    if(object.childCount) {
      setPopupData({
        message: `Cannot delete (${selectedObject.typeName}) ${selectedObject.name}
          because it has child objects. Please remove the child objects first.`,
        delay: 5,
        bg: "warning"
      });
      setShowPopup(true);
      return;
    }

    setSelectedObject(object);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete  = async () => {

    setShowConfirmModal(false);

    try {
      const response = await fetch(`${config.backendUrl}objectDelete.php?id=${selectedObject.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.ok) {
        setPopupData({
          message: `(${selectedObject.typeName}) ${selectedObject.name}  deleted successfully`,
        });
        setShowPopup(true);
        fetchObjects();
      } else {
        setPopupData({
          message: 'Failed to delete object: ' + result.message,
          bg: "danger"
        });
        setShowPopup(true);
      }

    } catch (err) {
      setPopupData({
        message: `An error occurred: ${err.message}`,
        bg: "danger"
      });
      setShowPopup(true);
    }
  };
  
  const handleObjectDetailsClose = async (objectId) => {
    try {
      const response = await fetch(`${config.backendUrl}objectGetObjects.php?objectid=${objectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      const updatedChildCount = result.length > 0 ? result[0].childCount : null;
  
      // Update the object in the state with the new child count
      setObjects((prevObjects) =>
        prevObjects.map((obj) =>
          obj.id === objectId ? { ...obj, childCount: updatedChildCount } : obj
        )
      );
    } catch (error) {
      console.error('Error fetching child count:', error);
    } finally {
      setSelectedObjectId(null); // Close the ObjectDetails
    }
  };
  

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ShowMessage heading={error} />;
  }

  
  return (
    <>
    <Container>
      <Row className="align-items-center mb-3 mt-3">
        
          <Col>
            <h3>Object Type ({objects.length})</h3>
          </Col>
       
        <Col className="text-end">
          <Button
            variant="primary"
            size   =""
            onClick={handleAddButtonClick}
          >
            Add New Object Type
          </Button>
          
          <Button variant="dark" className='ms-3' onClick={handleBackButtonClick}>Back</Button>
          
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {objects.map((object) => (
            <React.Fragment key={object.id}>
              <tr onClick={() => handleRowClick(object.id)}>
                <td>{object.id}</td>
                <td>{object.name}</td>
                <td style={{ width: '60px' }} onClick={(e) => e.stopPropagation()}>
                  {selectedObjectId === null && (
                  <DropdownButton id="dropdown-basic-button" title="..." variant="outline-dark" size='sm'>
                    <Dropdown.Item onClick={() => handleEditButtonClick(object)}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteClick(object)}>Delete</Dropdown.Item>
                  </DropdownButton>
                  )}
                </td> 
              </tr>
              {selectedObjectId === object.id && (
                <tr>
                  <td colSpan="3">
                    
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </Container>
    
    {showModal && (<AddEditObjectModal
        show={showModal}
        onHide={handleModalClose}
        parentTypes={parentTypes}
        object={addEditObject}
        onSave={handleSaveObject}
        editMode={editMode}
      />)}

    <AlertPopup
      show= {showPopup}
      popupData={popupData}
      onClose={() => setShowPopup(false)}
    />

    <ConfirmationModal
      show={showConfirmModal}
      onHide={() => setShowConfirmModal(false)}
      onConfirm={handleConfirmDelete}
      title={`Delete ${selectedObject?.typeName}`}
      message={`Are you sure you want to delete (${selectedObject?.typeName}) ${selectedObject?.name}?`}
    />

    </>
  );
};

export default ObjectTypesList;
