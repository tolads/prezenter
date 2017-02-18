import React from 'react';

export default function NotFound() {
  return (
    <div className="container error-page">
      <div className="jumbotron">
        <h1> 404 </h1>
        <h2> A keresett oldal nem található :( </h2>
        <p>
          <a className="btn btn-lg btn-primary" href="/" role="button"> Vissza a kezdőlapra &gt;&gt; </a>
        </p>
      </div>
    </div>
  );
}
