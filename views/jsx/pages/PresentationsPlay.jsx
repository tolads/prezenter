import React from 'react';
import { browserHistory } from 'react-router';

/**
 * Play a presentation
 */
export default class PresentationsPlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      slides: [],
      currentSlide: 0,
      role: undefined,
      error: '',
    };

    this.connect = this.connect.bind(this);
    this.setUpControl = this.setUpControl.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Check if logged in, load presentations
   */
  componentWillMount() {
    if (!this.props.auth.isLoggedIn) {
      browserHistory.push('/');
    } else {
      this.connect();
    }
  }

  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = `Prezentáció lejátszása | ${this.props.route.title}`;
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
   * Remove event listeners
   */
  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Set up control for HEAD role
   */
  setUpControl() {
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Handle keyup event
   */
  handleKeyUp(e) {
    if (e.keyCode === 39 && this.state.currentSlide < this.state.slides.length - 1) {
      this.setState(prevState => ({
        currentSlide: prevState.currentSlide + 1,
      }));
    } else if (e.keyCode === 37 && this.state.currentSlide > 0) {
      this.setState(prevState => ({
        currentSlide: prevState.currentSlide - 1,
      }));
    }
  }

  /**
   * Register for projection
   */
  connect() {
    io.socket.get(`/presentations/connect/${this.props.params.pid}/${this.props.params.gid}`, (data, res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // success
        if (data.content) {
          this.setState({
            slides: data.content.slides,
            role: data.role,
            error: '',
          });

          if (true || data.role === 'HEAD') { // TODO!!!
            this.setUpControl();
          }
        }
      } else if (res.statusCode === 401) {
        // Error 401 - Unauthorized
        this.props.auth.logout();
      } else if (data.error) {
        // Other error
        this.setState({
          error: data.error,
        });
      }
    });
  }

  render() {
    if (this.state.error !== '') {
      return (
        <div className="presentation-play">
          <div className="slide current">
            <h1> {this.state.error} </h1>
          </div>
        </div>
      );
    }

    const slides = this.state.slides.map((slide, ind) => {
      if (ind <= this.state.currentSlide) {
        return (
          <div
            key={ind}
            className="slide current"
            style={{ background: slide.background }}
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
        );
      }
      return (
        <div
          key={ind}
          className="slide"
          style={{ marginLeft: window.innerWidth, opacity: 0, background: slide.background }}
          dangerouslySetInnerHTML={{ __html: slide.html }}
        />
      );
    });

    return (
      <div className="presentation-play">
        {slides}
      </div>
    );
  }
}

PresentationsPlay.propTypes = {
  auth: React.PropTypes.object,
  params: React.PropTypes.object,
  route: React.PropTypes.object,
};
