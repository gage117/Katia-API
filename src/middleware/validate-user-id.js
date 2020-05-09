async function validateUserId(req, res, next) {
  try {
    let { userId } = req.params;
    userId = Number(userId);

    // If userId is not a number
    if(!Number(req.params.userId)) {
      return res.status(400).json({ error: 'userId must be an number'});
    }
    // If userId is greater than 2^53 - 1 or not an integer
    if(!Number.isSafeInteger(userId)){
      return res.status(400).json({
        error: 'userId must be a safe integer'
      });
    }
    if(userId < 0) {
      return res.status(400).json({
        error: 'userId must be a positive integer'
      });
    }

    // After req.params.userId has been validated and converted from a string to number, we pass that on
    req.params.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = validateUserId;