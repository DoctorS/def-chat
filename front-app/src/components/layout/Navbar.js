import React, { Component } from "react";
import { withRouter, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setCurrentUser } from "../../actions/userActions";
import { clearErrors } from "../../actions/errorActions";
import axios from "axios";

class Navbar extends Component {
  onLogoutClick(e) {
    e.preventDefault();
    axios
      .post("/logout")
      .then(() => {
        this.props.setCurrentUser({ username: "" });
      })
      .catch(console.log);
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      this.props.clearErrors();
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentDidMount() {
    axios
      .post("/is-auth")
      .then(r => {
        this.props.setCurrentUser({ username: r.data.username ? r.data.username : "" });
      })
      .catch(e => {
        if (localStorage) localStorage.username = "";
        this.props.setCurrentUser({ username: "" });
        console.log(e);
      });
  }

  render() {
    return (
      <nav className="top-menu">
        <ul>
          <li>
            <NavLink exact to="/">
              Home
            </NavLink>
          </li>
          {this.props.username && (
            <li>
              <NavLink to="/agencies">Agencies</NavLink>
            </li>
          )}
          {this.props.username && (
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
          )}
          {this.props.username && (
            <li>
              <NavLink to="/logout" onClick={e => this.onLogoutClick(e)}>
                Logout
              </NavLink>
            </li>
          )}
          {!this.props.username && (
            <li>
              <NavLink to="/register">Sign Up</NavLink>
            </li>
          )}
          {!this.props.username && (
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
          )}
        </ul>
      </nav>
    );
  }
}

Navbar.propTypes = {
  username: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  username: state.user.username
});

export default connect(mapStateToProps, { setCurrentUser, clearErrors })(withRouter(Navbar));
