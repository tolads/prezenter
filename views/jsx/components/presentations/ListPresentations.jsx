import React from 'react';
import { Link } from 'react-router';

import { formatDate, request } from '../../utils';

/**
 * List presentations
 */
export default class NewPresentation extends React.Component {
  constructor(props) {
    super(props);

    this.presentationsPerPage = 5;

    this.state = {
      success: '',
    };

    this.shouldDeletePresentation = this.shouldDeletePresentation.bind(this);
    this.deletePresentation = this.deletePresentation.bind(this);
    this.shouldPlayPresentation = this.shouldPlayPresentation.bind(this);
    this.playPresentation = this.playPresentation.bind(this);
  }

  shouldDeletePresentation(e) {
    const value = e.target.value || e.target.parentElement.value;
    const id = encodeURIComponent(value);
    this.props.modal({
      title: 'Biztosan törölni szeretnéd a prezentációt?',
      args: { id },
      handleSubmit: this.deletePresentation,
    });
    $('#modal').modal();
  }

  deletePresentation({ id }) {
    // Send request to server
    request(`/presentations/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        // success
        this.setState({
          success: 'Prezentáció törölve.',
        });
        this.props.getPresentations();
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  shouldPlayPresentation(e) {
    const value = e.target.value || e.target.parentElement.value;
    const id = encodeURIComponent(value);

    // Send request to server
    request('/groups/list')
      .then((json) => {
        // success
        const options = [
          { id: -1, name: 'Mindenki' },
          { id: -2, name: 'Csak én' },
          ...json.map(group => ({
            id: group.id,
            name: group.name,
          })),
        ];

        this.props.modal({
          title: 'Lejátszás hozzárendelése csoporthoz',
          desc: 'A prezentáció vezérlő módban indul számodra. Ha mégegy ablakban megnyitod, a második példány vetítő módban indul.',
          args: { id },
          handleSubmit: this.playPresentation,
          acceptText: 'Indít',
          hasInput: true,
          options,
        });
        $('#modal').modal();
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  playPresentation(args) {
    const presentationID = args.id;
    const groupID = args.input;

    if (!presentationID || !groupID) return;

    window.open(`/presentations/play/${presentationID}/${groupID}`, '_blank');
  }

  render() {
    const presentations = [];

    this.props.presentations.forEach((presentation) => {
      presentations.push((
        <tr key={`${presentation.id}_1`}>
          <td>{presentation.id}</td>
          <td>{presentation.name}</td>
          <td>{formatDate(new Date(presentation.date))}</td>
          <td>{formatDate(new Date(presentation.modified))}</td>
          <td>
            {presentation.canBePlayed &&
              <button
                className="btn btn-success"
                value={presentation.id}
                onClick={this.shouldPlayPresentation}
                title="Lejátszás"
              >
                <span className="glyphicon glyphicon-play" />
              </button>}
          </td>
          <td>
            {presentation.hasReports &&
              <Link
                to={`/presentations/report/${presentation.id}`}
                className="btn btn-info"
                title="Eredmények"
              >
                <span className="glyphicon glyphicon-th-list" />
              </Link>}
          </td>
          <td>
            <Link
              to={`/presentations/edit/${presentation.id}`}
              className="btn btn-warning"
              title="Szerkesztés"
            >
              <span className="glyphicon glyphicon-wrench" />
            </Link>
          </td>
          <td>
            <button
              className="btn btn-danger"
              value={presentation.id}
              onClick={this.shouldDeletePresentation}
              title="Törlés"
            >
              <span className="glyphicon glyphicon-remove" />
            </button>
          </td>
        </tr>
      ));
      if (presentation.desc) {
        presentations.push((
          <tr key={`${presentation.id}_2`}>
            <td colSpan="8" className="presentation-desc">{presentation.desc}</td>
          </tr>
        ));
      }
    });

    return (
      <section className="row">
        <div className="col-md-12">
          <h2 id="users"> Prezentációim </h2>
          {this.state.success &&
            <span className="has-success">
              <span className="help-block">{this.state.success}</span>
            </span>}
          {presentations.length === 0 ?
            <p> Egy prezentációd sincs. </p> :
            (<table className="table table-presentations">
              <thead>
                <tr>
                  <th> # </th>
                  <th> Név </th>
                  <th> Létrehozva </th>
                  <th> Utolsó módosítás </th>
                  <th> Lejátszás </th>
                  <th> Eredmények </th>
                  <th> Szerkesztés </th>
                  <th> Törlés </th>
                </tr>
              </thead>
              <tbody>
                {presentations}
              </tbody>
            </table>)}
        </div>
      </section>
    );
  }
}

NewPresentation.propTypes = {
  auth: React.PropTypes.object.isRequired,
  presentations: React.PropTypes.array.isRequired,
  getPresentations: React.PropTypes.func.isRequired,
  modal: React.PropTypes.func.isRequired,
};
