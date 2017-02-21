import React from 'react';
import { browserHistory } from 'react-router';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default class Application extends React.Component {
  constructor(props) {
    super(props);

    // check if still logged in
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

  isLoggedIn() {
    return !!localStorage.getItem('loggedin');
  }

  handleLogin(username) {
    if (username) {
      this.setState({
        username,
      });
    }
    localStorage.setItem('loggedin', 'true');
    this.setState({ loggedin: this.isLoggedIn() });
  }

  handleLogout() {
    localStorage.removeItem('loggedin');
    this.setState({ loggedin: this.isLoggedIn() });
  }

  loginSubmit(data) {
    this.setState({ loginError: '' });

    if (data.username === '' || data.password === '') {
      this.setState({ loginError: 'Felhasználónév és jelszó megadása kötelező.' });
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
        const errors = xhr.response.errors || {};

        this.setState({ loginError: errors });
        document.getElementById('login').scrollIntoView();
      }
    });
    xhr.send(formData);
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
        <Navbar auth={loginObj} username={this.state.username} />
        {React.cloneElement(this.props.children, { auth: loginObj })}
        <Footer />
      </div>
    );
  }
}

Application.propTypes = {
  children: React.PropTypes.element.isRequired,
};
