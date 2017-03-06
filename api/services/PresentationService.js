/**
 * PresentationService
 * @description Socket based presentation handling
 */

/** @type Map {Number} { {Number} group, {String} socket, {Number} currentSlide } */
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

    if (!presentation.content || !presentation.content.slides) {
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
        sails.sockets.join(req, `p${pid}`);
        return res.ok({
          role: 'projector',
          name: presentation.name,
          currentSlide: presentation.content.slides[currentlyPlayed.get(pid).currentSlide],
          currentSlideID: currentlyPlayed.get(pid).currentSlide,
        });
      }

      if (gid !== -1 && gid !== -2 && group.owner !== req.session.me) {
        return res.badRequest({ success: false });
      }

      if (gid !== -2) {
        currentlyPlayed.set(pid,
          { group: gid, socket: req.socket.conn.id, currentSlide: 0 });
      }
      // return HEAD role
      sails.log.verbose(`Socket with id '${req.socket.conn.id}' connected to projection '${id}' as HEAD`);
      sails.sockets.join(req, `p${pid}`);
      return res.ok({
        role: 'head',
        name: presentation.name,
        content: presentation.content,
        currentSlide: presentation.content.slides[0],
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

    if (gid !== -1 && !group.members.some(({ id }) => id === req.session.me)) {
      return res.badRequest({
        success: false,
        error: 'A prezenetáció megtekintéséhez nincs jogosultságod.',
      });
    }

    // return SPECTATOR role
    sails.log.verbose(`Socket with id '${req.socket.conn.id}' connected to projection '${id}' as SPECTATOR`);
    sails.sockets.join(req, `p${pid}`);
    return res.ok({
      role: 'spectator',
      name: presentation.name,
      currentSlide: presentation.content.slides[currentlyPlayed.get(pid).currentSlide],
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

      if (currentlyPlayed.has(pid) && currentlyPlayed.get(pid).socket === socketID) {
        sails.log.verbose(`Projection '${page[1]}' closed\n`);
        currentlyPlayed.delete(pid);
        sails.sockets.removeRoomMembersFromRooms(`p${pid}`, `p${pid}`);
      }
    }
  },

  /**
   * List active presentations for user
   * called in PresentationController.listActive
   * @param {Object} options
   *   {Object} req
   *   {Object} res
   *   {Number[]} memberships
   */
  listActive: ({ req, res, memberships }) => {
    const presentations = [];

    const selects = [];
    currentlyPlayed.forEach((value, key) => {
      if (value.group === -1 || memberships.has(value.group)) {
        selects.push(new Promise((resolve, reject) => {
          Presentations.findOne({
            id: key,
          }).populate('owner')
            .then((presentation) => {
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
    if (!currentlyPlayed.has(pid) || currentlyPlayed.get(pid).socket !== req.socket.conn.id) {
      return res.badRequest({ success: false });
    }

    Presentations.findOne({
      id: pid,
    })
      .then((presentation) => {
        if (id < 0 || id >= presentation.content.slides.length) {
          return res.badRequest({ success: false });
        }

        currentlyPlayed.get(pid).currentSlide = id;
        sails.sockets.broadcast(`p${pid}`, 'newSlide', {
          currentSlide: presentation.content.slides[id],
          currentSlideID: id,
        });

        return res.ok({});
      })
      .catch(res.negotiate);
  },
};
