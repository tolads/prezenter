/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 */

module.exports = {

  /**
   * `HomeController.index()`
   */
  index: function (req, res) {
    if (req.session.me) {
      return res.view('index_user', {
        loggedin: true,
        current_page: 'index'
      });
    }
    return res.view('homepage');
  },

  /**
   * `HomeController.users()`
   */
  groups: function (req, res) {
    User.find({}).exec(function(err, users) {
      const user_list = [];
      for (const user in users) {
        user_list.push({
          id: users[user].id,
          username: users[user].username,
          fullname: users[user].fullname,
          date: users[user].createdAt
        })
      }

      Groups.find({
        owner: req.session.me
      }).exec(function(err, groups) {
        const group_list = [];
        for (const group in groups) {
          group_list.push({
            id: groups[group].id,
            name: groups[group].name,
            members: []
          })
        }

        Members.find({}).populate('user').exec(function(err, members) {
          for (const member in members) {
            const group = group_list.find(e => e.id === members[member].group)
            if (group) {
              const user = members[member].user;
              group.members.push({
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                date: user.createdAt
              });
            }
          }

          return res.view('groups', {
            loggedin: true,
            current_page: 'groups',
            user_list,
            group_list
          });
        });
      });
    });
  }
};
