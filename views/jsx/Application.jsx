import React from 'react';
import { browserHistory } from 'react-router';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Modal from './components/Modal';

/**
 * Root component for all pages
 */
export default class Application extends React.Component {
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
    this.callModal = this.callModal.bind(this);
  }

  /**
   * Check if still logged in
   */
  componentWillMount() {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/isloggedin');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        if (xhr.response.loggedin) {
          this.setState({
            username: xhr.response.loggedin,
          });
          this.handleLogin();
        } else {
          this.handleLogout();
        }
      } else {
        // failure
        this.handleLogout();
      }
    });
    xhr.send();
  }

  /**
   * Check if still logged in
   */
  isLoggedIn() {
    return !!localStorage.getItem('loggedin');
  }

  /**
   * Handle logging in
   * @param {String} username
   */
  handleLogin(username) {
    localStorage.setItem('loggedin', 'true');
    this.setState({
      username,
      loggedin: true,
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
      return;
    }

    const username = encodeURIComponent(data.username);
    const password = encodeURIComponent(data.password);
    const formData = `username=${username}&password=${password}`;

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/login');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        this.setState({
          username: xhr.response.loggedin,
        });
        this.handleLogin();
        browserHistory.push('/');
        window.scroll(0, 0);
      } else {
        // failure
        this.setState({ loginError: xhr.response.errors || {} });
        document.getElementById('login').scrollIntoView();
      }
    });
    xhr.send(formData);
  }

  /**
   * Set parameters for modal dialog
   * @param {Object} modalData
   *   {String} acceptText
   *   {Object} args
   *   {Function} handleSubmit
   *   {Boolean} hasInput
   *   {String} rejectText
   *   {String} title
   */
  callModal(modalData) {
    this.setState({
      modalData,
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
        <div className="screenreader">
          <ul>
            <li><a href="#navbar">Ugrás a navigációhoz</a></li>
            <li><a href="#main">Ugrás a tartalomhoz</a></li>
          </ul>
        </div>

        <Navbar auth={loginObj} username={this.state.username} />
        <div id="main">
          {React.cloneElement(this.props.children, { auth: loginObj, modal: this.callModal })}
        </div>
        <Footer />
        <Modal data={this.state.modalData} />
      </div>
    );
  }
}

Application.propTypes = {
  children: React.PropTypes.element.isRequired,
};
