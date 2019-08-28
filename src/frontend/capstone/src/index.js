import React from 'react';
import ReactDOM from 'react-dom'; 
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/materialize-css/dist/css/materialize.min.css';
import 'antd/dist/antd.css';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware }  from 'redux';
import reducers from './reducers';
import reduxThunk from 'redux-thunk';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
