import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Lab, Profile } from "./Pages";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lab" element={<Lab />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
