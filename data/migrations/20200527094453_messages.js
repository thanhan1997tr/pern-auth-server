exports.up = (knex) => {
    return knex.schema.createTable("messages", (t) => {
        t.increments("id");
        t.string("user_id");
        t.string("text");
    });
};

exports.down = (knex) => {
    return knex.schema.dropTable("messages");
};
