import React, { useState, useRef } from 'react';
import {
  Editor, EditorState, RichUtils, CompositeDecorator,
} from 'draft-js';
import './Editor.sass';
import { convertToHTML } from 'draft-convert';
import { StyleButton } from './components/StyleButton';
import { AddLink } from './components/AddLink';
import ShowHTML from './components/ShowHTML';

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null
        && contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback,
  );
}

const Link = (props) => {
  const { url } = props.contentState
    .getEntity(props.entityKey).getData();

  return (
    <a href={url} title={url}>
      {props.children}
    </a>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  lineThrough: {
    textDecoration: 'line-through',
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    case 'CENTERED_BLOCK': return 'RichEditor-CENTERED_BLOCK';
    case 'JUSTIFY_BLOCK': return 'RichEditor-JUSTIFY_BLOCK';
    case 'LEFT_BLOCK': return 'RichEditor-LEFT_BLOCK';
    case 'RIGHT_BLOCK': return 'RichEditor-RIGHT_BLOCK';
    default: return null;
  }
}

const BLOCK_TYPES = [
  { name: 'heading', style: 'header-one' },
  { name: 'quote right', style: 'blockquote' },
  { name: 'list ul', style: 'unordered-list-item' },
  { name: 'list ol', style: 'ordered-list-item' },
  { name: 'code', style: 'code-block' },
  { name: 'align center', style: 'CENTERED_BLOCK' },
  { name: 'align justify', style: 'JUSTIFY_BLOCK' },
  { name: 'align left', style: 'LEFT_BLOCK' },
  { name: 'align right', style: 'RIGHT_BLOCK' },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return BLOCK_TYPES.map((type) => (
    <StyleButton
      key={type.name}
      active={type.style === blockType}
      name={type.name}
      onToggle={props.onToggle}
      style={type.style}
    />
  ));
};

const INLINE_STYLES = [
  { name: 'bold', style: 'BOLD' },
  { name: 'italic', style: 'ITALIC' },
  { name: 'underline', style: 'UNDERLINE' },
  { name: 'strikethrough', style: 'lineThrough' },
];

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  return INLINE_STYLES.map((type) => (
    <StyleButton
      key={type.name}
      active={currentStyle.has(type.style)}
      name={type.name}
      onToggle={props.onToggle}
      style={type.style}
    />
  ));
};

export default function TextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator));

  const onChange = (edState) => setEditorState(edState);

  const editor = useRef(null);

  const [openShowHTML, setOpenShowHTML] = useState(false);
  const [HTMLTEXT, setHTMLTEXT] = useState('');

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return true;
    }
    return false;
  };

  const toggleBlockType = (blockType) => {
    onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType,
      ),
    );
  };

  const setLink = (urlValue) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      { url: urlValue },
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    onChange(RichUtils.toggleLink(
      newEditorState,
      newEditorState.getSelection(),
      entityKey,
    ));
  };

  const unLink = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      onChange(RichUtils.toggleLink(editorState, selection, null));
    }
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle,
      ),
    );
  };

  const toHTML = () => {
    const html = convertToHTML({
      styleToHTML: (style) => {
        if (style === 'BOLD') {
          return <span style={{ fontWeight: 'bold' }} />;
        }
        if (style === 'ITALIC') {
          return <span style={{ fontStyle: 'italic' }} />;
        }
        if (style === 'UNDERLINE') {
          return <span style={{ textDecoration: 'underline' }} />;
        }
        if (style === 'lineThrough') {
          return <span style={{ textDecoration: 'line-through' }} />;
        }
      },
      blockToHTML: (block) => {
        if (block.type === 'header-one') {
          return <h1 />;
        }
        if (block.type === 'blockquote') {
          return <blockquote className="RichEditor-blockquote" />;
        }
        if (block.type === 'unordered-list-item') {
          return <ul className="public-DraftStyleDefault-ul" />;
        }
        if (block.type === 'ordered-list-item') {
          return <ol className="public-DraftStyleDefault-ol" />;
        }
        if (block.type === 'code-block') {
          return <pre className="public-DraftStyleDefault-pre" />;
        }
        if (block.type === 'CENTERED_BLOCK') {
          return <div className="RichEditor-CENTERED_BLOCK" />;
        }
        if (block.type === 'JUSTIFY_BLOCK') {
          return <div className="RichEditor-JUSTIFY_BLOCK" />;
        }
        if (block.type === 'LEFT_BLOCK') {
          return <div className="RichEditor-LEFT_BLOCK" />;
        }
        if (block.type === 'RIGHT_BLOCK') {
          return <div className="RichEditor-RIGHT_BLOCK" />;
        }
      },
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return <a href={entity.data.url}>{originalText}</a>;
        }
        return originalText;
      },
    })(editorState.getCurrentContent());
    setHTMLTEXT(html);
    setOpenShowHTML(true);
  };

  return (
    <div className="RichEditor-root">
      <div className="RichEditor-controls">
        <BlockStyleControls
          editorState={editorState}
          onToggle={toggleBlockType}
        />
      </div>
      <div className="RichEditor-controls">
        <InlineStyleControls
          editorState={editorState}
          onToggle={toggleInlineStyle}
        />
        <AddLink
          key="link"
          active={editorState.getCurrentInlineStyle().has('LINK')}
          name="linkify"
          onToggle={(urlValue) => setLink(urlValue)}
        />
        <StyleButton
          key="unlink"
          active={false}
          name="unlink"
          onToggle={unLink}
          style="unlink"
        />
        <StyleButton
          key="html5"
          active={false}
          name="html5"
          onToggle={toHTML}
          style="html5"
        />
        <ShowHTML
          onClose={() => setOpenShowHTML(false)}
          HTMLTEXT={HTMLTEXT}
          open={openShowHTML}
        />
      </div>
      <div className="RichEditor-editor">
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          ref={editor}
          spellCheck
        />
      </div>
    </div>
  );
}
