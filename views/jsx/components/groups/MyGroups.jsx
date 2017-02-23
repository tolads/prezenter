import React from 'react';

import { formatDate } from '../../utils';

export default class MyGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      success: '',
    };

    this.shouldDeleteGroup = this.shouldDeleteGroup.bind(this);
    this.shouldDeleteMember = this.shouldDeleteMember.bind(this);
    this.shouldRenameGroup = this.shouldRenameGroup.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.deleteMember = this.deleteMember.bind(this);
    this.renameGroup = this.renameGroup.bind(this);
  }

  shouldDeleteGroup(e) {
    const value = e.target.value || e.target.parentElement.value;
    const id = encodeURIComponent(value);
    this.props.modal({
      title: 'Biztosan törölni szeretnéd a csoportot?',
      args: { id },
      handleSubmit: this.deleteGroup,
    });
    $('#modal').modal();
  }

  deleteGroup(args) {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/groups/delete/group/${args.id}`);
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

  shouldDeleteMember(e) {
    const value = e.target.value || e.target.parentElement.value;
    const gid = encodeURIComponent(value.split('_')[0]);
    const uid = encodeURIComponent(value.split('_')[1]);
    this.props.modal({
      title: 'Biztosan törölni szeretnéd a tagot?',
      args: { gid, uid },
      handleSubmit: this.deleteMember,
    });
    $('#modal').modal();
  }

  deleteMember(args) {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/groups/delete/group/${args.gid}/member/${args.uid}`);
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

  shouldRenameGroup(e) {
    const value = e.target.value || e.target.parentElement.value;
    const id = encodeURIComponent(value);
    this.props.modal({
      title: 'Csoport új neve',
      hasInput: true,
      acceptText: 'Átnevez',
      args: { id },
      handleSubmit: this.renameGroup,
    });
    $('#modal').modal();
  }

  renameGroup(args) {
    const newName = encodeURIComponent(args.input);

    if (!newName) return;

    const formData = `id=${args.id}&name=${newName}`;

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/groups/rename');
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
    const groups = [];
    this.props.groups.forEach((group) => {
      groups.push(
        <tr key={`${group.id}_1`}>
          <td>{group.name}</td>
          <td>
            <button
              className="btn btn-warning"
              value={group.id}
              onClick={this.shouldRenameGroup}
              title="Átnevezés"
            >
              <span className="glyphicon glyphicon-wrench" />
            </button>
          </td>
          <td>
            <button
              className="btn btn-danger"
              value={group.id}
              onClick={this.shouldDeleteGroup}
              title="Törlés"
            >
              <span className="glyphicon glyphicon-remove" />
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
            <button
              className="btn btn-danger"
              value={`${group.id}_${user.id}`}
              onClick={this.shouldDeleteMember}
              title="Törlés"
            >
              <span className="glyphicon glyphicon-remove" />
            </button>
          </td>
        </tr>
      ));
      groups.push(
        <tr key={`${group.id}_2`}>
          <td colSpan="3">
            <table className="table table-hover table-members">
              <thead>
                <tr>
                  <th> # </th>
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
                <th> Átnevezés </th>
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
  modal: React.PropTypes.func.isRequired,
};
