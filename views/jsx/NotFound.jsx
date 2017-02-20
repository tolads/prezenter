import React from 'react';
import { Link } from 'react-router';

export default class NotFound extends React.Component {
  componentDidMount() {
    document.title = `Nem található | ${this.props.route.title}`;
  }

  render() {
    return (
      <div className="container error-page">
        <div className="jumbotron">
          <h1> 404 </h1>
          <h2> A keresett oldal nem található :( </h2>
          <p>
            <Link to="/" className="btn btn-lg btn-primary" role="button"> Vissza a kezdőlapra &gt;&gt; </Link>
          </p>
        </div>
      </div>
    );
  }
}

NotFound.propTypes = {
  route: React.PropTypes.object,
};
