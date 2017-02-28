import React from 'react';
import { browserHistory, Link } from 'react-router';

/**
 * Page for editing a presentation
 */
export default class PresentationsEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      desc: '',
      content: '',
    };

    this.getPresentation = this.getPresentation.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Check if logged in, load presentations
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.getPresentation();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Prezentáció szerkesztése | ${this.props.route.title}`;
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
  getPresentation() {
    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('get', `/presentations/get/${this.props.params.id}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        this.setState({
          name: xhr.response.name,
          desc: xhr.response.desc,
          content: JSON.stringify(xhr.response.content, null, '  '),
        });
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      }
    });
    xhr.send();
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

    if (this.state.name === '') {
      this.setState({
        error: 'Prezentáció neve nem lehet üres.',
      });
      return;
    }

    try {
      if (this.state.content) {
        JSON.parse(this.state.content);
      }
    } catch (err) {
      this.setState({
        error: 'A tartalom formátuma nem megfelelő JSON.',
      });
      return;
    }

    const name = encodeURIComponent(this.state.name);
    const desc = encodeURIComponent(this.state.desc);
    const content = this.state.content || '';
    const formData = `name=${name}&desc=${desc}&content=${content}`;

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('post', `/presentations/edit/${this.props.params.id}`);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        this.setState({
          success: 'Sikeres mentés.',
        });
      } else if (xhr.status === 401) {
        this.props.auth.logout();
      } else {
        // failure
        this.setState({
          error: xhr.response.errors || '',
        });
      }
    });
    xhr.send(formData);
  }

  render() {
    return (
      <div className="container inner-page">
        <div className="col-md-12">
          <h1 id="new">
            <small><Link to="/presentations/own"> Saját diasorok </Link> / </small> Prezentáció szerkesztése
          </h1>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="col-sm-3 control-label">
                Prezentáció neve:
              </label>
              <div className="col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={this.state.name}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="desc" className="col-sm-3 control-label">
                Rövid leírás:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control"
                  id="desc"
                  name="desc"
                  value={this.state.desc}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="col-sm-3 control-label">
                Tartalom:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control json"
                  id="content"
                  name="content"
                  value={this.state.content}
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="col-sm-offset-3 col-sm-6">
                <p> Minta: </p>
                <pre><code>{`{
  "slides": [
    {
      "html": "<h1> Első dia </h1><p> Lorem ipsum dolor sit amet </p>",
      "background": "#a00"
    },
    {
      "html": "<h1> Második dia </h1><p> Lorem ipsum dolor sit amet </p>",
      "background": "#0a0"
    },
    {
      "html": "<h1> Harmadik dia </h1><p> Lorem ipsum dolor sit amet </p>"
    }
  ]
}`}</code></pre>
              </div>
            </div>

            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                <button type="submit" className="btn btn-success"> Mentés </button>

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
      </div>
    );
  }
}

PresentationsEdit.propTypes = {
  auth: React.PropTypes.object,
  params: React.PropTypes.object,
  route: React.PropTypes.object,
};
