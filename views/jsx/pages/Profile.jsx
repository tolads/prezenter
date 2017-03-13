import React from 'react';
import { browserHistory } from 'react-router';

import { formatDate, request } from '../utils';

/**
 * Profile page
 */
export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      fullname: '',
      date: '',
      groups: '',
      presentations: '',
    };

    this.getData = this.getData.bind(this);
    this.shouldDeleteProfile = this.shouldDeleteProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
  }

  /**
   * Check if logged in, load users data
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getData();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Adataim | ${this.props.route.title}`;
  }

  /**
   * Check if logged in
   */
  componentWillReceiveProps(nextProps) {
    if (!nextProps.auth.isLoggedIn) {
      browserHistory.push('/');
    }
  }


  /**
   * Get users data
   */
  getData() {
    // Send request to server
    request('/me', {
      credentials: 'same-origin',
    })
      .then((json) => {
        // success
        this.setState({
          username: json.username,
          fullname: json.fullname,
          date: json.date,
          groups: json.groups,
          presentations: json.presentations,
        });
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  /**
   * Open dialog for profile deletion
   */
  shouldDeleteProfile() {
    this.props.modal({
      title: 'Biztosan törölni szeretnéd a profilodat?',
      handleSubmit: this.deleteProfile,
    });
    $('#modal').modal();
  }

  /**
   * Delete users profile
   */
  deleteProfile() {
    // Send request to server
    request('/delete', {
      credentials: 'same-origin',
    })
      .then(() => {
        // success
        this.props.auth.logout();
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  render() {
    return (
      <div className="container profile">
        <div className="row">
          <div className="col-md-12">
            <h1> Adataim </h1>
            <div>
              <div className="col-sm-2"> Felhasználónév </div>
              <div className="col-sm-10"> {this.state.username} </div>
            </div>
            <div>
              <div className="col-sm-2"> Teljes név </div>
              <div className="col-sm-10"> {this.state.fullname} </div>
            </div>
            <div>
              <div className="col-sm-2"> Regisztráció </div>
              <div className="col-sm-10"> {formatDate(new Date(this.state.date))} </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h2> Statisztika </h2>
            <div>
              <div className="col-sm-2"> Csoportjaim </div>
              <div className="col-sm-10"> {this.state.groups} db </div>
            </div>
            <div>
              <div className="col-sm-2"> Prezentációm </div>
              <div className="col-sm-10"> {this.state.presentations} db </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 delete-btn">
            <button className="btn btn-danger" onClick={this.shouldDeleteProfile}>
              Profil törlése
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
  modal: React.PropTypes.func,
};
