/**
 * PresentationController
 * @description Server-side logic for managing presentations
 */

module.exports = {
  /**
   * Create new presentation
   * @event POST /presentations/new
   *   {String} newPresentationName
   *   {String} newPresentationDesc
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
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Delete presentation
   * @event GET /presentations/delete/:id
   */
  delete: (req, res) => {
    const id = req.param('id');

    if (!id) {
      return res.badRequest({ success: false });
    }

    Presentations.findOne({
      id,
      owner: req.session.me,
    })
      .then((presentation) => {
        if (presentation === undefined) {
          return res.badRequest({ success: false });
        }

        Presentations.destroy({
          id,
          owner: req.session.me,
        })
          .then(() => res.ok({ success: 'Prezentáció törölve.' }))
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * List presentations of current user
   * @event GET /presentations/list
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
      .catch(res.negotiate);
  },
};