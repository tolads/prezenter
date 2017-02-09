/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 */

module.exports = {

  /**
   * `HomeController.index()`
   */
  index: (req, res) => {
    if (req.session.me) {
      return res.view('index_user', {
        loggedin: true,
        current_page: 'index',
      });
    }
    return res.view('homepage');
  },

  /**
   * `HomeController.groups()`
   */
  groups: (req, res) => {
    Users.find({}).exec((err, users) => {
      const userList = [];
      users.forEach((user) => {
        userList.push({
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
        });
      });

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

          return res.view('groups', {
            loggedin: true,
            current_page: 'groups',
            userList,
            groupList,
          });
        });
      });
    });
  },
};
