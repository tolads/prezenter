import React from 'react';
import { browserHistory } from 'react-router';

import { formatDate, request } from '../utils';

/**
 * Page for managing presentations
 */
export default class PresentationsReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      reports: [],
    };

    this.getReports = this.getReports.bind(this);
  }

  /**
   * Check if logged in, load reports
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getReports();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Prezentáció eredményei | ${this.props.route.title}`;
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
  getReports() {
    // Send request to server
    request(`/presentations/get/${this.props.params.id}`, {
      credentials: 'same-origin',
    })
      .then((json) => {
        // success
        this.setState({
          name: json.name,
          reports: json.reports,
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
    const starts = new Set();
    this.state.reports.forEach(({ start }) => starts.add(start));

    const reports = [];
    starts.forEach((start) => {
      const messageBoardReports = this.state.reports
        .filter(report => report.app === 'messageBoard' && report.start === start)
        .sort((a, b) => a.slide - b.slide)
        .map(({ id, slide, content }) => <li key={id}><b> #{slide + 1} dia: </b> {content.message} </li>);

      const formReports = this.state.reports
        .filter(report => report.app === 'Form' && report.start === start)
        .sort((a, b) => a.slide - b.slide)
        .map(({ id, slide, content }) => <li key={id}><b> #{slide + 1} dia: </b> {JSON.stringify(content)} </li>);

      reports.push((
        <div key={start}>
          <h3> Prezentáció kezdete: {formatDate(new Date(start))} </h3>
          {!!messageBoardReports.length &&
            <div>
              <h4> Üzenőfal </h4>
              {messageBoardReports}
            </div>
          }

          {!!formReports.length &&
            <div>
              <h4> Űrlap </h4>
              {formReports}
            </div>
          }
        </div>
      ));
    });

    return (
      <div className="container inner-page">
        <h1> Prezentáció eredményei </h1>
        <h2> {this.state.name} </h2>
        {reports}
      </div>
    );
  }
}

PresentationsReport.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
  params: React.PropTypes.object,
};
