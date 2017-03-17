import React from 'react';

/**
 * Interactive message board component
 */
export default class MessageBoard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newMessage: '',
      messages: [],
      success: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Subscribe to messageBoard socket event if HEAD or PROJECTOR
   */
  componentWillMount() {
    console.log('componentWillMount');
    if (this.props.role === 'head' || this.props.role === 'projector') {
      console.log('head||projector');
      io.socket.on('messageboard', (data) => {
        console.log('messageboard');
        this.setState({
          messages: data.messageList,
        });
      });
    }
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  /**
   * Submit new message
   */
  handleSubmit() {
    const message = this.state.newMessage.trim();
    if (message === '') return;

    io.socket.post(`/presentations/app/${this.props.pid}/messageboard`, { message }, (data, res) => {
      if (res.statusCode === 401) {
        // Error 401 - Unauthorized
        this.props.auth.logout();
      }
    });

    this.setState({
      newMessage: '',
      success: 'Üzenet sikeresen elküldve.',
    });
  }

  render() {
    const messages = this.state.messages.map((message, ind) => (<p key={ind}> {message} </p>));

    return (
      <div className="message-board">
        <h1> {this.props.title || 'Hozzászólások'} </h1>

        {(this.props.role === 'head' || this.props.role === 'spectator') &&
          <textarea
            onKeyUp={e => e.stopPropagation()}
            className="form-control"
            name="newMessage"
            value={this.state.newMessage}
            onChange={this.handleInputChange}
          />
        }
        {(this.props.role === 'head' || this.props.role === 'spectator') &&
          <button type="submit" className="btn btn-default" onClick={this.handleSubmit}>
            Üzenet elküldése
          </button>
        }
        {(this.props.role === 'head' || this.props.role === 'spectator') &&
          <span className="help-block"> {this.state.success} </span>
        }

        {(this.props.role === 'head' || this.props.role === 'projector') &&
          <div className="messages">
            {messages}
          </div>
        }
      </div>
    );
  }
}

MessageBoard.propTypes = {
  role: React.PropTypes.string,
  title: React.PropTypes.string,
  auth: React.PropTypes.object,
  pid: React.PropTypes.string,
};
