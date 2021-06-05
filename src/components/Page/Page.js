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
      case 'notes': return <Notes group={props.group} />
      case 'goals': return <Goals group={props.group} />
      case 'sketch': return <Sketch group={props.group} />
      case 'todos': return <Todos group={props.group} />
      default: return <p className="select-text">Select a widget above.</p>
    }
  }

  return (
    <div className="Page">
      <Header group={props.group} username={props.username} />
      <div className="page-content">
        <Chat group={props.group} username={props.username} />
        <div className="select-widget">
          <div className="widget-header">
            <button className={widget === 'todos' ? 'clean-btn selected' : 'clean-btn'} onClick={() => setWidget('todos')}><ListIcon /></button>
            <button className={widget === 'sketch' ? 'clean-btn selected' : 'clean-btn'} onClick={() => setWidget('sketch')}><BrushIcon /></button>
            <button className={widget === 'goals' ? 'clean-btn selected' : 'clean-btn'} onClick={() => setWidget('goals')}><LibraryAddCheckIcon /></button>
            <button className={widget === 'notes' ? 'clean-btn selected' : 'clean-btn'} onClick={() => setWidget('notes')}><DescriptionIcon /></button>
          </div>
          <div className="widget">{getWidget()}</div>
        </div>
      </div>
    </div>
  );
}

export default Page;
