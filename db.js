var pg = require('pg');
var conString = "postgres://braden:$omething1@ballroom.segal.uvic.ca/apievolution";

var pgclient = new pg.Client(conString);
pgclient.connect();
exports.client = pgclient;