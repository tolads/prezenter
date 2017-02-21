/**
 * PresentationController
 *
 * @description :: Server-side logic for managing presentations
 */

module.exports = {
  /**
   * `PresentationController.new()`
   */
  new: (req, res) => {
    if (!req.param('newPresentationName')) {
      return res.badRequest({
        success: false,
        errors: 'Prezentáció nevének megadása kötelező.',
      });
    }

    Presentations.findOne({
      name: req.param('newPresentationName'),
      owner: req.session.me,
    }).exec((err, presentation) => {
      if (err) return res.negotiate(err);

      if (presentation !== undefined) {
        return res.badRequest({
          success: false,
          errors: 'Ilyen nevű prezentációd már van.',
        });
      }

      const desc = req.param('newPresentationDesc') || '';

      Presentations.create({
        name: req.param('newPresentationName'),
        desc,
        owner: req.session.me,
      }, (err, presentation) => {
        if (err) return res.negotiate(err);

        return res.ok('Prezentáció sikeresen létrehozva.');
      });
    });
  },

  /**
   * `PresentationController.delete()`
   */
  delete: (req, res) => {
    if (!req.param('id')) {
      return res.badRequest({
        success: false,
      });
    }

    Presentations.findOne({
      id: req.param('id'),
      owner: req.session.me,
    }).exec((err, presentation) => {
      if (err) return res.negotiate(err);

      if (presentation === undefined) {
        return res.badRequest({
          success: false,
        });
      }

      Presentations.destroy({
        id: req.param('id'),
        owner: req.session.me,
      }).exec((err, group) => {
        if (err) return res.negotiate(err);

        return res.ok({ success: 'Prezentáció törölve.' });
      });
    });
  },

  /**
   * `PresentationController.list()`
   */
  list: (req, res) => {
    Presentations.find({
      owner: req.session.me,
    }).exec((err, presentations) => {
      const presentationList = [];

      presentations.forEach((presentation) => {
        const newPresentation = {
          id: presentation.id,
          name: presentation.name,
          desc: presentation.desc,
          date: presentation.createdAt,
          modified: presentation.createdAt,
        };

        presentationList.push(newPresentation);
      });

      return res.ok(presentationList);
    });
  },
};
