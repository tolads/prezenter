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
        <section className="jumbotron">
          <div className="container">
            <h1>Prezenter</h1>
            <p>böngészőben futó valós idejű prezentációs alkalmazás</p>
          </div>
        </section>

        <div className="container">
          <section className="row marketing">
            <div className="col-md-3">
              <h2> <span className="glyphicon glyphicon-user" /> Csoportok </h2>
              <p>
                Hozz létre csoportokat, majd rendeld hozzá a vetítésedet a megfelelő csoporthoz.
              </p>
            </div>
            <div className="col-md-3">
              <h2> <span className="glyphicon glyphicon-refresh" /> Szinkronizáció </h2>
              <p>
                A lejátszásba becsatlakozott felhasználók csak azt látják, amit épp mutatsz. A vetítést te vezérled.
              </p>
            </div>
            <div className="col-md-3">
              <h2> <span className="glyphicon glyphicon-list-alt" /> Minialkalmazások </h2>
              <p>
                Építs prezentációdba üzenőfalat, feleletválasztós tesztet a nézőkkel való kapcsolat megteremtéséhez.
              </p>
            </div>
            <div className="col-md-3">
              <h2> <span className="glyphicon glyphicon-stats" /> Statisztikák </h2>
              <p> Nézd vissza a prezentációidban kitöltött teszteket, feltett kérdéseket. </p>
            </div>
          </section>

          { !this.props.auth.isLoggedIn &&
          <div className="row">
            <Register auth={this.props.auth} />
            <Login auth={this.props.auth} />
          </div> }

          <section className="row">
            <div className="col-md-12">
              <h2>Impresszum</h2>
              <p> Adminisztrátor: László Tamás &lt;tlaszlods [kukac] gmail [pont] com&gt; </p>
              <p> Támogatott böngészők: Google Chrome, Mozilla Firefox, Chrome for Android </p>
              <p> Tárhelyszolgáltató: <a href="https://www.heroku.com/">Heroku</a> </p>
              <p>
                A logót <a href="http://www.flaticon.com/authors/simpleicon" title="SimpleIcon">SimpleIcon</a> készítette a <a href="http://www.flaticon.com" title="Flaticon">flaticon.com</a>-ról <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC 3.0 BY</a> licence alatt.
              </p>
              <p>
                A weboldal 2017-ben készült mint szakdolgozat az ELTE IK programtervező informatikus Bsc szakon.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  auth: React.PropTypes.object,
  route: React.PropTypes.object,
};
