import React from 'react';
import { Modal } from 'semantic-ui-react';

function ShowHTML(props) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
    >
      <Modal.Header>HTML-разметка</Modal.Header>
      <Modal.Content>
          {props.HTMLTEXT}
      </Modal.Content>
    </Modal>
  );
}

export default ShowHTML;
