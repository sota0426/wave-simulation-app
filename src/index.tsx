import React from 'react';
import ReactDOM from 'react-dom/client';
import "./app/globals.css";
import './index.css';
// {{ edit_1 }}
import Page from './app/page'; // ファイル名を確認してください
// {{ edit_2 }}
import reportWebVitals from './reportWebVitals.js';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBM04DHJP4cttqBxjoyM_kSMwn7mrBUCF0",
  authDomain: "physics-wave-app.firebaseapp.com",
  projectId: "physics-wave-app",
  storageBucket: "physics-wave-app.appspot.com",
  messagingSenderId: "259449018912",
  appId: "1:259449018912:web:b06e54a7a5514ea0543a45",
  measurementId: "G-H8FFGGYMS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();