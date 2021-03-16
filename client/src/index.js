import React from 'react';
import ReactDOM from 'react-dom';
import './css/normalize.css';
import './css/application.css';
import './css/client.css';
import './css/justgrid.css';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import VuDLPrep from './VuDLPrep';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <VuDLPrep url="http://localhost:9000/api" logoutUrl="" token=""/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
