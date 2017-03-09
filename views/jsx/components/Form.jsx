import React from 'react';

/**
 * Built in form as a slide in a presentation
 */
export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      success: '',
      error: '',
      submitted: [],
    };

    for (let i = 0; i < this.props.inputs.length; i++) {
      this.state[`input${i}`] = 0;
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Subscribe to Form socket event if HEAD
   */
  componentWillMount() {
    if (this.props.role === 'head') {
      io.socket.on('form', (data) => {
        this.setState({
          submitted: data.dataList,
        });
      });
    }
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  /**
   * Submit the form
   */
  handleSubmit(e) {
    e.preventDefault();

    const data = {};

    for (let i = 0; i < this.props.inputs.length; i++) {
      data[`input${i}`] = this.state[`input${i}`];
    }

    io.socket.post(`/presentations/app/${this.props.pid}/form`, data, (data, res) => {
      if (res.statusCode === 401) {
        // Error 401 - Unauthorized
        this.props.auth.logout();
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        this.setState({
          success: 'Űrlap sikeresen elküldve.',
          error: '',
        });
      } else {
        this.setState({
          error: 'Az űrlapot már egyszer elküldted.',
          success: '',
        });
      }
    });
  }

  render() {
    if (this.props.role === 'head') {
      return (
        <div className="form-app">
          <h1> {this.props.title || 'Űrlap'} </h1>
          <p> Elküldött válaszok: {this.state.submitted.length}db </p>
        </div>
      );
    }

    const form = this.props.inputs.map((input, ind) => {
      const options = input.options.map((option, ind2) =>
        <option key={ind2} value={ind2}> {option} </option>);

      return (
        <div key={ind} className="form-group">
          <label htmlFor={`input${ind}`} className="col-sm-4 control-label"> {input.label} </label>
          <div className="col-sm-8">
            <select
              className="form-control"
              id={`input${ind}`}
              name={`input${ind}`}
              value={this.state[`input${ind}`]}
              onChange={this.handleInputChange}
            >
              {options}
            </select>
          </div>
        </div>
      );
    });

    return (
      <div className="form-app">
        <h1> {this.props.title || 'Űrlap'} </h1>
        {this.state.success || this.state.error ?
          (<span className="help-block"> {this.state.success}{this.state.error} </span>
        ) : (
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            {form}
            <div className="form-group">
              <div className="col-sm-offset-4 col-sm-8">
                <button type="submit" className="btn btn-primary" disabled={this.props.role === 'projector'}> Elküld </button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
}

Form.propTypes = {
  role: React.PropTypes.string,
  title: React.PropTypes.string,
  auth: React.PropTypes.object,
  pid: React.PropTypes.string,
  inputs: React.PropTypes.array,
};
