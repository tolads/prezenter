/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 */

module.exports = {
  /**
   * `GroupController.new()`
   */
  new: function (req, res) {
    if (req.param('new-group-name') === '') {
      req.addFlash('new-group-name', req.param('new-group-name'));
      req.addFlash('new-group-name-error', 'Csoportnév megadása kötelező.');
      return res.redirect('/groups#new');
    }

    Groups.findOne({
      name: req.param('new-group-name'),
      owner: req.session.me
    }).exec(function (err, group) {
      if (err) return res.negotiate(err);

      if (group !== undefined) {
        req.addFlash('new-group-name', req.param('new-group-name'));
        req.addFlash('new-group-name-error', 'Ilyen nevű csoportod már van.');
        return res.redirect('/groups#new');
      }

      Groups.create({
        name: req.param('new-group-name'),
        owner: req.session.me
      }, function (err, group) {
        if (err) return res.negotiate(err);

        req.addFlash('new-group-name', req.param('new-group-name'));
        req.addFlash('new-group-name-success', 'Csoport sikeresen létrehozva.');

        return res.redirect('/groups#new');
      });
    });
  },

  /**
   * `GroupController.add()`
   */
  add: function (req, res) {
    if (req.param('user_ids') === undefined) {
      return res.redirect('/groups#users');
    }

    Groups.findOne({
      id: req.param('add-to-group'),
      owner: req.session.me
    }).exec(function (err, group) {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.redirect('/groups#users');
      }

      const user_count = req.param("user_ids").length;
      let counter = 0;
      for (const user_id in req.param("user_ids")) {
        counter++;

        Members.findOne({
          group: req.param('add-to-group'),
          user: req.param('user_ids')[user_id]
        }).exec(function (err, member) {
          if (!err && !member) {
            Members.create({
              group: req.param('add-to-group'),
              user: req.param('user_ids')[user_id]
            }).exec(function (err, member) {
              if (counter === user_count) {
                counter++;
                req.addFlash('add-to-group-success', 'Sikeres hozzáadás a csoporthoz.');

                return res.redirect('/groups#users');
              }
            });
          }

          if (counter === user_count) {
            counter++;
            req.addFlash('add-to-group-success', 'Sikeres hozzáadás a csoporthoz.');

            return res.redirect('/groups#users');
          }
        });
      }
    });
  },

  /**
   * `GroupController.deleteGroup()`
   */
  deleteGroup: function (req, res) {
    Groups.findOne({
      id: req.params.id,
      owner: req.session.me
    }).exec(function (err, group) {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.redirect('/groups#groups');
      }

      Members.destroy({
        group: req.params.id
      }).exec(function (err, members) {
        if (err) return res.negotiate(err);

        Groups.destroy({
          id: req.params.id,
          owner: req.session.me
        }).exec(function (err, group) {
          if (err) return res.negotiate(err);

          req.addFlash('group-delete-success', 'Csoport törölve.');

          return res.redirect('/groups#groups');
        });
      });
    });
  },

  /**
   * `GroupController.deleteMember()`
   */
  deleteMember: function (req, res) {
    Groups.findOne({
      id: req.params.gid,
      owner: req.session.me
    }).exec(function (err, group) {
      if (err) return res.negotiate(err);

      if (group === undefined) {
        return res.redirect('/groups#groups');
      }

      Members.destroy({
        group: req.params.gid,
        user: req.params.uid
      }).exec(function (err, members) {
        if (err) return res.negotiate(err);

        req.addFlash('group-delete-success', 'Felhasználó törölve a csoportból.');

        return res.redirect('/groups#groups');
      });
    });
  }
};
