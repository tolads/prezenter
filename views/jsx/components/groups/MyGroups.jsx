import React from 'react';

import { formatDate, request } from '../../utils';

/**
 * List groups of current user
 */
export default class MyGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      success: '',
      error: '',
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

  deleteGroup({ id }) {
    // Send request to server
    request(`/groups/group/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        // success
        this.setState({
          success: 'Csoport törölve.',
          error: '',
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

  deleteMember({ gid, uid }) {
    // Send request to server
    request(`/groups/group/${gid}/member/${uid}`, {
      method: 'DELETE',
    })
      .then(() => {
        // success
        this.setState({
          success: 'Tag törölve.',
          error: '',
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

  renameGroup({ id, input }) {
    if (!input) return;

    const data = new FormData();
    data.append('id', id);
    data.append('name', input);

    // Send request to server
    request('/groups/rename', {
      method: 'POST',
      body: data,
    })
      .then(() => {
        // success
        this.setState({
          success: 'Csoport sikeresen átnevezve.',
          error: '',
        });
        this.props.getGroups();
      })
      .catch(({ status, json }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        } else if (status === 400) {
          this.setState({
            error: json.errors || '',
            success: '',
          });
        }
      });
  }

  render() {
    const groups = [];
    this.props.groups.forEach((group) => {
      groups.push((
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
      ));
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
      groups.push((
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
      ));
    });

    return (
      <section className="row">
        <div className="col-md-12">
          <h2 id="groups"> Csoportjaim </h2>
          {this.state.error &&
            <span className="has-error">
              <span className="help-block">{this.state.error}</span>
            </span>}
          {this.state.success &&
            <span className="has-success">
              <span className="help-block">{this.state.success}</span>
            </span>}
          {groups.length === 0 ?
            <p> Egy csoportod sincs. </p> :
            (<table className="table groups-table">
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
            </table>)}
        </div>
      </section>
    );
  }
}

MyGroups.propTypes = {
  auth: React.PropTypes.object.isRequired,
  groups: React.PropTypes.array.isRequired,
  getGroups: React.PropTypes.func.isRequired,
  modal: React.PropTypes.func.isRequired,
};
