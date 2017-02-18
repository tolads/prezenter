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
    req.wantsJSON = true;
    let hasError = false;
    const errors = {};

    if (req.param('newGroupName') === undefined || req.param('newGroupName') === '') {
      return res.badRequest({
        success: false,
        errors: 'Csoportnév megadása kötelező.',
      });
    }

    Groups.findOne({
      name: req.param('newGroupName'),
      owner: req.session.me,
    }).exec((err, group) => {
      if (err) return res.negotiate(err);

      if (group !== undefined) {
        return res.badRequest({
          success: false,
          errors: 'Ilyen nevű csoportod már van.',
        });
      }

      Groups.create({
        name: req.param('newGroupName'),
        owner: req.session.me,
      }, (err, group) => {
        if (err) return res.negotiate(err);

        return res.ok('Csoport sikeresen létrehozva.');
      });
    });
  },

  /**
   * `GroupController.add()`
   */
  add: (req, res) => {
    req.wantsJSON = true;

    if (req.param('addToGroup') === undefined ||
        req.param('userIDs') === undefined) {
      return res.badRequest({
        success: false,
      });
    }

    let userIDs = req.param('userIDs');
    if (typeof userIDs === 'string') {
      userIDs = [userIDs];
    }

    Groups.findOne({
      id: req.param('addToGroup'),
      owner: req.session.me,
    }).exec((err, group) => {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.badRequest({
          success: false,
        });
      }

      const userCount = userIDs.length;
      let counter = 0;
      userIDs.forEach((userId) => {
        counter++;

        Members.findOne({
          group: req.param('addToGroup'),
          user: userId,
        }).exec((err, member) => {
          if (!err && !member) {
            Members.create({
              group: req.param('addToGroup'),
              user: userId,
            }).exec((err, member) => {
              if (counter === userCount) {
                counter++;
                return res.ok({
                  success: 'Sikeres hozzáadás a csoporthoz.',
                });
              }
            });
          }

          if (counter === userCount) {
            counter++;
            return res.ok({
              success: 'Sikeres hozzáadás a csoporthoz.',
            });
          }
        });
      });
    });
  },

  /**
   * `GroupController.deleteGroup()`
   */
  deleteGroup: (req, res) => {
    req.wantsJSON = true;

    Groups.findOne({
      id: req.params.id,
      owner: req.session.me,
    }).exec((err, group) => {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.badRequest({
          success: false,
        });
      }

      Members.destroy({
        group: req.params.id,
      }).exec((err, members) => {
        if (err) return res.negotiate(err);

        Groups.destroy({
          id: req.params.id,
          owner: req.session.me,
        }).exec((err, group) => {
          if (err) return res.negotiate(err);

          return res.ok({ success: 'Csoport törölve.' });
        });
      });
    });
  },

  /**
   * `GroupController.deleteMember()`
   */
  deleteMember: (req, res) => {
    req.wantsJSON = true;

    Groups.findOne({
      id: req.params.gid,
      owner: req.session.me,
    }).exec((err, group) => {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.badRequest({
          success: false,
        });
      }

      Members.destroy({
        group: req.params.gid,
        user: req.params.uid,
      }).exec((err, members) => {
        if (err) return res.negotiate(err);

        return res.ok({ success: 'Tag törölve.' });
      });
    });
  },

  /**
   * `GroupController.list()`
   */
  list: (req, res) => {
    req.wantsJSON = true;

    Groups.find({
      owner: req.session.me,
    }).exec((err, groups) => {
      const groupList = [];
      groups.forEach((group) => {
        groupList.push({
          id: group.id,
          name: group.name,
          members: [],
        });
      });

      Members.find({}).populate('user').exec((err, members) => {
        members.forEach((member) => {
          const group = groupList.find(e => e.id === member.group);
          if (group) {
            const user = member.user;
            group.members.push({
              id: user.id,
              username: user.username,
              fullname: user.fullname,
              date: user.createdAt,
            });
          }
        });

        return res.ok(groupList);
      });
    });
  },
};
