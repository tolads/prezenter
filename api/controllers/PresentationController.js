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
    const name = req.param('newPresentationName');

    if (!name) {
      return res.badRequest({
        success: false,
        errors: 'Prezentáció nevének megadása kötelező.',
      });
    }

    Presentations.findOne({
      name,
      owner: req.session.me,
    })
      .then((presentation) => {
        if (presentation !== undefined) {
          return res.badRequest({
            success: false,
            errors: 'Ilyen nevű prezentációd már van.',
          });
        }

        Presentations.create({
          name,
          desc: req.param('newPresentationDesc') || '',
          owner: req.session.me,
        })
          .then(() => res.ok('Prezentáció sikeresen létrehozva.'))
          .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },

  /**
   * `PresentationController.delete()`
   */
  delete: (req, res) => {
    const id = req.param('id');

    if (!id) {
      return res.badRequest({
        success: false,
      });
    }

    Presentations.findOne({
      id,
      owner: req.session.me,
    })
      .then((presentation) => {
        if (presentation === undefined) {
          return res.badRequest({
            success: false,
          });
        }

        Presentations.destroy({
          id,
          owner: req.session.me,
        })
          .then(() => res.ok({ success: 'Prezentáció törölve.' }))
          .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },

  /**
   * `PresentationController.list()`
   */
  list: (req, res) => {
    Presentations.find({
      owner: req.session.me,
    })
      .then((presentations) => {
        const presentationList = presentations.map(presentation => ({
          id: presentation.id,
          name: presentation.name,
          desc: presentation.desc,
          date: presentation.createdAt,
          modified: presentation.createdAt,
        }));

        return res.ok(presentationList);
      })
      .catch(err => res.negotiate(err));
  },
};
