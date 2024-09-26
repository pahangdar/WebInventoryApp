import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';

const ObjectTypeCard = ({ typeid, name, count }) => {
  return (
    <Link to={`/objects/${typeid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card style={{ margin: '.1rem' }}>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>
            Count: {count}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default ObjectTypeCard;
