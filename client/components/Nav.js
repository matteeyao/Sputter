import React, { Component } from "react";
import { Link } from "react-router-dom";

const linkStyle = {
  textDecoration: "none",
  color: "#000"
};

const titleStyle = {
  fontSize: "20px",
  fontWeight: "bold"
};

class Nav extends Component {
  render() {
    return (
      <div>
        <Link to="/" style={linkStyle}>
          <h1 style={titleStyle}>Greek Gods Browser</h1>
        </Link>
      </div>
    );
  }
}

export default Nav;
