/**
 * PresentationService
 * @description Socket based presentation handling
 */

/** @type Map {Number} { {Number} group,
 *                       {String} head,
 *                       {Number} currentSlide
 *                       {Number} start } */
const currentlyPlayed = new Map();

/**
   * Establish connection to a projection
   * called in handleConnect
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {String} socketID
   *   {String} role
   *   {String} id
   *   {Object} presentation
   */
const establishConnection = ({ req, res, socketID, role, id, presentation }) => {
  const pid = presentation.id;

  sails.log.verbose(`Socket with id '${socketID}' connected to projection '${id}' as ${role.toUpperCase()}`);
  sails.sockets.join(req, `p${id}`);
  if (role !== 'head') sails.sockets.join(req, `p${id}_${role}s`);

  return res.ok({
    role,
    name: presentation.name,
    currentSlide: presentation.content[currentlyPlayed.get(pid).currentSlide],
    currentSlideID: currentlyPlayed.get(pid).currentSlide,
  });
};

/**
   * Check validity of a post from a built in app
   * called in form and messageBoard
   * @param {Object} options
   *   {Object} req
   *   {Number} pid
   *   {String} app
   */
const checkPostValidity = ({ req, pid, app }) => (
  new Promise((resolve, reject) => {
    if (!currentlyPlayed.has(pid)) {
      return reject();
    }

    const gid = currentlyPlayed.get(pid).group;

    sails.io.sockets.in(`p${pid},${gid}`).clients((_, clients) => {
      if (!clients.some(id => id === req.socket.conn.id)) {
        return reject();
      }

      Presentations.findOne({
        id: pid,
      })
        .then((presentation) => {
          if (presentation === undefined) {
            return reject();
          }

          const pContent = presentation.content;
          if (!pContent ||
              !pContent[currentlyPlayed.get(pid).currentSlide] ||
              !(pContent[currentlyPlayed.get(pid).currentSlide].app === app)) {
            return reject();
          }

          return resolve(pContent);
        })
        .catch(reject);
    });
  })
);

module.exports = {
  /**
   * Handle connection to a projection
   * called in PresentationController.get
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {Number} gid
   *   {Object} presentation
   *   {Object} group
   */
  handleConnect: ({ req, res, gid, presentation, group }) => {
    const pid = presentation.id;
    const id = `${pid},${gid}`;
    const socketID = req.socket.conn.id;

    if (!presentation.content || !presentation.content.length) {
      return res.badRequest({});
    }

    // my presentation
    if (presentation.owner === req.session.me) {
      // return PROJECTOR role
      if (currentlyPlayed.has(pid)) {
        if (currentlyPlayed.get(pid).group !== gid) {
          return res.badRequest({
            error: 'Egy prezentációt egyszerre csak egy csoportnak játszhatsz le!',
          });
        }

        return establishConnection({ req, res, socketID, role: 'projector', id, presentation });
      }

      if (gid !== -1 && gid !== -2 && group.owner !== req.session.me) {
        return res.badRequest({});
      }

      currentlyPlayed.set(pid,
        { group: gid, head: socketID, currentSlide: 0, start: new Date().getTime() });

      // return HEAD role
      return establishConnection({ req, res, socketID, role: 'head', id, presentation });
    }

    // not mine presentation
    if (!currentlyPlayed.has(pid)) {
      return res.badRequest({
        error: 'A prezentáció jelenleg nem aktív.',
      });
    }

    if (gid === -2 || (gid !== -1 && !group.members.some(member => member.id === req.session.me))) {
      return res.badRequest({
        error: 'A prezenetáció megtekintéséhez nincs jogosultságod.',
      });
    }

    // return SPECTATOR role
    return establishConnection({ req, res, socketID, role: 'spectator', id, presentation });
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
      return res.badRequest({});
    }

    Presentations.findOne({
      id: pid,
    })
      .then((presentation) => {
        if (presentation === undefined || id < 0 || id >= presentation.content.length) {
          return res.badRequest({});
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
    checkPostValidity({ req, pid, app: 'messageboard' })
      .then(() => {
        const gid = currentlyPlayed.get(pid).group;

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
                const messageList = messages.map(msg => msg.content.message);

                sails.sockets.broadcast(
                  currentlyPlayed.get(pid).head, 'messageboard', { messageList });
                sails.sockets.broadcast(
                  `p${pid},${gid}_projectors`, 'messageboard', { messageList });

                return res.ok({});
              })
              .catch(res.negotiate);
          })
          .catch(res.negotiate);
      })
      .catch(() => res.badRequest({}));
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
    checkPostValidity({ req, pid, app: 'form' })
      .then((pContent) => {
        const rContent = {
          user: req.session.me,
          inputs: [],
        };

        pContent[currentlyPlayed.get(pid).currentSlide].inputs.forEach((input, ind) => {
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
              return res.badRequest({});
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
                    const dataList = datas.map(({ content }) => content);

                    sails.sockets.broadcast(currentlyPlayed.get(pid).head, 'form', { dataList });

                    return res.ok({});
                  })
                  .catch(res.negotiate);
              })
              .catch(res.negotiate);
          })
          .catch(res.negotiate);
      })
      .catch(() => res.badRequest({}));
  },
};
