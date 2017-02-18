import React from 'react';
import { browserHistory } from 'react-router';

import NewGroup from './components/NewGroup';
import MyGroups from './components/MyGroups';
import ListUsers from './components/ListUsers';

export default class Groups extends React.Component {
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.auth.isLoggedIn) {
      browserHistory.push('/');
    }
  }

  render() {
    return (
      <div className="container groups-page">
        <NewGroup auth={this.props.auth} />

        <MyGroups auth={this.props.auth} />

        <ListUsers auth={this.props.auth} />
      </div>
    );
  }
}

Groups.propTypes = {
  auth: React.PropTypes.object,
};
