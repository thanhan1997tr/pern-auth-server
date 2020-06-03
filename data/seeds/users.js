
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {username: 'a', email: 'a@gmail.com', password: '123456'},
        {username: 'b', email: 'b@gmail.com', password: '123456'},
        {username: 'c', email: 'c@gmail.com', password: '123456'},
      ]);
    });
};
