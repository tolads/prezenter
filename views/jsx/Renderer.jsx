import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import Auth from './Auth';
import Page from './Page';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import PresentationsOwn from './pages/PresentationsOwn';
import PresentationsEdit from './pages/PresentationsEdit';
import PresentationsReport from './pages/PresentationsReport';
import PresentationsActive from './pages/PresentationsActive';
import PresentationsPlay from './pages/PresentationsPlay';
import NotFound from './pages/NotFound';

const title = document.title;

/** Render page in #root HTML element */
ReactDOM.render(
  <Router history={browserHistory}>
    <Route component={Auth}>
      <Route component={Page}>
        <Route path="/" component={Home} title={title} />
        <Route path="/profile" component={Profile} title={title} />
        <Route path="/groups" component={Groups} title={title} />
        <Route path="/presentations/own" component={PresentationsOwn} title={title} />
        <Route path="/presentations/edit/:id" component={PresentationsEdit} title={title} />
        <Route path="/presentations/report/:id" component={PresentationsReport} title={title} />
        <Route path="/presentations/active" component={PresentationsActive} title={title} />
      </Route>
      <Route path="/presentations/play/:pid/:gid" component={PresentationsPlay} title={title} />
    </Route>
    <Route path="*" component={NotFound} title={title} />
  </Router>,
  document.getElementById('root'),
);
