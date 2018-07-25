import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import TextFieldGroup from "../common/TextFieldGroup";
import { registerUser } from "../../actions/userActions";

class Register extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      password2: "",
      errors: {}
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) this.setState({ errors: nextProps.errors });
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    const newUser = {
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };
    this.props.registerUser(newUser, this.props.history);
  }

  render() {
    if (this.props.username) return <Redirect to="/login" />;
    const { errors } = this.state;
    return (
      <div>
        <h1>Sign up</h1>
        <form noValidate onSubmit={this.onSubmit}>
          <TextFieldGroup placeholder="Email" name="email" type="email" value={this.state.email} onChange={this.onChange} error={errors.email} />
          <TextFieldGroup placeholder="Password" name="password" type="password" value={this.state.password} onChange={this.onChange} error={errors.password} />
          <TextFieldGroup placeholder="Confirm Password" name="password2" type="password" value={this.state.password2} onChange={this.onChange} error={errors.password2} />
          <button typeof="submit">Send</button>
        </form>
        <div className="error">{errors.reg}</div>
      </div>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  username: PropTypes.string,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  username: state.user.username,
  errors: state.errors
});

export default connect(mapStateToProps, { registerUser })(withRouter(Register));
