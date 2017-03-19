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
      currentSlide: 0,
      error: '',
      success: '',
    };

    this.getPresentation = this.getPresentation.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSlideChange = this.handleSlideChange.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.deleteSlide = this.deleteSlide.bind(this);
    this.addPrevSlide = this.addPrevSlide.bind(this);
    this.addNextSlide = this.addNextSlide.bind(this);
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
    request(`/presentations/get/${this.props.params.id}`, {
      credentials: 'same-origin',
    })
      .then((json) => {
        // success
        const slides = [];
        const contents = [];

        if (json.content) {
          json.content.map((slide) => {
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

        this.setState({
          name: json.name,
          desc: json.desc,
          slides,
          contents,
        });
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
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
          currentSlide: prevState.currentSlide >= slides.length ? slides.length - 1 : prevState.currentSlide,
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
   * Add new slide before current
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

    const data = new FormData();
    data.append('name', this.state.name);
    data.append('desc', this.state.desc);
    data.append('content', JSON.stringify(slides));

    // Send request to server
    request(`/presentations/edit/${this.props.params.id}`, {
      method: 'POST',
      credentials: 'same-origin',
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
              <label className="col-sm-3 control-label"> Dia: </label>
              <div className="col-sm-6"><div className="slideId"> {this.state.currentSlide + 1} / {this.state.slides.length} </div></div>
            </div>

            {/* settings of current slide */}
            <div className="form-group">
              <label htmlFor="content" className="col-sm-3 control-label">
                Beállítások:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control json"
                  id="content"
                  name="content"
                  value={this.state.slides[this.state.currentSlide]}
                  onChange={this.handleSlideChange}
                />
              </div>
            </div>

            <div className="form-group">
              {/* content of current slide */}
              <label htmlFor="content" className="col-sm-3 control-label">
                Tartalom:
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control json"
                  id="content"
                  name="content"
                  value={this.state.contents[this.state.currentSlide]}
                  onChange={this.handleContentChange}
                />
              </div>
            </div>

            <div className="form-group">
              {/* sample */}
              <div className="col-sm-offset-3 col-sm-6">
                <p> Minta: </p>
                <pre><code>{`[
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
]`}</code></pre>
              </div>
            </div>

            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                {/* buttons */}
                <button type="submit" className="btn btn-success"> Mentés </button>
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
