const mysql = require("mysql");

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"7773",
    database:"basketball"
});

module.exports = connection;