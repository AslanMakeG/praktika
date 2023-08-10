
import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CRecognition from './pages/CRecognition';
import Themes from './pages/Themes';

class App extends React.Component {

  render() {

    return (

      <BrowserRouter>

        <Routes>

          <Route path="cameraRecognition/:id" element={<CRecognition />} />
          <Route path="/" element={<Themes />} />


        </Routes>

      </BrowserRouter>

    )
  }
}


export default App;
