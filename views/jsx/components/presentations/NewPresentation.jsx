import React from 'react';

import { request } from '../../utils';

/**
 * Form for creating a new presentation
 */
export default class NewPresentation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newPresentationName: '',
      newPresentationDesc: '',
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

    const newPresentationName = this.state.newPresentationName.trim();

    if (newPresentationName === '') {
      this.setState({
        error: 'Prezentáció nevének megadása kötelező.',
      });
      return;
    }

    const data = new FormData();
    data.append('newPresentationName', newPresentationName);
    data.append('newPresentationDesc', this.state.newPresentationDesc);

    // Send request to server
    request('/presentations/new', {
      method: 'POST',
      body: data,
    })
      .then(() => {
        // success
        this.setState({
          success: 'Prezentáció sikeresen létrehozva.',
          error: '',
        });
        this.props.getPresentations();
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
          <h2 id="new"> Új prezentáció létrehozása </h2>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className={this.state.error ? 'form-group has-error' : 'form-group'}>
              <label htmlFor="newPresentationName" className="col-sm-3 control-label">
                Prezentáció neve:
              </label>
              <div className="col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  id="newPresentationName"
                  name="newPresentationName"
                  value={this.state.newPresentationName}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPresentationDesc" className="col-sm-3 control-label">
                Rövid leírás:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control"
                  id="newPresentationDesc"
                  name="newPresentationDesc"
                  value={this.state.newPresentationDesc}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                <button type="submit" className="btn btn-success"> Létrehoz </button>

                {this.state.error &&
                  <div className="has-error">
                    <span className="help-block">{this.state.error}</span>
                  </div>}
                {this.state.success &&
                  <div className="has-success">
                    <span className="help-block">{this.state.success}</span>
                  </div>}
              </div>
            </div>

          </form>
        </div>
      </section>
    );
  }
}

NewPresentation.propTypes = {
  auth: React.PropTypes.object.isRequired,
  getPresentations: React.PropTypes.func.isRequired,
};
