import React from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Modal from './components/Modal';

/**
 * Render website pages
 */
export default class Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalData: {},
    };

    this.callModal = this.callModal.bind(this);
  }

  /**
   * Set parameters for modal dialog
   * @param {Object} modalData
   *   {String}   acceptText
   *   {Object}   args
   *   {Function} handleSubmit
   *   {Boolean}  hasInput
   *   {Object[]} options
   *   {String}   rejectText
   *   {String}   title
   */
  callModal(modalData) {
    this.setState({
      modalData,
    });
  }

  render() {
    return (
      <div>
        <div className="screenreader">
          <ul>
            <li><a href="#navbar">Ugrás a navigációhoz</a></li>
            <li><a href="#main">Ugrás a tartalomhoz</a></li>
          </ul>
        </div>

        <Navbar auth={this.props.auth} username={this.props.username} />

        <div id="main">
          {React.cloneElement(
            this.props.children,
            { auth: this.props.auth, modal: this.callModal }
          )}
        </div>

        <Footer />

        <Modal data={this.state.modalData} />
      </div>
    );
  }
}

Page.propTypes = {
  children: React.PropTypes.element.isRequired,
  auth: React.PropTypes.object,
  username: React.PropTypes.string,
};
