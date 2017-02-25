/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 */

module.exports = {
  /**
   * `GroupController.new()`
   */
  new: (req, res) => {
    const name = req.param('newGroupName');

    if (!name) {
      return res.badRequest({
        success: false,
        errors: 'Csoportnév megadása kötelező.',
      });
    }

    Groups.findOne({
      name,
      owner: req.session.me,
    })
      .then((group) => {
        if (group !== undefined) {
          return res.badRequest({
            success: false,
            errors: 'Ilyen nevű csoportod már van.',
          });
        }

        Groups.create({
          name,
          owner: req.session.me,
        })
          .then(() => res.ok('Csoport sikeresen létrehozva.'))
          .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },

  /**
   * `GroupController.add()`
   */
  add: (req, res) => {
    const addToGroup = req.param('addToGroup');
    const paramUserIDs = req.param('userIDs');
    const userIDs = typeof paramUserIDs === 'string' ? [paramUserIDs] : paramUserIDs;

    if (!addToGroup || !paramUserIDs) {
      return res.badRequest({
        success: false,
      });
    }

    Groups.findOne({
      id: addToGroup,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({
            success: false,
          });
        }

        const memberAddings = userIDs.map((userID) => (
          new Promise((resolve, reject) => {
            Users.findOne({
              id: userID,
            })
              .then((user) => {
                if (!user) return resolve();

                group.members.add(user.id);

                resolve();
              })
              .catch(err => reject(err));
          })
        ));
        Promise.all(memberAddings)
          .then(() => {
            group.save()
              .then(() => res.ok({ success: 'Sikeres hozzáadás a csoporthoz.' }))
              .catch(err => res.negotiate(err));
          })
          .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },

  /**
   * `GroupController.deleteGroup()`
   */
  deleteGroup: (req, res) => {
    const groupID = req.param('id');

    if (!groupID) {
      return res.badRequest({
        success: false,
      });
    }

    Groups.findOne({
      id: groupID,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({
            success: false,
          });
        }

        Groups.destroy({
          id: groupID,
          owner: req.session.me,
        })
          .then(() => res.ok({ success: 'Csoport törölve.' }))
          .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },

  /**
   * `GroupController.deleteMember()`
   */
  deleteMember: (req, res) => {
    const gid = req.param('gid');
    const uid = req.param('uid');

    if (!gid || !uid) {
      return res.badRequest({
        success: false,
      });
    }

    Groups.findOne({
      id: gid,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({
            success: false,
          });
        }

        group.members.remove(uid);

        group.save()
          .then(() => res.ok({ success: 'Tag törölve.' }))
          .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },

  /**
   * `GroupController.list()`
   */
  list: (req, res) => {
    Groups.find({
      owner: req.session.me,
    }).populate('members')
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
      .catch(err => res.negotiate(err));
  },

  /**
   * `GroupController.rename()`
   */
  rename: (req, res) => {
    const groupID = req.param('id');
    const groupName = req.param('name');

    if (!groupID || !groupName) {
      return res.badRequest({
        success: false,
        errors: 'Csoport azonosítójának és új nevének megadása kötelező.',
      });
    }

    Groups.findOne({
      id: groupID,
      owner: req.session.me,
    })
      .then((group) => {
        if (group === undefined) {
          return res.badRequest({
            success: false,
            errors: 'A csoport nem létezik.',
          });
        }

        Groups.update(
          { id: groupID },
          { name: groupName }
        ).then(() => res.ok({ success: 'Csoport sikeresen átnevezve.' }))
         .catch(err => res.negotiate(err));
      })
      .catch(err => res.negotiate(err));
  },
};
