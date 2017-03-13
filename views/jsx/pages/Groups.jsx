import React from 'react';
import { browserHistory } from 'react-router';

import NewGroup from '../components/groups/NewGroup';
import MyGroups from '../components/groups/MyGroups';
import ListUsers from '../components/groups/ListUsers';
import { request } from '../utils';

/**
 * Page for managing groups
 */
export default class Groups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: [],
    };

    this.getGroups = this.getGroups.bind(this);
  }

  /**
   * Check if logged in, load groups
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getGroups();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Csoportok | ${this.props.route.title}`;
  }

  /**
   * Check if logged in
   */
  componentWillReceiveProps(nextProps) {
    if (!nextProps.auth.isLoggedIn) {
      browserHistory.push('/');
    }
  }

  /**
   * Get list of groups
   */
  getGroups() {
    // Send request to server
    request('/grouplist', {
      credentials: 'same-origin',
    })
      .then((json) => {
        // success
        this.setState({
          groups: json,
        });
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  render() {
    return (
      <div className="container inner-page">
        <h1> Csoportok </h1>

        <NewGroup auth={this.props.auth} getGroups={this.getGroups} />

        <MyGroups
          auth={this.props.auth}
          groups={this.state.groups}
          getGroups={this.getGroups}
          modal={this.props.modal}
        />

        <ListUsers auth={this.props.auth} groups={this.state.groups} getGroups={this.getGroups} />
      </div>
    );
  }
}

Groups.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
  modal: React.PropTypes.func,
};
