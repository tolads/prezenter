import React from 'react';

import Register from '../components/Register';
import Login from '../components/Login';

/**
 * Home page
 */
export default class Home extends React.Component {
  /**
   * Set <title>
   */
  componentDidMount() {
    document.title = this.props.route.title;
  }

  render() {
    return (
      <div>
        <div className="jumbotron">
          <div className="container">
            <h1>Prezenter</h1>
            <p>böngőszőben futó valós idejű prezentációs alkalmazás</p>
          </div>
        </div>

        <div className="container">

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
