import React from 'react';

/**
 * Registration form
 */
export default class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      asdfgh: '',
      username: '',
      password: '',
      password2: '',
      fullname: '',
      username_error: '',
      password_error: '',
      password2_error: '',
      fullname_error: '',
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
      username_error: '',
      password_error: '',
      password2_error: '',
      fullname_error: '',
    });

    if (this.state.asdfgh !== '') return;

    if (this.state.username === '') {
      this.setState({ username_error: 'Felhasználónév megadása kötelező.' });
    } else if (this.state.username.length > 63) {
      this.setState({ username_error: 'A felhasználónév túl hosszú.' });
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.state.username)) {
      this.setState({ username_error: 'A felhasználónév csak az angol ABC kis- és nagybetűit, számokat és aláhúzásjelet tartalmazhat.' });
    }

    if (this.state.password === '') {
      this.setState({ password_error: 'Jelszó megadása kötelező.' });
    } else if (this.state.password !== this.state.password2) {
      this.setState({ password2_error: 'A megadott jelszavak nem egyeznek.' });
    }

    if (this.state.fullname === '') {
      this.setState({ fullname_error: 'Teljes név megadása kötelező.' });
    } else if (this.state.fullname.length > 127) {
      this.setState({ fullname_error: 'A név túl hosszú.' });
    } else if (!/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰäÄôÔýÝčČďĎĺĹňŇšŠťŤ_ ,.\-/()]+$/
      .test(this.state.fullname)) {
      this.setState({ fullname_error: 'A név nem megengedett karaktert tartalmaz.' });
    }

    if (this.state.username_error === '' &&
        this.state.password_error === '' &&
        this.state.password2_error === '' &&
        this.state.fullname_error === '') {
      // create a string for an HTTP body message
      const username = encodeURIComponent(this.state.username);
      const password = encodeURIComponent(this.state.password);
      const password2 = encodeURIComponent(this.state.password2);
      const fullname = encodeURIComponent(this.state.fullname);
      const formData = `username=${username}&password=${password}&password2=${password2}&fullname=${fullname}`;

      // create an AJAX request
      const xhr = new XMLHttpRequest();
      xhr.open('post', '/signup');
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.responseType = 'json';
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          // success

          // change the component-container state
          this.setState({
            username_error: '',
            password_error: '',
            password2_error: '',
            fullname_error: '',
          });

          this.props.auth.login(username);
        } else {
          // failure

          const errors = xhr.response.errors || {};

          this.setState({
            username_error: errors.username_error || '',
            password_error: errors.password_error || '',
            password2_error: errors.password2_error || '',
            fullname_error: errors.fullname_error || '',
          });
        }
      });
      xhr.send(formData);
    }
  }

  render() {
    return (
      <div className="col-md-8">
        <h2 id="signup"> Regisztráció </h2>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>

          <div className={this.state.username_error ? 'form-group has-error' : 'form-group'}>
            <label htmlFor="reg-user" className="col-sm-3 control-label"> Felhasználónév </label>
            <div className="col-sm-9">
              <input
                type="text"
                className="form-control"
                id="reg-user"
                name="username"
                value={this.state.username}
                onChange={this.handleInputChange}
              />
              {this.state.username_error &&
                <span className="help-block">{this.state.username_error}</span>}
            </div>
          </div>

          <div className={this.state.password_error ? 'form-group has-error' : 'form-group'}>
            <label htmlFor="reg-pwd" className="col-sm-3 control-label"> Jelszó </label>
            <div className="col-sm-9">
              <input
                type="password"
                className="form-control"
                id="reg-pwd"
                name="password"
                value={this.state.password}
                onChange={this.handleInputChange}
              />
              {this.state.password_error &&
                <span className="help-block">{this.state.password_error}</span>}
            </div>
          </div>

          <div className={this.state.password2_error ? 'form-group has-error' : 'form-group'}>
            <label htmlFor="reg-pwd2" className="col-sm-3 control-label"> Jelszó újra </label>
            <div className="col-sm-9">
              <input
                type="password"
                className="form-control"
                id="reg-pwd2"
                name="password2"
                value={this.state.password2}
                onChange={this.handleInputChange}
              />
              {this.state.password2_error &&
                <span className="help-block">{this.state.password2_error}</span>}
            </div>
          </div>

          <div className={this.state.fullname_error ? 'form-group has-error' : 'form-group'}>
            <label htmlFor="reg-name" className="col-sm-3 control-label"> Teljes név </label>
            <div className="col-sm-9">
              <input
                type="text"
                className="form-control"
                id="reg-name"
                name="fullname"
                value={this.state.fullname}
                onChange={this.handleInputChange}
              />
              {this.state.fullname_error &&
                <span className="help-block">{this.state.fullname_error}</span>}
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-offset-3 col-sm-9">
              <button type="submit" className="btn btn-success"> Regisztráció </button>
              <input name="asdfgh" value={this.state.asdfgh} onChange={this.handleInputChange} />
            </div>
          </div>

        </form>
      </div>
    );
  }
}

Register.propTypes = {
  auth: React.PropTypes.object.isRequired,
};
