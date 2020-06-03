exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex("messages")
        .del()
        .then(function () {
            // Inserts seed entries
            return knex("messages").insert([
                { user_id: 1, text: "message 1" },
                { user_id: 1, text: "message 2" },
            ]);
        });
};
