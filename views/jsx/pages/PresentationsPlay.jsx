import React from 'react';
import { browserHistory } from 'react-router';
import marked from 'marked';

import MessageBoard from '../components/MessageBoard';
import Form from '../components/Form';

/**
 * Play a presentation
 */
export default class PresentationsPlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scale: 1,
      slides: [],
      currentSlide: 0,
      role: undefined,
      error: '',
    };

    this.connect = this.connect.bind(this);
    this.setUpControl = this.setUpControl.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.getSlide = this.getSlide.bind(this);
    this.getNextSlide = this.getNextSlide.bind(this);
    this.slideSwitched = this.slideSwitched.bind(this);
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
   * Set <title>, resize slides to fit window
   */
  componentDidMount() {
    document.title = `Prezentáció lejátszása | ${this.props.route.title}`;
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
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
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('resize', this.handleResize);
  }

  /**
   * Set up control for HEAD role
   */
  setUpControl() {
    this.touchStartX = 0;
    this.touchEndX = 0;

    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
  }

  /**
   * Get new slide for HEAD role
   */
  getSlide(id) {
    if (this.timeOut) {
      window.clearTimeout(this.timeOut);
      this.timeOut = undefined;
    }

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
      },
    );
  }

  /**
   * Get next slide for HEAD role
   */
  getNextSlide() {
    this.getSlide(this.state.currentSlide + 1);
  }

  /**
   * Handle keyup event
   */
  handleKeyUp(e) {
    e.preventDefault();

    if (e.keyCode === 39) {
      this.getSlide(this.state.currentSlide + 1);
    } else if (e.keyCode === 37) {
      this.getSlide(this.state.currentSlide - 1);
    }
  }

  /**
   * Handle wheel event
   */
  handleWheel(e) {
    e.preventDefault();

    if (e.deltaY > 0) {
      this.getSlide(this.state.currentSlide + 1);
    } else if (e.deltaY < 0) {
      this.getSlide(this.state.currentSlide - 1);
    }
  }

  /**
   * Handle touchstart event
   */
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].screenX;
  }

  /**
   * Handle touchmove event
   */
  handleTouchMove(e) {
    this.touchEndX = e.touches[0].screenX;
  }

  /**
   * Handle touchend event
   */
  handleTouchEnd() {
    const minDist = 100;

    if (this.touchEndX - this.touchStartX > minDist) {
      this.getSlide(this.state.currentSlide - 1);
    } else if (this.touchStartX - this.touchEndX > minDist) {
      this.getSlide(this.state.currentSlide + 1);
    }
  }

  /**
   * Handle window resize event
   */
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const containerWidth = 800;
    const containerHeight = 600;

    this.setState({
      scale: width > containerWidth && height > containerHeight
        ? Math.min(width / containerWidth, height / containerHeight) - 0.05
        : Math.min(width / containerWidth, height / containerHeight),
    });
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
          const slides = [];
          slides[data.currentSlideID] = data.currentSlide;
          this.setState({
            slides,
            currentSlide: data.currentSlideID,
            role: data.role,
            error: '',
          });

          document.title = `${data.name} - Prezentáció lejátszása | ${this.props.route.title}`;

          if (data.role === 'head') {
            this.setUpControl();
          }

          this.slideSwitched();
        } else if (res.statusCode === 401) {
          // Error 401 - Unauthorized
          this.props.auth.logout();
        } else if (data.error) {
          // Other error
          this.setState({
            error: data.error,
          });
        }
      },
    );
  }

  /**
   * Display new slide
   */
  slideSwitched() {
    io.socket.on('newSlide', (data) => {
      if (this.state.role === 'head' && data.currentSlide.timeOut) {
        this.timeOut = window.setTimeout(this.getNextSlide, data.currentSlide.timeOut * 1000);
      }

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
  }

  render() {
    const div2Style = {
      transform: `scale(${this.state.scale})`,
    };

    if (this.state.error !== '') {
      return (
        <div className="presentation-play">
          <div className="slide">
            <div className="box">
              <h1> {this.state.error} </h1>
            </div>
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
        } else if (ind < this.state.currentSlide) {
          divStyle.marginLeft = -window.innerWidth;
        }

        let content;

        if (slide.app === 'messageboard') {
          content = (
            <MessageBoard
              role={this.state.role}
              title={slide.title}
              auth={this.props.auth}
              pid={this.props.params.pid}
            />
          );
        } else if (slide.app === 'form') {
          content = (
            <Form
              role={this.state.role}
              title={slide.title}
              auth={this.props.auth}
              pid={this.props.params.pid}
              inputs={slide.inputs}
            />
          );
        } else if (slide.html) {
          content = (
            <div
              className="box"
              dangerouslySetInnerHTML={{ __html: marked(slide.html) }}
              style={div2Style}
            />
          );
        } else {
          content = (
            <div className="box" style={div2Style}>
              Hiba történt :(
            </div>
          );
        }

        return (
          <div
            key={ind}
            className={ind !== this.state.currentSlide ? 'slide' : 'slide current'}
            style={divStyle}
          >
            {content}
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
