import React from 'react';
import { browserHistory, Link } from 'react-router';

import { request } from '../utils';

/**
 * Page for editing a presentation
 */
export default class PresentationsEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      desc: '',
      contents: [''],
      slides: [''],
      saved: {},
      currentSlide: 0,
      error: '',
      success: '',
    };

    this.getPresentation = this.getPresentation.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSlideChange = this.handleSlideChange.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleImport = this.handleImport.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.deleteSlide = this.deleteSlide.bind(this);
    this.addPrevSlide = this.addPrevSlide.bind(this);
    this.addNextSlide = this.addNextSlide.bind(this);
    this.processPresentation = this.processPresentation.bind(this);
  }

  /**
   * Check if logged in, load presentation
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
   * Get a presentation
   */
  getPresentation() {
    // Send request to server
    request(`/presentations/get/${this.props.params.id}`)
      .then((json) => {
        // success
        this.processPresentation(json);
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  /**
   * Process loaded or imported presentation
   */
  processPresentation(json) {
    const slides = [];
    const contents = [];

    this.setState({
      error: '',
      success: '',
    });

    if (json.content) {
      json.content.forEach((slide) => {
        const slideJSON = Object.assign({}, slide);
        contents.push(slideJSON.html || '');
        slideJSON.html = undefined;
        slides.push(JSON.stringify(slideJSON, null, '  '));
      });
    }

    if (!slides.length) {
      slides.push('');
      contents.push('');
    }

    this.setState(prevState => ({
      name: json.name || prevState.name,
      desc: json.desc || prevState.desc,
      slides,
      contents,
      saved: json.content,
    }));
  }

  /**
   * Change view to previous slide
   */
  prevSlide(e) {
    e.preventDefault();

    if (this.state.currentSlide > 0) {
      this.setState(prevState => ({
        currentSlide: prevState.currentSlide - 1,
      }));
    }
  }

  /**
   * Change view to next slide
   */
  nextSlide(e) {
    e.preventDefault();

    if (this.state.currentSlide < this.state.slides.length - 1) {
      this.setState(prevState => ({
        currentSlide: prevState.currentSlide + 1,
      }));
    }
  }

  /**
   * Delete current slide
   */
  deleteSlide(e) {
    e.preventDefault();

    if (this.state.slides.length) {
      this.setState((prevState) => {
        const slides = prevState.slides;
        const contents = prevState.contents;
        slides.splice(prevState.currentSlide, 1);
        contents.splice(prevState.currentSlide, 1);

        if (!slides.length) {
          slides.push('');
          contents.push('');
        }

        return {
          slides,
          contents,
          currentSlide: prevState.currentSlide >= slides.length
            ? slides.length - 1
            : prevState.currentSlide,
        };
      });
    }
  }

  /**
   * Add new slide before current
   */
  addPrevSlide(e) {
    e.preventDefault();

    this.setState((prevState) => {
      const slides = prevState.slides;
      const contents = prevState.contents;
      slides.splice(prevState.currentSlide, 0, '');
      contents.splice(prevState.currentSlide, 0, '');

      return {
        slides,
        contents,
      };
    });
  }

  /**
   * Add new slide after current
   */
  addNextSlide(e) {
    e.preventDefault();

    this.setState((prevState) => {
      const slides = prevState.slides;
      const contents = prevState.contents;
      slides.splice(prevState.currentSlide + 1, 0, '');
      contents.splice(prevState.currentSlide + 1, 0, '');

      return {
        slides,
        contents,
        currentSlide: prevState.currentSlide + 1,
      };
    });
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSlideChange(e) {
    const value = e.target.value;

    this.setState((prevState) => {
      const slides = prevState.slides;
      slides[prevState.currentSlide] = value;
      return {
        slides,
      };
    });
  }

  handleContentChange(e) {
    const value = e.target.value;

    this.setState((prevState) => {
      const contents = prevState.contents;
      contents[prevState.currentSlide] = value;
      return {
        contents,
      };
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

    const slides = [];
    try {
      this.state.slides.forEach((slide, ind) => {
        if (slide) {
          slides.push(JSON.parse(slide));
        } else {
          slides.push({});
        }
        slides[slides.length - 1].html = this.state.contents[ind] || '';
      });
    } catch (err) {
      this.setState({
        error: 'A tartalom formátuma nem megfelelő JSON.',
      });
      return;
    }

    this.setState({
      saved: slides,
    });

    const data = new FormData();
    data.append('name', this.state.name);
    data.append('desc', this.state.desc);
    data.append('content', JSON.stringify(slides));

    // Send request to server
    request(`/presentations/edit/${this.props.params.id}`, {
      method: 'POST',
      body: data,
    })
      .then(() => {
        // success
        this.setState({
          success: 'Sikeres mentés.',
        });
      })
      .catch(({ status, json }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        } else if (status === 400) {
          this.setState({
            error: json.errors || '',
          });
        }
      });
  }

  /**
   * Handle onchange event from input type file
   */
  handleImport(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (e2) => {
      try {
        const json = JSON.parse(e2.target.result);
        this.processPresentation({ content: json });
        this.setState({
          success: 'Sikeres importálás.',
          error: '',
        });
      } catch (err) {
        this.setState({
          error: 'A fájl formátuma nem megfelelő JSON.',
          success: '',
        });
      }
    });
    reader.readAsText(file);
  }

  render() {
    return (
      <div className="container inner-page">
        <div className="col-md-12">
          <h1 id="new">
            <small><Link to="/presentations/own"> Saját diasorok </Link> / </small>
            Prezentáció szerkesztése
          </h1>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>

            {/* name */}
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

            {/* description */}
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

            <h2 className="col-sm-offset-1"> Diák </h2>

            {/* buttons */}
            <div className="presentation-edit-buttons">
              <div className="col-sm-offset-1 col-sm-2">
                <button
                  className="btn btn-block btn-primary"
                  title="Előző"
                  disabled={this.state.currentSlide <= 0 ? 'disabled' : ''}
                  onClick={this.prevSlide}
                >
                  <span className="glyphicon glyphicon-chevron-left" />
                  <span className="text"> Előző </span>
                </button>
              </div>
              <div className="col-sm-2">
                <button
                  className="btn btn-block btn-danger"
                  title="Törlés"
                  onClick={this.deleteSlide}
                >
                  <span className="glyphicon glyphicon-remove" />
                  <span className="text"> Törlés </span>
                </button>
              </div>
              <div className="col-sm-4">
                <div className="btn-group btn-group-justified">
                  <a
                    href=""
                    className="btn btn-success"
                    title="Beszúr elé"
                    onClick={this.addPrevSlide}
                  >
                    <span className="glyphicon glyphicon-plus" />
                    <span className="text"> Beszúr elé </span>
                  </a>
                  <a
                    href=""
                    className="btn btn-success"
                    title="Beszúr mögé"
                    onClick={this.addNextSlide}
                  >
                    Mögé
                  </a>
                </div>
              </div>
              <div className="col-sm-2">
                <button
                  className="btn btn-block btn-primary"
                  title="Következő"
                  disabled={this.state.slides.length <= this.state.currentSlide + 1 ? 'disabled' : ''}
                  onClick={this.nextSlide}
                >
                  <span className="text"> Következő </span>
                  <span className="glyphicon glyphicon-chevron-right" />
                </button>
              </div>
            </div>

            {/* slide id */}
            <div className="form-group">
              <p className="col-sm-3 control-label"> Dia: </p>
              <div className="col-sm-6"><div className="slide-id">
                {this.state.currentSlide + 1} / {this.state.slides.length}
              </div></div>
            </div>

            {/* settings of current slide */}
            <div className="form-group">
              <label htmlFor="settings" className="col-sm-3 control-label">
                Beállítások:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control content"
                  id="settings"
                  name="settings"
                  value={this.state.slides[this.state.currentSlide]}
                  onChange={this.handleSlideChange}
                />
              </div>
            </div>

            {/* help for settings of current slide */}
            <div className="col-sm-offset-1 col-sm-10 panel-group" id="accordion" role="tablist">
              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="headingOne">
                  <h4 className="panel-title">
                    <a
                      className="collapsed"
                      role="button"
                      data-toggle="collapse"
                      data-parent="#accordion"
                      href="#collapseOne"
                      aria-expanded="false"
                      aria-controls="collapseOne"
                    >
                      Minták beállításokra
                    </a>
                  </h4>
                </div>
                <div
                  id="collapseOne"
                  className="panel-collapse collapse"
                  role="tabpanel"
                  aria-labelledby="headingOne"
                >
                  <div className="panel-body">
                    <p> Háttérszín beállítása: </p>
                    <pre><code>{`{
  "background": "#f9f4ce"
}`}</code></pre>
                    <p> Űrlap létrehozása feleletválasztós kérdésekkel: </p>
                    <pre><code>{`{
  "app": "form",
  "title": "Mennyi volt az egyéni rekordja?",
  "inputs": [
    {
      "label": "Mike Powell",
      "options": [
        "813",
        "887",
        "890",
        "895"
      ]
    },
    {
      "label": "Bob Beamon",
      "options": [
        "813",
        "887",
        "890",
        "895"
      ]
    }
  ]
}`}</code></pre>
                    <p> Üzenőfal létrehozása: </p>
                    <pre><code>{`{
  "app": "messageboard",
  "title": "Kérdések?"
}`}</code></pre>
                    <p>
                      Automatikus váltás a következő diára (késleltetés másodpercekben megadva):
                    </p>
                    <pre><code>{`{
  "timeOut": 20
}`}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              {/* content of current slide */}
              <label htmlFor="content" className="col-sm-3 control-label">
                Tartalom:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control content"
                  id="content"
                  name="content"
                  value={this.state.contents[this.state.currentSlide]}
                  onChange={this.handleContentChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                {/* buttons */}
                <button type="submit" className="btn btn-success"> Mentés </button>
                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.state.saved, null, '  '))}`}
                  download="json.json"
                  className="btn btn-info"
                >
                  Exportálás
                </a>
                <label htmlFor="import" className="btn btn-info"> Importálás </label>
                <input id="import" type="file" onChange={this.handleImport} />
                <Link
                  to={`/presentations/play/${this.props.params.id}/-2`}
                  className="btn btn-primary"
                  target="_blank"
                >
                  Megtekintés
                </Link>

                {/* messages */}
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
