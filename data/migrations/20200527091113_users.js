exports.up = (knex) => {
    return knex.schema.createTable("users", (t) => {
        t.increments("id");
        t.string("username");
        t.string("email");
        t.string("password");
    });
};

exports.down = (knex) => {
    return knex.schema.dropTable("users");
};
