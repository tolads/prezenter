import React from 'react';
import { browserHistory } from 'react-router';

import { request } from './utils';

/**
 * Component for managing authentication
 */
export default class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: undefined,
      loggedin: this.isLoggedIn(),
      loginError: '',
    };

    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.loginSubmit = this.loginSubmit.bind(this);
  }

  /**
   * Check if still logged in
   */
  componentWillMount() {
    // Send request to server
    request('/users/isloggedin')
      .then((json) => {
        // success
        if (json.loggedin) {
          this.handleLogin(json.loggedin);
        } else {
          this.handleLogout();
        }
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.handleLogout();
        }
      });
  }

  /**
   * Check if logged in
   */
  isLoggedIn() {
    return !!localStorage.getItem('loggedin');
  }

  /**
   * Handle logging in
   */
  handleLogin(username) {
    localStorage.setItem('loggedin', 'true');
    this.setState({
      loggedin: true,
      username,
    });
  }

  /**
   * Handle logging out
   */
  handleLogout() {
    localStorage.removeItem('loggedin');
    this.setState({
      loggedin: false,
    });
  }

  /**
   * Function called by login forms
   * @param {Object} data
   *   {String} username
   *   {String} password
   */
  loginSubmit(data) {
    this.setState({
      loginError: '',
    });

    if (data.username === '' || data.password === '') {
      this.setState({
        loginError: 'Felhasználónév és jelszó megadása kötelező.',
      });
      document.getElementById('login').scrollIntoView();
      return;
    }

    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    // Send request to server
    request('/users/login', {
      method: 'POST',
      body: formData,
    })
      .then((json) => {
        // success
        this.handleLogin(json.loggedin);
        browserHistory.push('/');
        window.scroll(0, 0);
      })
      .catch(({ json }) => {
        // error
        this.setState({
          loginError: json.errors || {},
        });
        document.getElementById('login').scrollIntoView();
      });
  }

  render() {
    const loginObj = {
      isLoggedIn: this.state.loggedin,
      login: this.handleLogin,
      logout: this.handleLogout,
      loginSubmit: this.loginSubmit,
      loginError: this.state.loginError,
    };

    return (
      <div>
        {React.cloneElement(this.props.children, { auth: loginObj, username: this.state.username })}
      </div>
    );
  }
}

Auth.propTypes = {
  children: React.PropTypes.element.isRequired,
};
