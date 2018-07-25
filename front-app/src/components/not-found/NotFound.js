import React from "react";
import { Link } from "react-router-dom";

export default () => {
  return (
    <div className="not-found">
      <h1>Page Not Found</h1>
      <p>
        Sorry, this page does not exist -> <Link to="/">Home</Link>
      </p>
    </div>
  );
};
