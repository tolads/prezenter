import React from 'react';

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

    if (this.state.newGroupName === '') {
      this.setState({
        error: 'Csoportnév megadása kötelező.',
      });
      return;
    }

    const newGroupName = encodeURIComponent(this.state.newGroupName);
    const formData = `newGroupName=${newGroupName}`;

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/groups/new');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        this.setState({
          success: 'Csoport sikeresen létrehozva.',
        });
        this.props.getGroups();
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      } else {
        // failure

        const errors = xhr.response.errors || {};

        this.setState({
          error: errors || '',
        });
      }
    });
    xhr.send(formData);
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <h2 id="new"> Új csoport létrehozása </h2>
          <form
            className={this.state.error ? 'form-inline has-error' : this.state.success ? 'form-inline has-success' : 'form-inline'}
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
      </div>
    );
  }
}

NewGroup.propTypes = {
  auth: React.PropTypes.object.isRequired,
  getGroups: React.PropTypes.func.isRequired,
};
