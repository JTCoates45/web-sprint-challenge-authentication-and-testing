const Users = require('./auth-model');

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const existingUser = await Users.findBy({ username });

  if (existingUser != null) {
    next({ status: 401, message: "username taken" });
    return;
  }

  next();
}

const checkValidBody = async (req, res, next) => {
    let { username, password } = req.body;

    if (username == null || password == null) {
        next({
            status: 401,
            message: "username and password required"
        });
        return; 
    }
    
    if (typeof username != 'string' ||
        username.trim().length == '' ||
        password.toString().trim().length == '') {
        next({
            status: 401,
            message: "Invalid credentials"
        });
        return; 
    }

    password = password.toString();
    req.body = { username, password};
    next();
}

const validateUsername = async (req, res, next) => {
  const { username } = req.body;
  const existingUser = await Users.findBy({ username });

  if (existingUser == null) {
    next({ status: 401, message: "invalid credentials" });
    return;
  }

  req.existingUser = existingUser;
  next();
}

module.exports = {
  checkUsernameExists,
  checkValidBody,
  validateUsername
}