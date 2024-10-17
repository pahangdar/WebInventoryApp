import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { parseInlineJsCss } from '../../utils/cssUtils';

const ObjectTypeCard = ({ typeid, name, count, cssStyles, countTitle }) => {
  
  const inlineStyles = cssStyles ? parseInlineJsCss(cssStyles) : {};

  return (
    <Link to={`/objects/${typeid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card style={inlineStyles}>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>
            Count: {count} {countTitle}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default ObjectTypeCard;
