import React from 'react';
import { browserHistory } from 'react-router';

import { formatDate } from './utils';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      fullname: '',
      date: '',
    };

    this.getData = this.getData.bind(this);
  }

  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getData();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.auth.isLoggedIn) {
      browserHistory.push('/');
    }
  }

  getData() {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/me');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
console.log(1);
        this.setState({
          username: xhr.response.username,
          fullname: xhr.response.fullname,
          date: xhr.response.date,
        });
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send();
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1>Adataim</h1>
            <div>
              <div className="col-sm-3"> Felhasználónév </div>
              <div className="col-sm-9"> {this.state.username} </div>
            </div>
            <div>
              <div className="col-sm-3"> Teljes név </div>
              <div className="col-sm-9"> {this.state.fullname} </div>
            </div>
            <div>
              <div className="col-sm-3"> Regisztráció </div>
              <div className="col-sm-9"> {formatDate(new Date(this.state.date))} </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  auth: React.PropTypes.object,
};
