/**
 * PresentationService
 * @description Socket based presentation handling
 */

/** @type Map {Number} { {Number} group,
 *                       {String} head,
 *                       {Number} currentSlide
 *                       {Date} start } */
const currentlyPlayed = new Map();

module.exports = {
  /**
   * Handle connection to a projection
   * called in PresentationController.get
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {Number} pid
   *   {Number} gid
   *   {Object} presentation
   *   {Object} group
   */
  handleConnect: ({ req, res, pid, gid, presentation, group }) => {
    const id = `${pid},${gid}`;

    if (!presentation.content || !presentation.content.length) {
      return res.badRequest({ success: false });
    }

    // my presentation
    if (presentation.owner === req.session.me) {
      // return PROJECTOR role
      if (currentlyPlayed.has(pid)) {
        if (currentlyPlayed.get(pid).group !== gid) {
          return res.badRequest({ success: false });
        }

        sails.log.verbose(`Socket with id '${req.socket.conn.id}' connected to projection '${id}' as PROJECTOR`);
        sails.sockets.join(req, `p${id}`);
        sails.sockets.join(req, `p${id}_projectors`);

        return res.ok({
          role: 'projector',
          name: presentation.name,
          currentSlide: presentation.content[currentlyPlayed.get(pid).currentSlide],
          currentSlideID: currentlyPlayed.get(pid).currentSlide,
        });
      }

      if (gid !== -1 && gid !== -2 && group.owner !== req.session.me) {
        return res.badRequest({ success: false });
      }

      currentlyPlayed.set(pid,
        { group: gid, head: req.socket.conn.id, currentSlide: 0, start: new Date() });

      // return HEAD role
      sails.log.verbose(`Socket with id '${req.socket.conn.id}' connected to projection '${id}' as HEAD`);
      sails.sockets.join(req, `p${id}`);

      return res.ok({
        role: 'head',
        name: presentation.name,
        currentSlide: presentation.content[0],
        currentSlideID: 0,
      });
    }

    // not mine presentation
    if (!currentlyPlayed.has(pid)) {
      return res.badRequest({
        success: false,
        error: 'A prezenetáció jelenleg nem aktív.',
      });
    }

    if (gid === -2 || (gid !== -1 && !group.members.some(({ id }) => id === req.session.me))) {
      return res.badRequest({
        success: false,
        error: 'A prezenetáció megtekintéséhez nincs jogosultságod.',
      });
    }

    // return SPECTATOR role
    sails.log.verbose(`Socket with id '${req.socket.conn.id}' connected to projection '${id}' as SPECTATOR`);
    sails.sockets.join(req, `p${id}`);
    sails.sockets.join(req, `p${id}_spectators`);

    return res.ok({
      role: 'spectator',
      name: presentation.name,
      currentSlide: presentation.content[currentlyPlayed.get(pid).currentSlide],
      currentSlideID: currentlyPlayed.get(pid).currentSlide,
    });
  },

  /**
   * Close projection if HEAD disconnected
   * called in config.sockets.afterDisconnect
   * @param {Object} options
   *   {String} referer
   *   {String} socketID
   */
  handleDisconnect: ({ referer, socketID }) => {
    const page = referer.match(/.*\/(presentations\/play\/([0-9]+)\/(-?[0-9]+))\/?$/);

    if (page) {
      sails.log.verbose(`Socket with id '${socketID}' disconnected`);
      const pid = parseInt(page[2], 10);

      if (currentlyPlayed.has(pid) && currentlyPlayed.get(pid).head === socketID) {
        sails.log.verbose(`Projection '${page[1]}' closed\n`);
        currentlyPlayed.delete(pid);
      }
    }
  },

  /**
   * List active presentations for user
   * called in PresentationController.listActive
   * @param {Object} options
   *   {Object} res
   *   {Number[]} memberships
   */
  listActive: ({ res, memberships }) => {
    const presentations = [];

    const selects = [];
    currentlyPlayed.forEach((value, key) => {
      if (value.group === -1 || memberships.has(value.group)) {
        selects.push(new Promise((resolve, reject) => {
          Presentations.findOne({
            id: key,
          }).populate('owner')
            .then((presentation) => {
              if (presentation === undefined) {
                return reject();
              }

              presentations.push({
                pid: key,
                gid: value.group,
                name: presentation.name,
                desc: presentation.desc,
                owner: presentation.owner.username,
              });

              resolve();
            })
            .catch(reject);
        }));
      }
    });

    Promise.all(selects)
      .then(() => res.ok(presentations))
      .catch(res.negotiate);
  },

  /**
   * Get a slide from a presentation
   * called in PresentationController.getSlide
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {Number} pid
   *   {Number} id
   */
  getSlide: ({ req, res, pid, id }) => {
    if (!currentlyPlayed.has(pid) || currentlyPlayed.get(pid).head !== req.socket.conn.id) {
      return res.badRequest({ success: false });
    }

    Presentations.findOne({
      id: pid,
    })
      .then((presentation) => {
        if (presentation === undefined) {
          return res.badRequest({ success: false });
        }

        if (id < 0 || id >= presentation.content.length) {
          return res.badRequest({ success: false });
        }

        currentlyPlayed.get(pid).currentSlide = id;
        const gid = currentlyPlayed.get(pid).group;
        sails.sockets.broadcast(`p${pid},${gid}`, 'newSlide', {
          currentSlide: presentation.content[id],
          currentSlideID: id,
        });

        return res.ok({});
      })
      .catch(res.negotiate);
  },

  /**
   * Handle posts from MessageBoard
   * called in PresentationController.app
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {Number} pid
   *   {String} message
   */
  messageBoard: ({ req, res, pid, message }) => {
    if (!currentlyPlayed.has(pid)) {
      return res.badRequest({ success: false });
    }

    const gid = currentlyPlayed.get(pid).group;

    sails.io.sockets.in(`p${pid},${gid}`).clients((_, clients) => {
      if (!clients.some(id => id === req.socket.conn.id)) {
        return res.badRequest({ success: false });
      }

      Presentations.findOne({
        id: pid,
      })
        .then((presentation) => {
          if (presentation === undefined) {
            return res.badRequest({ success: false });
          }

          const content = presentation.content;
          if (!content ||
              !content[currentlyPlayed.get(pid).currentSlide] ||
              !(content[currentlyPlayed.get(pid).currentSlide].app === 'messageboard')) {
            return res.badRequest({ success: false });
          }

          Reports.create({
            app: 'messageboard',
            start: currentlyPlayed.get(pid).start,
            presentation: pid,
            slide: currentlyPlayed.get(pid).currentSlide,
            content: { message },
          })
            .then(() => {
              Reports.find({
                app: 'messageboard',
                start: currentlyPlayed.get(pid).start,
                presentation: pid,
                slide: currentlyPlayed.get(pid).currentSlide,
              })
                .then((messages) => {
                  const messageList = messages.map(message => message.content.message);

                  sails.sockets.broadcast(currentlyPlayed.get(pid).head, 'messageboard', { messageList });
                  sails.sockets.broadcast(`p${pid},${gid}_projectors`, 'messageboard', { messageList });

                  return res.ok({});
                })
                .catch(res.negotiate);
            })
            .catch(res.negotiate);
        })
        .catch(res.negotiate);
    });
  },

   /**
   * Handle posts from Form
   * called in PresentationController.app
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {Number} pid
   *   {Object} data
   */
  form: ({ req, res, pid, data }) => {
    if (!currentlyPlayed.has(pid)) {
      return res.badRequest({ success: false });
    }

    const gid = currentlyPlayed.get(pid).group;

    sails.io.sockets.in(`p${pid},${gid}`).clients((_, clients) => {
      if (!clients.some(id => id === req.socket.conn.id)) {
        return res.badRequest({ success: false });
      }

      Presentations.findOne({
        id: pid,
      })
        .then((presentation) => {
          if (presentation === undefined) {
            return res.badRequest({ success: false });
          }

          const pContent = presentation.content;
          if (!pContent ||
              !pContent[currentlyPlayed.get(pid).currentSlide] ||
              !(pContent[currentlyPlayed.get(pid).currentSlide].app === 'form')) {
            return res.badRequest({ success: false });
          }

          const rContent = {
            user: req.session.me,
            inputs: [],
          };

          pContent[currentlyPlayed.get(pid).currentSlide].inputs.forEach((input, ind) => {
            console.log(ind, input, input.options, input.options[`input${ind}`]);
            rContent.inputs.push({
              question: input.label,
              answer: input.options[data[`input${ind}`]],
            });
          });

          Reports.find({
            app: 'form',
            start: currentlyPlayed.get(pid).start,
            presentation: pid,
            slide: currentlyPlayed.get(pid).currentSlide,
          })
            .then((reports) => {
              if (reports.some(report => report.content.user === req.session.me)) {
                return res.badRequest({ success: false });
              }

              // create report
              Reports.create({
                app: 'form',
                start: currentlyPlayed.get(pid).start,
                presentation: pid,
                slide: currentlyPlayed.get(pid).currentSlide,
                content: rContent,
              })
                .then(() => {
                  Reports.find({
                    app: 'form',
                    start: currentlyPlayed.get(pid).start,
                    presentation: pid,
                    slide: currentlyPlayed.get(pid).currentSlide,
                  })
                    .then((datas) => {
                      const dataList = datas.map(data => data.content);

                      sails.sockets.broadcast(currentlyPlayed.get(pid).head, 'form', { dataList });

                      return res.ok({});
                    })
                    .catch(res.negotiate);
                })
                .catch(res.negotiate);
            })
            .catch(res.negotiate);
        })
        .catch(res.negotiate);
    });
  },
};
