import sails from 'sails';
import Barrels from 'barrels';

before((done) => {
  sails.lift({
    log: {
      level: 'warn',
    },
    models: {
      connection: 'memory',
      migrate: 'drop',
    },
  }, (err) => {
    if (err) return done(err);

    const barrels = new Barrels();
    barrels.populate(['users', 'groups', 'presentations', 'reports'], (barrelsErr) => {
      done(barrelsErr, sails);
    });
  });
});

after((done) => {
  sails.lower(done);
});
