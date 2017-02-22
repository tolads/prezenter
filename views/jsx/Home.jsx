import React from 'react';

import Register from './components/Register';
import Login from './components/Login';

export default class Home extends React.Component {
  componentDidMount() {
    document.title = this.props.route.title;
  }

  render() {
    return (
      <div>
        <div className="jumbotron">
          <div className="container">
            <h1>Hello, world!</h1>
            <p>This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.</p>
            <p><a className="btn btn-primary btn-lg" href="#" role="button">Learn more &raquo;</a></p>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h2>Heading</h2>
              <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>
              <p><a className="btn btn-default" href="#" role="button">View details &raquo;</a></p>
            </div>
            <div className="col-md-4">
              <h2>Heading</h2>
              <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>
              <p><a className="btn btn-default" href="#" role="button">View details &raquo;</a></p>
          </div>
            <div className="col-md-4">
              <h2>Heading</h2>
              <p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
              <p><a className="btn btn-default" href="#" role="button">View details &raquo;</a></p>
            </div>
          </div>

          { !this.props.auth.isLoggedIn &&
          <div className="row">
            <Register auth={this.props.auth} />
            <Login auth={this.props.auth} />
          </div> }

          <div className="row">
            <div className="col-md-12">
              <h2>Impresszum</h2>
              <p> Adminisztrátor: László Tamás &lt;tlaszlods [kukac] gmail [pont] com&gt; </p>
              <p> Tárhelyszolgáltató: <a href="https://www.heroku.com/">Heroku</a> </p>
              <p> A logót <a href="http://www.flaticon.com/authors/simpleicon" title="SimpleIcon">SimpleIcon</a> készítette a <a href="http://www.flaticon.com" title="Flaticon">flaticon.com</a>-ról <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC 3.0 BY</a> licence alatt. </p>
              <p> A weboldal 2017-ben készült mint szakdolgozat az ELTE IK programtervező informatikus Bsc szakon. </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
};
