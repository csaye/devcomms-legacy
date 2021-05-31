import React, { useState } from 'react';

import Chat from '../Chat/Chat.js';
import Header from '../Header/Header.js';
import Notes from '../Notes/Notes.js';
import Goals from '../Goals/Goals.js';
import Sketch from '../Sketch/Sketch.js';
import Todos from '../Todos/Todos.js';

import ListIcon from '@material-ui/icons/List';
import BrushIcon from '@material-ui/icons/Brush';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import DescriptionIcon from '@material-ui/icons/Description';

import './Page.css';

function Page(props) {
  const [widget, setWidget] = useState('');

  function getWidget() {
    switch (widget) {
      case 'notes': return <Notes groupId={props.groupId} />
      case 'goals': return <Goals groupId={props.groupId} />
      case 'sketch': return <Sketch groupId={props.groupId} />
      case 'todos': return <Todos groupId={props.groupId} />
      default: return <p>Select a widget above.</p>
    }
  }

  return (
    <div className="Page">
      <Header groupName={props.groupName} username={props.username} />
      <div className="page-content">
        <Chat groupId={props.groupId} username={props.username} />
        <div className="select-widget">
          <div className="widget-header">
            <button onClick={() => setWidget('todos')}><ListIcon /></button>
            <button onClick={() => setWidget('sketch')}><BrushIcon /></button>
            <button onClick={() => setWidget('goals')}><LibraryAddCheckIcon /></button>
            <button onClick={() => setWidget('notes')}><DescriptionIcon /></button>
          </div>
          <div className="widget">{getWidget()}</div>
        </div>
      </div>
    </div>
  );
}

export default Page;
