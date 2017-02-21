import React from 'react';
import { browserHistory } from 'react-router';

import NewGroup from './components/groups/NewGroup';
import MyGroups from './components/groups/MyGroups';
import ListUsers from './components/groups/ListUsers';

export default class Groups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: [],
    };

    this.getGroups = this.getGroups.bind(this);
  }
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getGroups();
    }
  }

  componentDidMount() {
    document.title = `Csoportok | ${this.props.route.title}`;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.auth.isLoggedIn) {
      browserHistory.push('/');
    }
  }

  getGroups() {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/grouplist');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        this.setState({
          groups: xhr.response,
        });
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send();
  }

  render() {
    return (
      <div className="container inner-page">
        <h1> Csoportok </h1>

        <NewGroup auth={this.props.auth} getGroups={this.getGroups} />

        <MyGroups auth={this.props.auth} groups={this.state.groups} getGroups={this.getGroups} />

        <ListUsers auth={this.props.auth} groups={this.state.groups} getGroups={this.getGroups} />
      </div>
    );
  }
}

Groups.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
};
