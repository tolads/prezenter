const sails = require('sails');

before((done) => {
  sails.lift({
  }, (err) => {
    if (err) return done(err);

    done(err, sails);
  });
});

after((done) => {
  sails.lower(done);
});
