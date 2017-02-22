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
    if (!req.param('newGroupName')) {
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
    if (!req.param('addToGroup') ||
        !req.param('userIDs')) {
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

        Users.findOne({
          id: userId,
        }).exec((err, user) => {
          if (err) return res.negotiate(err);

          if (!user) return;

          group.members.add(user.id);

          group.save((err) => {
            if (counter === userCount) {
              counter++;
              return res.ok({
                success: 'Sikeres hozzáadás a csoporthoz.',
              });
            }
          });
        });
      });
    });
  },

  /**
   * `GroupController.deleteGroup()`
   */
  deleteGroup: (req, res) => {
    if (!req.param('id')) {
      return res.badRequest({
        success: false,
      });
    }

    Groups.findOne({
      id: req.param('id'),
      owner: req.session.me,
    }).exec((err, group) => {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.badRequest({
          success: false,
        });
      }

      Groups.destroy({
        id: req.param('id'),
        owner: req.session.me,
      }).exec((err, group) => {
        if (err) return res.negotiate(err);

        return res.ok({ success: 'Csoport törölve.' });
      });
    });
  },

  /**
   * `GroupController.deleteMember()`
   */
  deleteMember: (req, res) => {
    if (!req.param('gid') || !req.param('uid')) {
      return res.badRequest({
        success: false,
      });
    }

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

      group.members.remove(req.params.uid);

      group.save((err) => {
        if (err) return res.negotiate(err);

        return res.ok({ success: 'Tag törölve.' });
      });
    });
  },

  /**
   * `GroupController.list()`
   */
  list: (req, res) => {
    Groups.find({
      owner: req.session.me,
    }).populate('members').exec((err, groups) => {
      const groupList = [];

      groups.forEach((group) => {
        const newGroup = {
          id: group.id,
          name: group.name,
          members: [],
        };

        group.members.forEach((member) => {
          newGroup.members.push({
            id: member.id,
            username: member.username,
            fullname: member.fullname,
            date: member.createdAt,
          });
        });

        groupList.push(newGroup);
      });

      return res.ok(groupList);
    });
  },

  /**
   * `GroupController.rename()`
   */
  rename: (req, res) => {
    if (!req.param('id') || !req.param('name')) {
      return res.badRequest({
        success: false,
        errors: 'Csoport azonosítójának és új nevének megadása kötelező.',
      });
    }

    Groups.findOne({
      id: req.param('id'),
      owner: req.session.me,
    }).exec((err, group) => {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.badRequest({
          success: false,
          errors: 'A csoport nem létezik.',
        });
      }

      Groups.update(
        { id: req.param('id') },
        { name: req.param('name') }
      ).exec((err, group) => {
        if (err) return res.negotiate(err);

        return res.ok({ success: 'Csoport sikeresen átnevezve.' });
      });
    });
  },
};
