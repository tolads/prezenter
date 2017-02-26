import React from 'react';
import { browserHistory } from 'react-router';

import { formatDate } from './utils';

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
   * Check if logged ins
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
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/me');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        this.setState({
          username: xhr.response.username,
          fullname: xhr.response.fullname,
          date: xhr.response.date,
          groups: xhr.response.groups,
          presentations: xhr.response.presentations,
        });
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send();
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
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/delete');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      console.log(xhr.status);
      this.props.auth.logout();
    });
    xhr.send();
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
