const bcrypt = require("bcrypt");

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
					password: bcrypt.hashSync("123456", 10),
					role: "admin",
				},
				{
					username: "An Nezzz",
					email: "annezzz1997@gmail.com",
					password: bcrypt.hashSync("123456", 10),
					role: "client",
				},
			]);
		});
};
