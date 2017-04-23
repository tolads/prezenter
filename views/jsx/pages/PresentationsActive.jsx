import React from 'react';
import { browserHistory } from 'react-router';

import { request } from '../utils';

/**
 * Page for listing active presentations for current user
 */
export default class PresentationsActive extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      presentations: [],
    };

    this.getActivePresentations = this.getActivePresentations.bind(this);
  }

  /**
   * Check if logged in, load presentations
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getActivePresentations();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Futó prezentációk | ${this.props.route.title}`;
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
  getActivePresentations() {
    // Send request to server
    request('/presentations/listactive')
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
    const presentations = this.state.presentations.map(presentation => (
      <a
        key={`${presentation.pid}/${presentation.gid}`}
        href={`/presentations/play/${presentation.pid}/${presentation.gid}`}
        className="list-group-item"
      >
        <h4 className="list-group-item-heading">{presentation.name}</h4>
        <p className="list-group-item-text">
          <strong>{presentation.owner}</strong><br />{presentation.desc}
        </p>
      </a>
    ));

    return (
      <div className="container inner-page">
        <h1> Futó prezentációk </h1>

        {presentations.length === 0 ?
          <p> Nincs egy aktív prezentáció sem. </p> :
          (<div className="list-group"> {presentations} </div>)}
      </div>
    );
  }
}

PresentationsActive.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
};
