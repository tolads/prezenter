import React from 'react';

import { formatDate } from '../../utils';

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

  deletePresentation(args) {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/presentations/delete/${args.id}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        this.setState({
          success: xhr.response.success,
        });
        this.props.getPresentations();
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send();
  }

  render() {
    const presentations = [];

    this.props.presentations.forEach((presentation) => {
      presentations.push(
        <tr key={`${presentation.id}_1`}>
          <td>{presentation.id}</td>
          <td>{presentation.name}</td>
          <td>{formatDate(new Date(presentation.date))}</td>
          <td>{formatDate(new Date(presentation.modified))}</td>
          <td>
            <button className="btn btn-success" value={presentation.id} title="Lejátszás">
              <span className="glyphicon glyphicon-play" />
            </button>
          </td>
          <td>
            <button className="btn btn-warning" value={presentation.id} title="Szerkesztés">
              <span className="glyphicon glyphicon-wrench" />
            </button>
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
      );
      if (presentation.desc) {
        presentations.push(
          <tr key={`${presentation.id}_2`}>
            <td colSpan="7" className="presentation-desc">{presentation.desc}</td>
          </tr>
        );
      }
    });

    return (
      <div className="row">
        <div className="col-md-12">
          <h2 id="users"> Prezentációim </h2>
          {this.state.success &&
            <span className="has-success">
              <span className="help-block">{this.state.success}</span>
            </span>}
          <table className="table table-presentations">
            <thead>
              <tr>
                <th> # </th>
                <th> Név </th>
                <th> Létrehozva </th>
                <th> Utolsó módosítás </th>
                <th> Lejátszás </th>
                <th> Szerkesztés </th>
                <th> Törlés </th>
              </tr>
            </thead>
            <tbody>
              {presentations}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

NewPresentation.propTypes = {
  auth: React.PropTypes.object.isRequired,
  presentations: React.PropTypes.array.isRequired,
  getPresentations: React.PropTypes.func.isRequired,
  modal: React.PropTypes.func.isRequired,
};
