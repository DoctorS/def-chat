import React, {Component} from 'react';
import {withRouter, Redirect, Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import TextFieldGroup from '../common/TextFieldGroup';
import {authUser} from '../../actions/userActions';

class Auth extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errors: {}
        };
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) this.setState({errors: nextProps.errors});
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    onSubmit(e) {
        e.preventDefault();
        const user = {
            email: this.state.email,
            password: this.state.password,
        };
        this.props.authUser(user, this.props.history);
    }

    render() {
        const {errors} = this.state;
        if (this.props.username) return <Redirect to="/profile"/>
        return (
            <div>
                <h1>Log in</h1>
                <form noValidate onSubmit={this.onSubmit}>
                    <TextFieldGroup
                        placeholder="Email"
                        name="email"
                        type="email"
                        value={this.state.email}
                        onChange={this.onChange}
                        error={errors.email}
                    />
                    <TextFieldGroup
                        placeholder="Password"
                        name="password"
                        type="password"
                        value={this.state.password}
                        onChange={this.onChange}
                        error={errors.password}
                    />
                    <button typeof="submit">Send</button>
                </form>
                <div className="error">{errors.auth}</div>
            </div>
        );
    }
}

Auth.propTypes = {
    authUser: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    errors: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    username: state.user.username,
    errors: state.errors,
});

export default connect(mapStateToProps, {authUser})(withRouter(Auth));
