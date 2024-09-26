import { Toast } from 'react-bootstrap';

function AlertPopup({ show, popupData, onClose }) {
  /* bg: primary, secondary, success, danger, warning, info, light, dark*/
  return (
    <Toast
        onClose={onClose}
        show={show}
        autohide 
        style={{ position: 'absolute', top: 20, right: 20 }} 
        delay={(popupData.delay ? popupData.delay : 3) * 1000}
        bg={popupData.bg ? popupData.bg : "info"}
    > 
      <Toast.Header>
        <strong className="me-auto">Notification</strong>
      </Toast.Header>
      <Toast.Body>{popupData.message}</Toast.Body>
    </Toast>
  );
};

export default AlertPopup;