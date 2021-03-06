import React from 'react';

import { request } from '../../utils';

/**
 * Form for creating a new group
 */
export default class NewGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newGroupName: '',
      error: '',
      success: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({
      error: '',
      success: '',
    });

    const newGroupName = this.state.newGroupName.trim();

    if (newGroupName === '') {
      this.setState({
        error: 'Csoportnév megadása kötelező.',
      });
      return;
    }

    if (newGroupName.length > 127) {
      this.setState({
        error: 'A csoportnév nem lehet hosszabb 127 karakternél.',
      });
      return;
    }

    const data = new FormData();
    data.append('newGroupName', newGroupName);

    // Send request to server
    request('/groups/new', {
      method: 'POST',
      body: data,
    })
      .then(() => {
        // success
        this.setState({
          success: 'Csoport sikeresen létrehozva.',
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
    return (
      <section className="row">
        <div className="col-md-12">
          <h2 id="new"> Új csoport létrehozása </h2>
          <form
            className={`form-inline ${this.state.error ? 'has-error' : ''} ${this.state.success ? 'has-success' : ''}`}
            onSubmit={this.handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="newGroupName"> Csoport neve: </label>
              <input
                type="text"
                className="form-control"
                id="newGroupName"
                name="newGroupName"
                value={this.state.username}
                onChange={this.handleInputChange}
              />
              <button type="submit" className="btn btn-success"> Létrehoz </button>
            </div>
            {this.state.error &&
              <span className="help-block">{this.state.error}</span>}
            {this.state.success &&
              <span className="help-block">{this.state.success}</span>}
          </form>
        </div>
      </section>
    );
  }
}

NewGroup.propTypes = {
  auth: React.PropTypes.object.isRequired,
  getGroups: React.PropTypes.func.isRequired,
};
