import React from 'react';

/**
 * Modal dialog
 */
export default class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalInput: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Set focus on input element and initial state
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      if (nextProps.data.hasInput) {
        if (nextProps.data.options && nextProps.data.options.length) {
          this.setState({
            modalInput: nextProps.data.options[0] && nextProps.data.options[0].id,
          });
        }
        $('#modal').on('shown.bs.modal', () => $('#modalInput').focus());
      } else {
        $('#modal').on('shown.bs.modal', () => $('#modalAccept').focus());
      }
    }
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const data = this.props.data || {};
    data.handleSubmit(Object.assign({}, data.args, { input: this.state.modalInput }));
    $('#modal').modal('hide');
  }

  render() {
    const data = this.props.data || {};

    let options = null;
    if (data.options && data.options.length) {
      options = data.options.map(option => (
        <option key={option.id} value={option.id}>{option.name}</option>
      ));
    }

    return (
      <div className="modal fade inner-page" tabIndex="-1" role="dialog" id="modal">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"> &times; </span>
              </button>
              <h4 className="modal-title"> {data.title || ''} </h4>
            </div>
            <form onSubmit={this.handleSubmit}>
              {data.hasInput &&
                <div className="modal-body">
                  <p>
                    {options ? (
                      <select
                        className="form-control"
                        id="modalInput"
                        name="modalInput"
                        value={this.state.modalInput}
                        onChange={this.handleInputChange}
                      >
                        {options}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        id="modalInput"
                        name="modalInput"
                        value={this.state.modalInput}
                        onChange={this.handleInputChange}
                      />
                    )}
                  </p>
                  {data.desc && <p><small> {data.desc} </small></p>}
                </div>
              }
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" id="modalAccept">
                  {data.acceptText || 'Igen'}
                </button>
                <button type="button" className="btn btn-default" data-dismiss="modal">
                  {data.rejectText || 'Mégse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  data: React.PropTypes.object,
};
