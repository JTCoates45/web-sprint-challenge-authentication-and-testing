const db = require("../../data/dbConfig");

function findBy(filter) {
  return db("users").where(filter).first();
}

function findById(id) {
    return db('users').where({id}).first();
}

function insert(user) {
    return db('users')
        .insert(user)
        .then(([id]) => findById(id));
}

module.exports = {
    findBy,
    findById,
    insert
}