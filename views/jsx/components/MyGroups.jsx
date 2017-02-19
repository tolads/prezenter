import React from 'react';

import { formatDate } from '../utils';

export default class MyGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      success: '',
    };

    this.deleteGroup = this.deleteGroup.bind(this);
    this.deleteMember = this.deleteMember.bind(this);
  }

  deleteGroup(e) {
    const id = encodeURIComponent(e.target.value);

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/groups/delete/group/${id}`);
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
    xhr.send();
  }

  deleteMember(e) {
    const gid = encodeURIComponent(e.target.value.split('_')[0]);
    const uid = encodeURIComponent(e.target.value.split('_')[1]);

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/groups/delete/group/${gid}/member/${uid}`);
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
    xhr.send();
  }

  render() {
    const groups = [];
    this.props.groups.forEach((group) => {
      groups.push(
        <tr key={`${group.id}_1`}>
          <td>{group.name}</td>
          <td>
            <button className="btn btn-danger" value={group.id} onClick={this.deleteGroup}>
              Töröl
            </button>
          </td>
        </tr>
      );
      const userList = group.members.map(user => (
        <tr key={user.id}>
          <td> {user.id} </td>
          <td> {user.username} </td>
          <td> {user.fullname} </td>
          <td> {formatDate(new Date(user.date))} </td>
          <td>
            <button className="btn btn-danger" value={`${group.id}_${user.id}`} onClick={this.deleteMember}>
              Töröl
            </button>
          </td>
        </tr>
      ));
      groups.push(
        <tr key={`${group.id}_2`}>
          <td colSpan="2">
            <table className="table table-hover table-members">
              <thead>
                <tr>
                  <th> ID </th>
                  <th> Felhasználónév </th>
                  <th> Teljes név </th>
                  <th> Regisztráció </th>
                  <th> Törlés </th>
                </tr>
              </thead>
              <tbody>
                {userList}
              </tbody>
            </table>
          </td>
        </tr>
      );
    });

    return (
      <div className="row">
        <div className="col-md-12">
          <h2 id="groups"> Csoportjaim </h2>
          {this.state.success &&
            <span className="has-success">
              <span className="help-block">{this.state.success}</span>
            </span>}
          <table className="table groups-table">
            <thead>
              <tr>
                <th> Név </th>
                <th> Törlés </th>
              </tr>
            </thead>
            <tbody>
              {groups}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

MyGroups.propTypes = {
  auth: React.PropTypes.object.isRequired,
  groups: React.PropTypes.array.isRequired,
  getGroups: React.PropTypes.func.isRequired,
};
