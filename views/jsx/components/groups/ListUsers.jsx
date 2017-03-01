import React from 'react';

import Checkbox from './Checkbox';
import { formatDate } from '../../utils';

/**
 * List all the users
 */
export default class ListUsers extends React.Component {
  constructor(props) {
    super(props);

    this.usersPerPage = 5;

    this.state = {
      addToGroup: 0,
      users: [],
      currentUserPage: 0,
      success: '',
    };
    this.selectedCheckboxes = new Set();

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentWillMount() {
    this.getUsers();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      addToGroup: nextProps.groups[0] && nextProps.groups[0].id,
    });
  }

  getUsers() {
    fetch('/users', {
      credentials: 'same-origin',
    })
      .then((response) => {
        if (response.status === 401) {
          this.props.auth.logout();
          return;
        }
        return response.json();
      }).then((response) => {
        this.setState({
          users: response,
        });
      });

    // create an AJAX request
    /*const xhr = new XMLHttpRequest();
    xhr.open('get', '/users');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        this.setState({
          users: xhr.response,
        });
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send();*/
  }

  toggleCheckbox(label) {
    if (this.selectedCheckboxes.has(label)) {
      this.selectedCheckboxes.delete(label);
    } else {
      this.selectedCheckboxes.add(label);
    }
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.selectedCheckboxes.size === 0) return;

    const addToGroup = encodeURIComponent(this.state.addToGroup);
    let formData = `addToGroup=${addToGroup}`;
    this.selectedCheckboxes.forEach((x) => { formData += `&userIDs=${x}`; });

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/groups/add');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        this.setState({
          success: xhr.response.success,
        });
        this.props.getGroups();
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send(formData);
  }

  render() {
    const firstID = this.state.currentUserPage * this.usersPerPage;
    const lastID = firstID + this.usersPerPage - 1;
    const userList = this.state.users.map((user, ind) => (
      <tr key={user.id} style={{ display: ind >= firstID && ind <= lastID ? 'table-row' : 'none' }}>
        <td><Checkbox label={user.id} handleCheckboxChange={this.toggleCheckbox} /></td>
        <td> {user.id} </td>
        <td> {user.username} </td>
        <td> {user.fullname} </td>
        <td> {formatDate(new Date(user.date))} </td>
      </tr>
    ));

    const pagination = [];
    for (let i = 0; i < this.state.users.length / this.usersPerPage; i++) {
      pagination.push(
        <li key={i}>
          <a
            href=""
            className={i === this.state.currentUserPage ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); this.setState({ currentUserPage: i }); }}
          >
            {i + 1}
          </a>
        </li>
      );
    }

    const groupList = this.props.groups.map(group => (
      <option key={group.id} value={group.id}>{group.name}</option>
    ));

    return (
      <div className="row">
        <div className="col-md-12">
          <h2 id="users"> Felhasználók </h2>
          <form onSubmit={this.handleSubmit}>
            <table className="table table-hover table-users">
              <thead>
                <tr>
                  <th> Hozzáadás </th>
                  <th> # </th>
                  <th> Felhasználónév </th>
                  <th> Teljes név </th>
                  <th> Regisztráció </th>
                </tr>
              </thead>
              <tbody>
                {userList}
              </tbody>
            </table>

            <nav aria-label="Lapozás felhasználók között">
              <ul className="pagination">
                {pagination}
              </ul>
            </nav>

            <div className="form-inline">
              <div className={this.state.success ? 'form-group has-success' : 'form-group'}>
                <label htmlFor="add-to-group-select"> Hozzáad csoporthoz: </label>
                <select
                  className="form-control"
                  id="add-to-group-select"
                  name="addToGroup"
                  value={this.state.addToGroup}
                  onChange={this.handleInputChange}
                >
                  {groupList}
                </select>
                <button type="submit" className="btn btn-success"> Hozzáad </button>
                {this.state.success &&
                  <span className="help-block">{this.state.success}</span>}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

ListUsers.propTypes = {
  auth: React.PropTypes.object.isRequired,
  groups: React.PropTypes.array.isRequired,
  getGroups: React.PropTypes.func.isRequired,
};
