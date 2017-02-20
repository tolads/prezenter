import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Application from './Application';
import Home from './Home';
import Profile from './Profile';
import Groups from './Groups';
import NotFound from './NotFound';

const title = document.title;

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Application}>
      <IndexRoute component={Home} title={title} />
      <Route path="profile" component={Profile} title={title} />
      <Route path="groups" component={Groups} title={title} />
    </Route>
    <Route path="*" component={NotFound} title={title} />
  </Router>,
  document.getElementById('root')
);
