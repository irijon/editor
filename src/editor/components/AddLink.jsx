import React, { useRef, useState } from 'react';
import {
  Icon, Input, Button, Popup, Form,
} from 'semantic-ui-react';

export function AddLink(props) {
  const [Url, setUrl] = useState('');

  const refUrl = useRef(null);

  const onToggle = (e) => {
    e.preventDefault();
    props.onToggle(Url, Text);
    setUrl('');
  };

  return (
    <Popup
      hideOnScroll
      hoverable
      on="click"
      onMount={() => { refUrl.current.focus(); refUrl.current.select(); }}
      trigger={<div><Icon disabled={!props.active} link size="big" name={props.name} /></div>}
    >
      <Popup.Content>
        <Form>
          <Form.Field>
            <label>Адрес</label>
            <Input
              value={Url}
              onChange={(e) => {
                e.persist();
                setUrl(e.target.value);
              }}
              ref={refUrl}
            />
          </Form.Field>
          <Button icon="plus" onClick={onToggle} />
        </Form>
      </Popup.Content>
    </Popup>
  );
}
