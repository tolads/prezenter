import React from 'react';
import { browserHistory } from 'react-router';

import { request } from '../utils';

/**
 * Play a presentation
 */
export default class PresentationsPlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      slides: [],
      currentSlide: 0,
    };

    window.addEventListener('keyup', (e) => {
      if (e.keyCode === 39 && this.state.currentSlide < this.state.slides.length - 1) {
        this.setState(prevState => ({
          currentSlide: prevState.currentSlide + 1,
        }));
      } else if (e.keyCode === 37 && this.state.currentSlide > 0) {
        this.setState(prevState => ({
          currentSlide: prevState.currentSlide - 1,
        }));
      }
    });

    this.getPresentation = this.getPresentation.bind(this);
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
   * Get a presentation
   */
  getPresentation() {
    // Send request to server
    request(`/presentations/get/${this.props.params.id}`, {
      credentials: 'same-origin',
    })
      .then((json) => {
        // success
        if (json.content) {
          this.setState({
            slides: json.content.slides,
          });
        }
      })
      .catch(({ status }) => {
        // error
        if (status === 401) {
          this.props.auth.logout();
        }
      });
  }

  render() {
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
