/**
 * GroupController
 * @description Server-side logic for managing groups
 */

module.exports = {
  /**
   * Create new group
   * @event POST /groups/new
   *   {String} newGroupName
   */
  new: (req, res) => {
    const name = typeof req.param('newGroupName') === 'string'
      ? req.param('newGroupName').trim() : '';

    if (!name) {
      return res.badRequest({
        errors: 'Csoportnév megadása kötelező.',
      });
    }

    if (name.length > 127) {
      return res.badRequest({
        errors: 'A csoportnév nem lehet hosszabb 127 karakternél.',
      });
    }

    Groups.findOne({
      name,
      owner: req.session.me,
    })
      .then((group) => {
        if (group !== undefined) {
          return res.badRequest({
            errors: 'Ilyen nevű csoportod már van.',
          });
        }

        Groups.create({
          name,
          owner: req.session.me,
        })
          .then(() => res.ok({ success: 'Csoport sikeresen létrehozva.' }))
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Add new members to group
   * @event POST /groups/add
   *   {String} addToGroup
   *   {(String|String[])} userIDs[]
   */
  add: (req, res) => {
    const addToGroup = req.param('addToGroup');
    const paramUserIDs = req.param('userIDs[]');
    const userIDs = typeof paramUserIDs === 'string' ? [paramUserIDs] : paramUserIDs;

    if (!addToGroup || !paramUserIDs) {
      return res.badRequest({});
    }

    Groups.findOne({
      id: addToGroup,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({});
        }

        const memberAddings = userIDs.map(userID => (
          new Promise((resolve, reject) => {
            Users.findOne({
              id: userID,
            })
              .then((user) => {
                if (!user) return resolve();

                group.members.add(user.id);

                resolve();
              })
              .catch(reject);
          })
        ));

        Promise.all(memberAddings)
          .then(() => {
            group.save()
              .then(() => res.ok({ success: 'Sikeres hozzáadás a csoporthoz.' }))
              .catch(res.negotiate);
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Delete group
   * @event DELETE /groups/group/:id
   */
  deleteGroup: (req, res) => {
    const groupID = req.param('id');

    if (!groupID) {
      return res.badRequest({});
    }

    Groups.findOne({
      id: groupID,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({});
        }

        Groups.destroy({
          id: groupID,
          owner: req.session.me,
        })
          .then(() => res.ok({ success: 'Csoport törölve.' }))
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * Delete member from a group
   * @event DELETE /groups/group/:gid/member/:uid
   */
  deleteMember: (req, res) => {
    const gid = req.param('gid');
    const uid = req.param('uid');

    if (!gid || !uid) {
      return res.badRequest({});
    }

    Groups.findOne({
      id: gid,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({});
        }

        group.members.remove(uid);

        group.save()
          .then(() => res.ok({ success: 'Tag törölve.' }))
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * List groups of current user
   * @event GET /groups/list
   */
  list: (req, res) => {
    Groups.find({
      owner: req.session.me,
    }).populate('members')
      .sort('name ASC')
      .then((groups) => {
        const groupList = groups.map(group => ({
          id: group.id,
          name: group.name,
          members: group.members.map(member => ({
            id: member.id,
            username: member.username,
            fullname: member.fullname,
            date: member.createdAt,
          })),
        }));

        return res.ok(groupList);
      })
      .catch(res.negotiate);
  },

  /**
   * Rename group
   * @event POST /groups/rename
   *   {Number} id
   *   {String} name
   */
  rename: (req, res) => {
    const groupID = req.param('id');
    const groupName = typeof req.param('name') === 'string' ? req.param('name').trim() : '';

    if (!groupID || !groupName) {
      return res.badRequest({
        errors: 'Csoport azonosítójának és új nevének megadása kötelező.',
      });
    }

    if (groupName.length > 127) {
      return res.badRequest({
        errors: 'A csoportnév nem lehet hosszabb 127 karakternél.',
      });
    }

    Groups.findOne({
      id: groupID,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({
            errors: 'A csoport nem létezik.',
          });
        }

        Groups.findOne({
          name: groupName,
          owner: req.session.me,
        })
          .then((newGroup) => {
            if (newGroup !== undefined && String(newGroup.id) !== groupID) {
              return res.badRequest({
                errors: 'Ezzel a névvel van már csoportod.',
              });
            }

            Groups.update(
              { id: groupID },
              { name: groupName })
              .then(() => res.ok({ success: 'Csoport sikeresen átnevezve.' }))
              .catch(res.negotiate);
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },
};
