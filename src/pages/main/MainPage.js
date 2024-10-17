import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import config from '../../config';
import Loading from '../../components/Loading';
import ShowMessage from '../../components/ShowMessage';
import ObjectTypeCard from './ObjectTypeCard';

const MainPage = () => {
  const [objectTypes, setObjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from PHP backend
    const fetchObjectTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        //const response = await fetch(`${config.backendUrl}objectGetObjectTypes.php`, {
        const response = await fetch(`${config.backendUrl}objecttypeGetObjecttypes.php`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setObjectTypes(data);

      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchObjectTypes();
  }, []);

  
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ShowMessage heading={error}/>;
  }

  return (
    <>
      <Container>
      <Row className="align-items-center mb-3 mt-3">
          {/* <Col>
            <h3>Test</h3>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={handleAddButtonClick}>Add New Object</Button>
          </Col> */}
        </Row>
        <Row xs={1} md={4} className="g-4">
          {objectTypes.map(({ typeId, typeName, count, cssStyles, countTitle }) => (
            <Col key={typeId} md={4}>
              <ObjectTypeCard
                key={typeId}
                typeid={typeId}
                name={typeName}
                count={count}
                cssStyles={cssStyles}
                countTitle={countTitle} 
              />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default MainPage;
