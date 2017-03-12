import React from 'react';

/**
 * Login form
 */
export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
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

    this.props.auth.loginSubmit({
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {
    return (
      <section className="col-md-4">
        <h2 id="login">Bejelentkezés</h2>
        <form onSubmit={this.handleSubmit} className={this.props.auth.loginError && 'has-error'}>

          <div className="form-group">
            <label htmlFor="login-user"> Felhasználónév: </label>
            <input
              type="text"
              className="form-control"
              id="login-user"
              name="username"
              value={this.state.username}
              onChange={this.handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-pwd"> Jelszó: </label>
            <input
              type="password"
              className="form-control"
              id="login-pwd"
              name="password"
              value={this.state.password}
              onChange={this.handleInputChange}
            />
          </div>

          {this.props.auth.loginError &&
            <span className="help-block">{this.props.auth.loginError}</span>}

          <button type="submit" className="btn btn-success"> Bejelentkezés </button>
        </form>
      </section>
    );
  }
}

Login.propTypes = {
  auth: React.PropTypes.object.isRequired,
};
