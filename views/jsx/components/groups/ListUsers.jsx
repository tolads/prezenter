import React from 'react';

import Checkbox from './Checkbox';
import { formatDate, request } from '../../utils';

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
    if (nextProps.groups[0] && nextProps.groups[0].id) {
      this.setState({
        addToGroup: nextProps.groups[0].id,
      });
    }
  }

  /**
   * Get user list from the server
   */
  getUsers() {
    // Send request to server
    request('/users/list')
      .then((json) => {
        // success
        this.setState({
          users: json,
        });
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
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

    const data = new FormData();
    data.append('addToGroup', this.state.addToGroup);
    this.selectedCheckboxes.forEach((x) => { data.append('userIDs[]', x); });

    // Send request to server
    request('/groups/add', {
      method: 'POST',
      body: data,
    })
      .then(() => {
        // success
        this.setState({
          success: 'Sikeres hozzáadás a csoporthoz.',
        });
        this.props.getGroups();
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
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
      pagination.push((
        <li key={i}>
          <a
            href=""
            className={i === this.state.currentUserPage ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); this.setState({ currentUserPage: i }); }}
          >
            {i + 1}
          </a>
        </li>
      ));
    }

    const groupList = this.props.groups.map(group => (
      <option key={group.id} value={group.id}>{group.name}</option>
    ));

    return (
      <section className="row">
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
      </section>
    );
  }
}

ListUsers.propTypes = {
  auth: React.PropTypes.object.isRequired,
  groups: React.PropTypes.array.isRequired,
  getGroups: React.PropTypes.func.isRequired,
};
