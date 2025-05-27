// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.css'; // Optional, only if you have styles

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);

// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import SalesByDate from "./SalesByDate";
// import "./index.css";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<App />} />
//       <Route path="/sales" element={<SalesByDate />} />
//     </Routes>
//   </BrowserRouter>
// );


import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";               // Dashboard/home page
import SalesByDate from "./SalesByDate"; // Sales records page
import "./index.css";                  // Optional CSS

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/sales" element={<SalesByDate />} />
    </Routes>
  </BrowserRouter>
);
