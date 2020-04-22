const express = require('express');
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .route('/token')
  .post(jsonBodyParser, async (req, res, next) => {
    const { email, password } = req.body;
    const loginUser = { email, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    try {
      const dbUser = await AuthService.getUserWithEmail(
        req.app.get('db'),
        loginUser.email
      );

      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect username or password',
        });

      const compareMatch = await AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      );

      if (!compareMatch)
        return res.status(400).json({
          error: 'Incorrect username or password',
        });

      const sub = dbUser.email;
      const payload = {
        user_id: dbUser.id,
        email: dbUser.email,
      };
      res.send({
        authToken: AuthService.createJwt(sub, payload),
      });
    } catch (error) {
      next(error);
    }
  })

  .put(requireAuth, (req, res) => {
    const sub = req.user.email;
    const payload = {
      user_id: req.user.id,
      email: req.user.email,
    };
    res.send({
      authToken: AuthService.createJwt(sub, payload),
    });
  });

module.exports = authRouter;
