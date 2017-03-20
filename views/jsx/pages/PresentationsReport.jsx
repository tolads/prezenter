import React from 'react';
import { browserHistory, Link } from 'react-router';

import { formatDate, request } from '../utils';

/**
 * Page for managing presentations
 */
export default class PresentationsReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      users: [],
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
          users: json.users,
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
        .filter(report => report.app === 'messageboard' && report.start === start)
        .sort((a, b) => a.slide - b.slide)
        .map(({ id, slide, content }) => <li key={id}><b> {slide + 1}. dia: </b> {content.message} </li>);

      const formReports = this.state.reports
        .filter(report => report.app === 'form' && report.start === start)
        .sort((a, b) => a.slide - b.slide)
        .map(({ id, slide, content }) => {
          const rows = content.inputs.map((row, ind) => (
            <tr key={ind}>
              <td> <b>Kérdés:</b> {row.question} </td>
              <td> <b>Válasz:</b> {row.answer} </td>
            </tr>
          ));

          const user = this.state.users.find(({ id }) => id === content.user);

          return (
            <table key={id} className="table">
              <tbody>
                <tr>
                  <td> Dia </td>
                  <td> {slide + 1} </td>
                </tr>
                <tr>
                  <td> Felhasználó </td>
                  <td> {user ? `${user.fullname} (${user.username})` : '<i>törölt felhasználó</i>'} </td>
                </tr>
                {rows}
              </tbody>
            </table>
          );
        });

      reports.push((
        <div key={start}>
          <h3> Prezentáció kezdete: {formatDate(new Date(parseInt(start, 10)))} </h3>
          {!!messageBoardReports.length &&
            <div>
              <h4> Üzenőfal </h4>
              <ul> {messageBoardReports} </ul>
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
      <div className="container inner-page report-page">
        <h1>
          <small><Link to="/presentations/own"> Saját diasorok </Link> / </small>
          Prezentáció eredményei
        </h1>
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
