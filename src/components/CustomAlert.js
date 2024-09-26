import { Alert } from 'react-bootstrap';

function CustomAlert({ variant = 'warning', message, onClose }) {
  return (
    <Alert variant={variant} onClose={onClose} dismissible>
      {message}
    </Alert>
  );
}

export default CustomAlert;
