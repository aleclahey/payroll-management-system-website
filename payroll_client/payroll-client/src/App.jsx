import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";

const App = () => {
  return (
    <Router>
      <div>
        {/* Main Content */}
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <h2 className="text-center mt-5 text-danger">
                404 - Page Not Found
              </h2>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
