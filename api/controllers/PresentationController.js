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
    const name = typeof req.param('newPresentationName') === 'string'
      ? req.param('newPresentationName').trim() : '';

    if (!name) {
      return res.badRequest({
        errors: 'Prezentáció nevének megadása kötelező.',
      });
    }

    if (name.length > 127) {
      return res.badRequest({
        errors: 'A prezentáció neve nem lehet hosszabb 127 karakternél.',
      });
    }

    Presentations.findOne({
      name,
      owner: req.session.me,
    })
      .then((presentation) => {
        if (presentation !== undefined) {
          return res.badRequest({
            errors: 'Ilyen nevű prezentációd már van.',
          });
        }

        Presentations.create({
          name,
          desc: req.param('newPresentationDesc') || '',
          owner: req.session.me,
        })
          .then(() => res.ok({ success: 'Prezentáció sikeresen létrehozva.' }))
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Delete presentation
   * @event DELETE /presentations/:id
   */
  delete: (req, res) => {
    const id = req.param('id');

    if (!id) {
      return res.badRequest({});
    }

    Presentations.findOne({
      id,
      owner: req.session.me,
    })
      .then((presentation) => {
        if (presentation === undefined) {
          return res.badRequest({});
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
      .populate('reports')
      .then((presentations) => {
        const presentationList = presentations.map(presentation => ({
          id: presentation.id,
          name: presentation.name,
          desc: presentation.desc,
          date: presentation.createdAt,
          modified: presentation.updatedAt,
          canBePlayed: presentation.content && presentation.content.length,
          hasReports: presentation.reports && !!presentation.reports.length,
        }));

        return res.ok(presentationList);
      })
      .catch(res.negotiate);
  },

  /**
   * Connect to a projection
   * @event GET /presentations/connect/:pid/:gid
   */
  connect: (req, res) => {
    const pid = parseInt(req.param('pid'), 10);
    const gid = parseInt(req.param('gid'), 10);

    if (!req.isSocket || isNaN(pid) || isNaN(gid)) {
      return res.badRequest({});
    }

    Presentations.findOne({
      id: pid,
    })
      .then((presentation) => {
        if (presentation === undefined) {
          return res.badRequest({});
        }

        if (gid === -1 || gid === -2) {
          return PresentationService.handleConnect(
            { req, res, pid, gid, presentation });
        }

        Groups.findOne({
          id: gid,
        }).populate('members')
          .then((group) => {
            if (group === undefined) {
              return res.badRequest({});
            }

            return PresentationService.handleConnect(
              { req, res, pid, gid, presentation, group });
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Get datas of a presentation
   * @event GET /presentations/get/:id
   */
  get: (req, res) => {
    const id = parseInt(req.param('id'), 10);

    if (isNaN(id)) {
      return res.badRequest({});
    }

    Users.find()
      .then((users) => {
        const userList = users.map(user => ({
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
        }));

        Presentations.findOne({
          id,
          owner: req.session.me,
        })
          .populate('reports')
          .then((presentation) => {
            if (presentation === undefined) {
              return res.badRequest({});
            }

            return res.ok({
              name: presentation.name,
              desc: presentation.desc,
              content: presentation.content,
              reports: presentation.reports,
              users: userList,
            });
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Get a slide from a presentation
   * @event GET /presentations/getslide/:pid/:id
   */
  getSlide: (req, res) => {
    const pid = parseInt(req.param('pid'), 10);
    const id = parseInt(req.param('id'), 10);

    if (isNaN(pid) || isNaN(id)) {
      return res.badRequest({});
    }

    return PresentationService.getSlide({ req, res, pid, id });
  },

  /**
   * Posts from built in presentation apps
   * @event GET /presentations/app/:pid/:name
   */
  app: (req, res) => {
    const pid = parseInt(req.param('pid'), 10);

    if (isNaN(pid)) {
      return res.badRequest({});
    }

    if (req.param('name') === 'messageboard') {
      const message = req.param('message');
      if (!message) {
        return res.badRequest({});
      }

      return PresentationService.messageBoard({ req, res, pid, message });
    } else if (req.param('name') === 'form') {
      const data = {};
      let i = 0;
      while (req.param(`input${i}`) !== undefined) {
        data[`input${i}`] = parseInt(req.param(`input${i}`), 10);
        i++;
      }

      return PresentationService.form({ req, res, pid, data });
    }

    return res.badRequest({});
  },

  /**
   * Edit presentation
   * @event POST /presentations/edit/:id
   *   {String} name
   *   {String} desc
   *   {String} content
   */
  edit: (req, res) => {
    const id = req.param('id');
    const name = req.param('name');
    const desc = req.param('desc') || '';
    const content = req.param('content') || '';

    if (!id || !name) {
      return res.badRequest({});
    }

    try {
      if (content) {
        JSON.parse(content);
      }
    } catch (err) {
      return res.badRequest({});
    }

    Presentations.findOne({
      id,
      owner: req.session.me,
    })
      .then((presentation) => {
        if (presentation === undefined) {
          return res.badRequest({});
        }

        Presentations.findOne({
          name,
          owner: req.session.me,
        })
          .then((otherPresentation) => {
            if (otherPresentation !== undefined && String(otherPresentation.id) !== id) {
              return res.badRequest({
                errors: 'Ezzel a névvel van már prezentációd.',
              });
            }

            Presentations.update(
              { id },
              { name, desc, content })
              .then(() => res.ok({ success: 'Sikeres mentés.' }))
              .catch(res.negotiate);
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Get active presentations available for user
   * @event GET /presentations/listactive
   */
  listActive: (req, res) => {
    Groups.find()
      .populate('members')
      .then((groups) => {
        const memberships = new Set();
        groups.forEach((group) => {
          if (group.owner === req.session.me ||
              group.members.some(({ id }) => id === req.session.me)) {
            memberships.add(group.id);
          }
        });

        return PresentationService.listActive({ req, res, memberships });
      })
      .catch(res.negotiate);
  },
};
