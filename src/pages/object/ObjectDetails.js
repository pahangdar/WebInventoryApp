import React, { useState, useEffect } from 'react';
import config from '../../config';
import Loading from '../../components/Loading';
import ShowMessage from '../../components/ShowMessage';
import { Tabs, Tab, Card, Button } from 'react-bootstrap';
import ObjectsList from './ObjectsList';
import ObjectProperties from './ObjectProperties';
import ConfirmationModal from '../../components/ConfirmationModal';
import { parseInlineJsCss } from '../../utils/cssUtils';

const ObjectDetails = ({ object, onClose, startEdit = false }) => {
  const [childTypes, setChildTypes] = useState([]);
  const [typePropertySets, setTypePropertySets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [propertyActiveKey, setPropertyActiveKey] = useState(null);
  const [currentTabTitle, setCurrentTabTitle] = useState(typePropertySets['0']?.setName || '');
  const [unsavedChanges, setUnsavedChanges] = useState({});
  
  // New state for modal control
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch childTypes
        const response2 = await fetch(`${config.backendUrl}objecttypeGetObjectChildtypes.php?typeid=${object.objecttype_id}&parentid=${object.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response2.ok) {
          throw new Error(`HTTP error! Status: ${response2.status}`);
        }

        const data2 = await response2.json();
        setChildTypes(data2);
        if (data2.length > 0) {
          setActiveKey(data2[0].typeId); // Set the default active tab
        }
        
        // Fetch typePropertySets
        const response3 = await fetch(`${config.backendUrl}objecttypeGetPropertySets.php?typeid=${object.objecttype_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response3.ok) {
          throw new Error(`HTTP error! Status: ${response3.status}`);
        }

        const data3 = await response3.json();
        setTypePropertySets(data3);
        if (data3.length > 0) {
          setPropertyActiveKey(data3[0].setId); // Set the default active tab
          setCurrentTabTitle(data3[0].setName);
        }
        
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [object.id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ShowMessage heading={error} />;
  }

  const handleTabSelect = (key) => {
    // Switch tabs, confirm unsaved changes if any
    setPropertyActiveKey(key);
    const selectedTab = typePropertySets.find(({ setId }) => String(setId) === String(key));
    setCurrentTabTitle(selectedTab?.setName || '');
  };

  const handleUnsavedChanges = (setId, hasUnsavedChanges) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [setId]: hasUnsavedChanges,
    }));
  };

  const handleCloseClick = () => {
    // Check for unsaved changes
    const hasChanges = Object.values(unsavedChanges).some(value => value);
    if (hasChanges) {
      // Show the confirmation modal
      setShowConfirmationModal(true);
    } else {
      // Close without confirmation if no unsaved changes
      onClose();
    }
  };

  const handleConfirmClose = () => {
    // User confirms closing, discard unsaved changes
    setShowConfirmationModal(false);
    onClose(); // Close the ObjectDetails
  };

  const handleCancelClose = () => {
    // User cancels the close action
    setShowConfirmationModal(false);
  };

  const inlineStyles = object.cssStyles ? parseInlineJsCss(object.cssStyles) : {};

  return (
    <Card style={inlineStyles}>
      <Card.Header as="h5">({object.typeName}) {object.name}'s Details
        <Button variant="outline-dark" size="sm" style={{ float: 'right' }} onClick={handleCloseClick}>
          &times;
        </Button>
      </Card.Header>
      <Card.Body>        
        <Card.Text>
          {typePropertySets.length > 0 && (
            <Card className='mb-3'>
              <Card.Header as="h6">{object.name}'s Properties</Card.Header>
              <Card.Body>
                <Card.Text>
                  <Tabs
                    activeKey={propertyActiveKey}
                    onSelect={(k) => handleTabSelect(k)}
                    id="propertyset-tabs"
                  >
                  {typePropertySets.map(({ setId, setName }) => (
                    <Tab
                      eventKey={setId}
                      title={unsavedChanges[setId] ? `${setName} *` : setName} 
                      key={setId}
                    >
                      <ObjectProperties
                        objectId={object.id}
                        setId={setId}
                        editable={true}
                        onUnsavedChanges={(hasUnsavedChanges) => handleUnsavedChanges(setId, hasUnsavedChanges)}
                        startEdit={startEdit}
                      />
                    </Tab>
                  ))}
                  </Tabs>
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          {childTypes.length > 0 && (
            <Card>
              <Card.Header as="h6">{object.name}'s Child Objects</Card.Header>
              <Card.Body>
                <Card.Text>
                  <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} id="child-types-tabs">
                    {childTypes.map(({ typeId, typeName, count }) => (
                      <Tab eventKey={typeId} title={typeName+"("+count+")"} key={typeId}>
                        <ObjectsList parentid={object.id} typeid={typeId} showAsPage={false} />
                      </Tab>
                    ))}
                  </Tabs>
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Card.Text>
      </Card.Body>

      {/* Confirmation modal for unsaved changes */}
      <ConfirmationModal
        show={showConfirmationModal}
        onHide={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
      />
    </Card>
  );
};

export default ObjectDetails;
