import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Booking } from './pages/Booking';
import { Confirmation } from './pages/Confirmation';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;