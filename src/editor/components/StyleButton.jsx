import React from 'react';
import { Icon } from 'semantic-ui-react';

export function StyleButton(props) {
  const onToggle = (e) => {
    e.preventDefault();
    props.onToggle(props.style);
  };

  return (
    <Icon disabled={!props.active} link size="big" name={props.name} onMouseDown={onToggle} />
  );
}
