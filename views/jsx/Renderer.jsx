import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Auth from './Auth';
import Page from './Page';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import PresentationsOwn from './pages/PresentationsOwn';
import PresentationsEdit from './pages/PresentationsEdit';
import NotFound from './pages/NotFound';

const title = document.title;

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Auth}>
      <Route component={Page}>
        <IndexRoute component={Home} title={title} />
        <Route path="profile" component={Profile} title={title} />
        <Route path="groups" component={Groups} title={title} />
        <Route path="presentations/own" component={PresentationsOwn} title={title} />
        <Route path="presentations/edit/:id" component={PresentationsEdit} title={title} />
      </Route>
    </Route>
    <Route path="*" component={NotFound} title={title} />
  </Router>,
  document.getElementById('root')
);
