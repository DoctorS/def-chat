import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import agencies from "../../agencies.json";
import "./agencies.css";

const getList = list =>
  list
    .replace(/,\s/g, "\n")
    .split(/\n/)
    .map((e, i) => <p key={i}>{e}</p>);

class Agencies extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agencies
    };
  }

  render() {
    if (!this.props.username) return <Redirect to="/login" />;
    return (
      <div>
        <h1>Agencies</h1>
        <div className="agencies">
          {this.state.agencies.map(e => (
            <div key={e.id} className="agency">
              <div className="name">{e.name}</div>
              <div className="site">
                <a href={"http://" + e.site.replace(/^https?:\/\//, "")} target="_blank">
                  {e.site
                    .replace(/^https?:\/\//, "")
                    .replace(/\/$/, "")
                    .replace(/^www\./, "")}
                </a>
              </div>
              <div>{getList(e.phone)}</div>
              <div>{getList(e.email)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});

Agencies.propTypes = {
  username: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(Agencies);
