const UserService = require('../user/user-service');

// Middleware function for checking if a user is registered
// Possibly uneeded once auth router is implemented
async function checkUserExists(req, res, next) {
  try {
    // Get a user by given ID from DB
    const user = await UserService.getById(
      req.app.get('db'),
      req.params.userId
    );
    // If no user exits, return 404
    if(!user)
      res.status(404).json({
        error: 'User doesn\'t exist'
      });
      
    // Remove password from return object for security
    delete user.password;
    // Set user in response
    res.user = user;
    next();
  } catch (error) {
    // Catch any errors and send them to error-handler middleware
    next(error);
  }
}

module.exports = checkUserExists;