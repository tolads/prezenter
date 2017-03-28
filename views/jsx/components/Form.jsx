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

    for (let i = 0; i < this.props.inputs.length; i++) {
      this.setState({
        [`input${i}`]: 0,
      });
    }
  }

  /**
   * Init tooltips for HEAD role statistics
   */
  componentDidMount() {
    if (this.props.role === 'head') {
      $('[data-toggle="tooltip"]').tooltip();
    }
  }
  componentDidUpdate() {
    if (this.props.role === 'head') {
      $('[data-toggle="tooltip"]').tooltip({
        title() {
          return $(this).attr('data-title');
        },
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

    io.socket.post(`/presentations/app/${this.props.pid}/form`, data, (data2, res) => {
      if (res.statusCode === 401) {
        // Error 401 - Unauthorized
        this.props.auth.logout();
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        // success
        this.setState({
          success: 'Űrlap sikeresen elküldve.',
          error: '',
        });
      } else {
        // other error
        this.setState({
          error: 'Az űrlapot már egyszer elküldted.',
          success: '',
        });
      }
    });
  }

  render() {
    const form = this.props.inputs.map((input, ind) => {
      if (this.props.role === 'head') {
        if (this.state.submitted.length) {
          const submitCount = this.state.submitted.length;
          const colors = ['info', 'success', 'danger', 'warning', 'primary', 'default'];
          const options = input.options.map((option, ind2) => {
            const count = this.state.submitted.reduce((acc, val) => {
              if (val.inputs[ind].answer === option) {
                return acc + 1;
              }
              return acc;
            }, 0);

            return (
              <div
                data-title={`${option} - ${count} / ${submitCount}`}
                data-toggle="tooltip"
                data-placement="top"
                className={`progress-bar progress-bar-${colors[ind2 % colors.length]}`}
                key={ind2}
                style={{ width: `${Math.round(count / submitCount * 100)}%` }}
              />
            );
          });

          return (
            <div key={ind} className="form-head">
              <p className="col-sm-4"> {input.label} </p>
              <div className="progress">
                {options}
              </div>
            </div>
          );
        }

        return <div key={ind} className="form-head" />;
      }

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

    if (this.props.role === 'head') {
      return (
        <div className="form-app">
          <h1> {this.props.title || 'Űrlap'} </h1>
          <p> Elküldött válaszok: {this.state.submitted.length}db </p>
          {form}
        </div>
      );
    }

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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={this.props.role === 'projector'}
                >
                  Elküld
                </button>
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
