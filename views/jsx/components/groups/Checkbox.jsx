import React from 'react';

/**
 * Checkbox component
 */
export default class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isChecked: false,
    };

    this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
  }

  toggleCheckboxChange() {
    this.setState(({ isChecked }) => ({
      isChecked: !isChecked,
    }));

    this.props.handleCheckboxChange(this.props.label);
  }

  render() {
    return (
      <input
        type="checkbox"
        value={this.props.label}
        checked={this.state.isChecked}
        onChange={this.toggleCheckboxChange}
      />
    );
  }
}

Checkbox.propTypes = {
  handleCheckboxChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};
