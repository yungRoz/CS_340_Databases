var express = require('express');
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs290_garzar',
  password: '2561',
  database: 'cs290_garzar',
  dateStrings: true
});

var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main'
});
var bodyParser = require("body-parser");

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 62521);
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get('/reset-table', function(req, res, next) { //A function that allows us to completely reset the table by visiting the url (given to us)
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err) {
    var createString = "CREATE TABLE workouts(" +
      "id INT PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "reps INT," +
      "weight INT," +
      "date DATE," +
      "lbs BOOLEAN)";
    pool.query(createString, function(err) {
      res.render('form_table', context);
    })
  });
});

app.get('/', function(req, res, next) {
  var context = {};
  pool.query("SELECT * FROM `workouts`", function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    var params = [];

    for (var i in rows) {
      var exercise = {
        'name': rows[i].name,
        'reps': rows[i].reps,
        'weight': rows[i].weight,
        'date': rows[i].date,
        'id': rows[i].id,
        'lbs': rows[i].lbs
      };
      params.push(exercise);
    }
    context.results = params;
    res.render('form_table', context);
  });
});



app.get('/insert', function(req, res, next) {
  pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result) {
    if (err) {
      next(err);
      return;
    }

    pool.query("SELECT * FROM `workouts` WHERE id=?", [result.insertId], function(err, result) {
      if (err) {
        next(err);
        return;
      }
      res.send(JSON.stringify(result[0]));
    });
  });
});

app.get('/delete', function(req, res, next) {
  var context = {};
  pool.query("DELETE FROM `workouts` WHERE id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    res.render('form_table', context);
  });
});

app.get('/update', function(req, res, next) {
  var context = {};
  pool.query("SELECT * FROM `workouts` WHERE id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    var params = [];

    for (var i in rows) {
      var exercise = {
        'name': rows[i].name,
        'reps': rows[i].reps,
        'weight': rows[i].weight,
        'date': rows[i].date,
        'id': rows[i].id,
        'lbs': rows[i].lbs
      };
      params.push(exercise);
    }
    context.results = params[0];
    res.render('update_page', context);
  });
});


app.get('/sendupdate', function(req, res, next) {
  var context = {};

  pool.query("SELECT * FROM `workouts` WHERE  id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    if (result.length == 1) {
      var stored = result[0];

      pool.query("UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?", [req.query.name || stored.name, req.query.reps || stored.reps, req.query.weight || stored.weight, req.query.date || stored.date, req.query.lbs || stored.lbs, req.query.id], function(err, result) {
        if (err) {
          next(err);
          return;
        }
        pool.query("SELECT * FROM `workouts`", function(err, rows, fields) {
          if (err) {
            next(err);
            return;
          }
          var params = [];

          for (var i in rows) {
            var exercise = {
              'name': rows[i].name,
              'reps': rows[i].reps,
              'weight': rows[i].weight,
              'date': rows[i].date,
              'id': rows[i].id,
              'lbs': rows[i].lbs
            };
            params.push(exercise);

          }
          context.results = params;
          res.render('form_table', context);
        });

      });

    }
  });

});
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function() {
  console.log('Express started on http://flip3.engr.oregonstate:' + app.get('port') + '; press Ctrl-C to terminate.');
});
