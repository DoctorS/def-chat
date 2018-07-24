import React, {Component} from 'react';
import {withRouter, Redirect, Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class Profile extends Component {
    render() {
        if (!this.props.username) return <Redirect to="/login"/>
        return (
            <div>
                <h1>Profile</h1>
                <p>Email: {this.props.username}</p>
            </div>
        );
    }
}

Profile.propTypes = {
    username: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    username: state.user.username
});

export default connect(mapStateToProps, {})(withRouter(Profile));
