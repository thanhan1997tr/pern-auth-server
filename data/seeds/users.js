exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex("users")
		.del()
		.then(function () {
			// Inserts seed entries
			return knex("users").insert([
				{
					username: "Thanh An",
					email: "thanhan1997tr@gmail.com",
					password: "123456",
					role: "admin",
				},
				{
					username: "An Nezzz",
					email: "annezzz1997@gmail.com",
					password: "123456",
					role: "client",
				},
			]);
		});
};
