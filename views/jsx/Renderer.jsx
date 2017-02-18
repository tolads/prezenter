import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Application from './Application';
import Home from './Home';
import Groups from './Groups';
import NotFound from './NotFound';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Application}>
      <IndexRoute component={Home} />
      <Route path="groups" component={Groups} />
    </Route>
    <Route path="*" component={NotFound} />
  </Router>,
  document.getElementById('root')
);
