import React from 'react';
import { Link } from 'react-router';

import { request } from '../utils';

/**
 * Navigation bar
 */
export default class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleLogout(e) {
    e.preventDefault();

    // Send request to server
    request('/users/logout', {
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

  handleLogin(e) {
    e.preventDefault();

    this.props.auth.loginSubmit({
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {
    let navbarContent;

    if (!this.props.auth.isLoggedIn) {
      // login form
      navbarContent = (
        <form
          className="navbar-form navbar-right"
          onSubmit={this.handleLogin}
        >
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Felhasználónév"
              name="username"
              value={this.state.username}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Jelszó"
              name="password"
              value={this.state.password}
              onChange={this.handleInputChange}
            />
          </div>
          <button className="btn btn-success"> Bejelentkezés </button>
        </form>
      );
    } else {
      // menu
      navbarContent = [
        (<ul key="0" className="nav navbar-nav">
          <li><Link to="/" activeClassName="active"> Kezdőlap </Link></li>
          <li><Link to="/groups" activeClassName="active"> Csoportok </Link></li>
          <li className="dropdown">
            <a
              href="#"
              className="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Prezentációk <span className="caret" />
            </a>
            <ul className="dropdown-menu">
              <li>
                <Link to="/presentations/active" activeClassName="active">
                  Becsatlakozás vetítésbe
                </Link>
              </li>
              <li>
                <Link to="/presentations/own" activeClassName="active"> Saját diasorok </Link>
              </li>
            </ul>
          </li>
        </ul>),
        (<ul key="1" className="nav navbar-nav navbar-right">
          <li className="dropdown">
            <a
              href="#"
              className="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span className="glyphicon glyphicon-user" />
              Bejelentkezve, mint <b>{this.props.username}</b>
              <span className="caret" />
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/profile" activeClassName="active"> Adataim </Link></li>
              <li><a href="" onClick={this.handleLogout}> Kijelentkezés </a></li>
            </ul>
          </li>
        </ul>),
      ];
    }

    return (
      <nav className="navbar navbar-inverse navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle collapsed"
              data-toggle="collapse"
              data-target="#navbar"
              aria-expanded="false"
              aria-controls="navbar"
            >
              <span className="sr-only"> Navigáció megjelenítése </span>
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
            <Link to="/" className="navbar-brand" title="online prezentációs alkalmazás">
              <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDQ4NS4yMTMgNDg1LjIxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg1LjIxMyA0ODUuMjEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI0Mi42MDcsMEMxMDguNjI5LDAsMC4wMDEsMTA4LjYxNCwwLjAwMSwyNDIuNjA2YzAsMTMzLjk3NiwxMDguNjI4LDI0Mi42MDYsMjQyLjYwNiwyNDIuNjA2ICAgYzEzMy45NzgsMCwyNDIuNjA0LTEwOC42MzEsMjQyLjYwNC0yNDIuNjA2QzQ4NS4yMTIsMTA4LjYxNCwzNzYuNTg1LDAsMjQyLjYwNywweiBNMzY0LjMyNSwxMTkuODM5ICAgYzIxLjczOC0xMi41NzEsNDkuNTc4LTUuMTI1LDYyLjEzMywxNi42MjhjMTIuNTU0LDIxLjczNyw1LjA5Niw0OS41NzYtMTYuNjcxLDYyLjE0NWMtMjEuNzM5LDEyLjU2LTQ5LjU4Myw1LjA5Ny02Mi4xMzgtMTYuNjQgICBDMzM1LjEyOCwxNjAuMjE4LDM0Mi41NTgsMTMyLjM4MSwzNjQuMzI1LDExOS44Mzl6IE0yNDIuNjA3LDMwLjMyN2MyNS4xMTMsMCw0NS40OSwyMC4zNzYsNDUuNDksNDUuNDkgICBjMCwyNS4xMTQtMjAuMzc3LDQ1LjQ4OC00NS40OSw0NS40ODhjLTI1LjExNCwwLTQ1LjQ5LTIwLjM3NC00NS40OS00NS40ODhDMTk3LjExNyw1MC43MDMsMjE3LjQ5NCwzMC4zMjcsMjQyLjYwNywzMC4zMjd6ICAgIE0xMjAuODksMzY1LjM5Yy0yMS43MzcsMTIuNTU1LTQ5LjU3Niw1LjA5Mi02Mi4xMzMtMTYuNjQzYy0xMi41NTctMjEuNzM5LTUuMDkyLTQ5LjU3NCwxNi42NzMtNjIuMTMzICAgYzIxLjc3LTEyLjU2LDQ5LjU3OS01LjEyLDYyLjEzMywxNi42NDNDMTUwLjExNywzMjQuOTkyLDE0Mi42NTcsMzUyLjgzNSwxMjAuODksMzY1LjM5eiBNMTM3LjU2MywxODEuOTU1ICAgYy0xMi41NTksMjEuNzUzLTQwLjM5NiwyOS4yLTYyLjE2MSwxNi42NDVjLTIxLjczNy0xMi41NTctMjkuMjAyLTQwLjM4Mi0xNi42NDYtNjIuMTMzYzEyLjU1Ny0yMS43NTMsNDAuMzk2LTI5LjE5OSw2Mi4xMzMtMTYuNjQ1ICAgQzE0Mi42NTcsMTMyLjM4MSwxNTAuMTE3LDE2MC4yMDIsMTM3LjU2MywxODEuOTU1eiBNMjQyLjYwNyw0NTQuODg2Yy0yNS4xMTQsMC00NS40OS0yMC4zNzItNDUuNDktNDUuNDkgICBjMC0yNS4xMDgsMjAuMzc2LTQ1LjQ5LDQ1LjQ5LTQ1LjQ5YzI1LjExMywwLDQ1LjQ5LDIwLjM4Miw0NS40OSw0NS40OUMyODguMDk4LDQzNC41MTQsMjY3LjcyMSw0NTQuODg2LDI0Mi42MDcsNDU0Ljg4NnogICAgTTI0Mi42MDcsMzAzLjI1N2MtMzMuNDk2LDAtNjAuNjUxLTI3LjE1My02MC42NTEtNjAuNjUxYzAtMzMuNDkzLDI3LjE1Ni02MC42NTEsNjAuNjUxLTYwLjY1MSAgIGMzMy40OTUsMCw2MC42NDgsMjcuMTU4LDYwLjY0OCw2MC42NTFDMzAzLjI1NiwyNzYuMTA0LDI3Ni4xMDMsMzAzLjI1NywyNDIuNjA3LDMwMy4yNTd6IE00MjYuNDU4LDM0OC43NDggICBjLTEyLjU1NSwyMS43MzQtNDAuMzk1LDI5LjE5Ny02Mi4xNjEsMTYuNjQzYy0yMS43MzktMTIuNTU1LTI5LjIwMi00MC4zOTgtMTYuNjQ3LTYyLjEzMyAgIGMxMi41NTUtMjEuNzM5LDQwLjM5OC0yOS4yMDIsNjIuMTM4LTE2LjY0M0M0MzEuNTU0LDI5OS4xNzMsNDM5LjAxMiwzMjcuMDA4LDQyNi40NTgsMzQ4Ljc0OHoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" alt="Prezenter - online prezentációs alkalmazás" />
              Prezenter
            </Link>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            {navbarContent}
          </div>
        </div>
      </nav>
    );
  }
}

Navbar.propTypes = {
  auth: React.PropTypes.object.isRequired,
  username: React.PropTypes.string,
};
