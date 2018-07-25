import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";

class Home extends Component {
  // componentWillMount() {
  //     console.log(`1 componentWillMount`)
  //     if (this.props.username) this.props.history.push('/profile');
  // }

  render() {
    return (
      <div className="landing">
        <h1>Welcome to Site</h1>
        <p> Create a profile</p>
        {!this.props.username && (
          <p>
            <Link to="/register">Sign Up</Link> <Link to="/login">Login</Link>
          </p>
        )}
      </div>
    );
  }
}

Home.propTypes = {
  username: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  username: state.user.username
});

export default connect(mapStateToProps)(withRouter(Home));
