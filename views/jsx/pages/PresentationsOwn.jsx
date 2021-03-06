import React from 'react';
import { browserHistory } from 'react-router';

import NewPresentation from '../components/presentations/NewPresentation';
import ListPresentations from '../components/presentations/ListPresentations';
import { request } from '../utils';

/**
 * Page for managing presentations
 */
export default class PresentationsOwn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: [],
    };

    this.getPresentations = this.getPresentations.bind(this);
  }

  /**
   * Check if logged in, load presentations
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getPresentations();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Saját diasorok | ${this.props.route.title}`;
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
   * Get list of presentations
   */
  getPresentations() {
    // Send request to server
    request('/presentations/list')
      .then((json) => {
        // success
        this.setState({
          presentations: json,
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
        <h1> Saját diasorok </h1>

        <NewPresentation auth={this.props.auth} getPresentations={this.getPresentations} />

        <ListPresentations
          auth={this.props.auth}
          presentations={this.state.presentations}
          getPresentations={this.getPresentations}
          modal={this.props.modal}
        />
      </div>
    );
  }
}

PresentationsOwn.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
  modal: React.PropTypes.func,
};
