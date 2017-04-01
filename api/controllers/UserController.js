/**
 * UserController
 * @description Server-side logic for managing users
 */

module.exports = {
  /**
   * Determine if visitor is logged in
   * @event GET /users/isloggedin
   */
  isLoggedIn: (req, res) => {
    if (!req.session.me) {
      return res.ok({
        loggedin: false,
      });
    }

    Users.findOne({
      id: req.session.me,
    })
      .then(user => res.ok({ loggedin: user ? user.username : false }))
      .catch(res.negotiate);
  },

  /**
   * Log in user
   * @event POST /users/login
   *   {String} username
   *   {String} password
   */
  login: (req, res) => {
    const username = req.param('username');
    const password = req.param('password');

    if (!username || !password) {
      return res.badRequest({
        errors: 'Felhasználónév és jelszó megadása kötelező.',
      });
    }
    // See `api/responses/login.js`
    return res.login({ username, password });
  },

  /**
   * Log out user
   * @event GET /users/logout
   */
  logout: (req, res) => {
    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;

    return res.ok({ success: 'Sikeres kijelentkezés.' });
  },

  /**
   * Sign up user
   * @event POST /users/signup
   *   {String} username
   *   {String} password
   *   {String} fullname
   */
  signup: (req, res) => {
    const errors = {};
    const username = req.param('username');
    const password = req.param('password');
    const fullname = req.param('fullname');
    let hasError = false;

    if (!username) {
      hasError = true;
      errors.username_error = 'Felhasználónév megadása kötelező.';
    } else if (username.length > 63) {
      hasError = true;
      errors.username_error = 'A felhasználónév túl hosszú.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      hasError = true;
      errors.username_error = 'A felhasználónév csak az angol ABC kis- és nagybetűit, számokat és aláhúzásjelet tartalmazhat.';
    }

    if (!password) {
      hasError = true;
      errors.password_error = 'Jelszó megadása kötelező.';
    }

    if (!fullname) {
      hasError = true;
      errors.fullname_error = 'Teljes név megadása kötelező.';
    } else if (fullname.length > 127) {
      hasError = true;
      errors.fullname_error = 'A név túl hosszú.';
    } else if (!/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰäÄôÔýÝčČďĎĺĹňŇšŠťŤ_ ,.\-/()]+$/
      .test(fullname)) {
      hasError = true;
      errors.fullname_error = 'A név nem megengedett karaktert tartalmaz.';
    }

    if (hasError) {
      return res.badRequest({
        errors,
      });
    }

    Users.findOne({
      username,
    })
      .then((user) => {
        if (user !== undefined) {
          errors.username_error = 'A felhasználónév foglalt.';
          return res.badRequest({
            errors,
          });
        }

        // Attempt to signup a user using the provided parameters
        Users.signup({ username, password, fullname })
          .then((newUser) => {
            req.session.me = newUser.id;

            Presentations.create({
              name: 'Markdown minták',
              desc: 'Példák a markdown jelölések használatára prezentációban.',
              owner: newUser.id,
              content: [
                { html: '# Markdown examples' },
                { html: '# Headers\n\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n\nAlternatively, for H1 and H2, an underline-ish style:\n\nAlt-H1\n======\n\nAlt-H2\n------' },
                { html: '# Emphasis\n\nEmphasis, aka italics, with *asterisks* or _underscores_.\n\nStrong emphasis, aka bold, with **asterisks** or __underscores__.\n\nCombined emphasis with **asterisks and _underscores_**.\n\nStrikethrough uses two tildes. ~~Scratch this.~~' },
                { html: '# Lists\n\n1. First ordered list item\n2. Another item\n1. Actual numbers don\'t matter, just that it\'s a number\n4. And another item.\n\n* Unordered list can use asterisks\n- Or minuses\n+ Or pluses' },
                { html: '# Links\n\n[I\'m an inline-style link](https://www.google.com)\n\n[I\'m an inline-style link with title](https://www.google.com "Google\'s Homepage")\n\n[I\'m a reference-style link][Arbitrary case-insensitive reference text]\n\n[I\'m a relative reference to a repository file](../../../favicon.ico)\n\n[You can use numbers for reference-style link definitions][1]\n\nOr leave it empty and use the [link text itself].\n\nURLs and URLs in angle brackets will automatically get turned into links. \nhttp://www.example.com or <http://www.example.com>.\n\nSome text to show that the reference links can follow later.\n\n[arbitrary case-insensitive reference text]: https://www.mozilla.org\n[1]: http://slashdot.org\n[link text itself]: http://www.reddit.com' },

                { html: '# Images\n\nHere\'s our favicon (hover to see the title text):\n\nInline-style: \n![alt text](/favicon.ico "Logo Title Text 1")\n\nReference-style: \n![alt text][logo]\n\n[logo]: /favicon.ico "Logo Title Text 2"\n' },
                { html: '# Code\n\n```\n/**\n * Handle keyup event\n */\nhandleKeyUp(e) {\n  e.preventDefault();\n\n  if (e.keyCode === 39) {\n    this.getSlide(this.state.currentSlide + 1);\n  } else if (e.keyCode === 37) {\n    this.getSlide(this.state.currentSlide - 1);\n  }\n}\n```' },
                { html: '# Tables\n\nColons can be used to align columns.\n\n| Tables        | Are           | Cool  |\n| ------------- |:-------------:| -----:|\n| col 3 is      | right-aligned | $1600 |\n| col 2 is      | centered      |   $12 |\n| zebra stripes | are neat      |    $1 |\n\nThere must be at least 3 dashes separating each header cell.\nThe outer pipes (|) are optional, and you don\'t need to make the \nraw Markdown line up prettily. You can also use inline Markdown.\n\nMarkdown | Less | Pretty\n--- | --- | ---\n*Still* | `renders` | **nicely**\n1 | 2 | 3' },
                { html: '# Blockquotes\n\n> Blockquotes are very handy in email to emulate reply text.\n> This line is part of the same quote.\n\nQuote break.\n\n> This is a very long line that will still be quoted properly when it wraps. Oh boy let\'s keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote. \n' },
                { html: '# Horizontal Rule\n\nThree or more...\n\n---\n\nHyphens\n\n***\n\nAsterisks\n\n___\n\nUnderscores' },
                { html: '# Line Breaks\n\nHere\'s a line for us to start with.\n\nThis line is separated from the one above by two newlines, so it will be a *separate paragraph*.' },
                { html: '# Inline html\n<dl>\n  <dt>Definition list</dt>\n  <dd>Is something people use sometimes.</dd>\n</dl>' },
                { html: '### Source for samples\n\nhttps://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet' },
              ],
            })
              .then(() => res.ok({ success: 'Signup successful!' }))
              .catch(res.negotiate);
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * List all the users
   * @event GET /users/list
   */
  list: (req, res) => {
    Users.find()
      .then((users) => {
        const userList = users.map(user => ({
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
        }));

        return res.ok(userList);
      })
      .catch(res.negotiate);
  },

  /**
   * Get details of current user
   * @event GET /users/me
   */
  me: (req, res) => {
    Users.findOne({
      id: req.session.me,
    }).populate('groups').populate('presentations')
      .then(user => (
        res.ok({
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
          groups: user.groups.length,
          presentations: user.presentations.length,
        })
      ))
      .catch(res.negotiate);
  },

  /**
   * Delete current user
   * @event DELETE users/me
   */
  delete: (req, res) => {
    Users.findOne({
      id: req.session.me,
    })
      .then((user) => {
        if (user === undefined) {
          return res.badRequest({});
        }

        Users.destroy({
          id: req.session.me,
        })
          .then(() => {
            req.session.me = null;
            res.ok({ success: 'Felhasználó törölve.' });
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },
};
