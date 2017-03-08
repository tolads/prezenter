import React from 'react';
import { browserHistory } from 'react-router';

import MessageBoard from '../components/MessageBoard';

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
    this.getSlide = this.getSlide.bind(this);
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
   * Get new slide for HEAD role
   */
  getSlide(id) {
    io.socket.get(
      `/presentations/getslide/${this.props.params.pid}/${id}`,
      (data, res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // success
        } else if (res.statusCode === 401) {
          // Error 401 - Unauthorized
          this.props.auth.logout();
        } else if (data.error) {
          // Other error
          this.setState({
            error: data.error,
          });
        }
      }
    );
  }

  /**
   * Handle keyup event
   */
  handleKeyUp(e) {
    if (e.keyCode === 39) {
      this.getSlide(this.state.currentSlide + 1);
    } else if (e.keyCode === 37) {
      this.getSlide(this.state.currentSlide - 1);
    }
  }

  /**
   * Register for projection
   */
  connect() {
    io.socket.get(
      `/presentations/connect/${this.props.params.pid}/${this.props.params.gid}`,
      (data, res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // success
          this.setState({
            slides: [data.currentSlide],
            currentSlide: data.currentSlideID,
            role: data.role,
            error: '',
          });

          document.title = `${data.name} - Prezentáció lejátszása | ${this.props.route.title}`;

          if (data.role === 'head') {
            this.setUpControl();
          }

          io.socket.on('newSlide', (data) => {
            this.setState((prevState) => {
              const newSlides = prevState.slides;
              newSlides[data.currentSlideID] = data.currentSlide;

              return {
                slides: newSlides,
                currentSlide: data.currentSlideID,
                error: '',
              };
            });
          });
        } else if (res.statusCode === 401) {
          // Error 401 - Unauthorized
          this.props.auth.logout();
        } else if (data.error) {
          // Other error
          this.setState({
            error: data.error,
          });
        }
      }
    );
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

    const slides = [
      ...this.state.slides.map((slide, ind) => {
        const divStyle = {
          background: slide.background,
        };
        if (ind > this.state.currentSlide) {
          divStyle.marginLeft = window.innerWidth;
          divStyle.opacity = 0;
        }

        if (slide.html) {
          return (
            <div
              key={ind}
              className={ind > this.state.currentSlide ? 'slide' : 'slide current'}
              style={divStyle}
              dangerouslySetInnerHTML={{ __html: slide.html }}
            />
          );
        } else if (slide.app === 'MessageBoard') {
          return (
            <div
              key={ind}
              className={ind > this.state.currentSlide ? 'slide' : 'slide current'}
              style={divStyle}
            >
              <MessageBoard
                role={this.state.role}
                title={slide.title}
                auth={this.props.auth}
                pid={this.props.params.pid}
              />
            </div>
          );
        }

        return (
          <div
            key={ind}
            className={ind > this.state.currentSlide ? 'slide' : 'slide current'}
            style={divStyle}
          >
            Hiba történt :(
          </div>
        );
      }),
      <div
        key={this.state.slides.length}
        className="slide"
        style={{ marginLeft: window.innerWidth, opacity: 0 }}
      />,
    ];

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
