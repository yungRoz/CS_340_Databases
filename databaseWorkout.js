var express = require('express');
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs340_garzar',
  password: '2561',
  database: 'cs340_garzar',
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
  pool.query("SELECT * FROM `person`", function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    var params = [];

    for (var i in rows) {
      var exercise = {
        'name': rows[i].name,
        'email': rows[i].email,
        'avg_rating': rows[i].avg_rating,
        'top_classifier': rows[i].top_classifier,
        'id': rows[i].id
      };
      params.push(exercise);
    }
    context.results = params;
    res.render('form_table', context);
  });
});



app.get('/insertToPerson', function(req, res, next) {
  pool.query("INSERT INTO `person` (`name`, `email`) VALUES (?, ?)", [req.query.name, req.query.email], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    var person_id = result.insertId;

    pool.query("INSERT INTO `company` (`name`) VALUES ('Family')",  function(err, result) {
      if (err) {
        next(err);
        return;
      }
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.insertId], function(err, result){
        if (err) {
          console.log(person_id);
          next(err);
          return;
        }
      });
    });
    pool.query("INSERT INTO `company` (`name`) VALUES (?)", ['Friends'], function(err, result) {
      if (err) {
        next(err);
        return;
      }
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.insertId], function(err, result){
        if (err) {
          next(err);
          return;
        }
      });
    });
    pool.query("INSERT INTO `company` (`name`) VALUES (?)", ['Work'], function(err, result) {
      if (err) {
        next(err);
        return;
      }
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.insertId], function(err, result){
        if (err) {
          next(err);
          return;
        }
      });
    });

    pool.query("SELECT `id` FROM `company` WHERE name='World'", function(err, result) {
      if (err) {
        next(err);
        return;
      }
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.id], function(err, result){
        if (err) {
          next(err);
          return;
        }
      });
    });

    pool.query("SELECT * FROM `person` WHERE id=?", [person_id], function(err, result) {
      if (err) {
        next(err);
        return;
      }
      res.send(JSON.stringify(result[0]));
    });
  });
});

app.get('/createCompanies', function(req, res, next) {
  pool.query("INSERT INTO `company` (`name`) VALUES (?)", ['Family'], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [req.query.id, result.insertId], function(err, result){
      if (err) {
        next(err);
        return;
      }
    });
  });
  pool.query("INSERT INTO `company` (`name`) VALUES (?)", ['Friends'], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [req.query.id, result.insertId], function(err, result){
      if (err) {
        next(err);
        return;
      }
    });
  });
  pool.query("INSERT INTO `company` (`name`) VALUES (?)", ['Work'], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [req.query.id, result.insertId], function(err, result){
      if (err) {
        next(err);
        return;
      }
    });
  });
  pool.query("SELECT `id` FROM `company` WHERE name='World'", function(err, result) {
    if (err) {
      next(err);
      return;
    }
    pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [req.query.id, result.id], function(err, result){
      if (err) {
        next(err);
        return;
      }
    });
  });
});


app.get('/insertToReviews', function(req, res, next) {
  pool.query("INSERT INTO `reviews` (`star_rating`, `classifier_term`, `given_by_id`, `belongs_to_id`) VALUES (?, ?, ?, ?)", [req.query.star_rating, req.query.classifier_term, req.query.given_by_id, req.query.belongs_to_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }

    pool.query("SELECT * FROM `reviews` WHERE id=?", [result.insertId], function(err, result) {
      if (err) {
        next(err);
        return;
      }
      res.send(JSON.stringify(result[0]));
    });
  });
});


app.get('/insertToCompany', function(req, res, next) {
  var insertString = "IF (NOT EXISTS ( SELECT * FROM `belongs_to` WHERE `per_id`=? AND `col_id`=?)) "+
                        "BEGIN INSERT INTO `belongs_to`(`per_id`, `co_id`) VALUES (?,?) "+
                        "END";
  pool.query(insertString, [req.query.per_id, req.query.co_id, req.query.per_id, req.query.co_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }

    if ( result.length > 0) {
      pool.query("SELECT * FROM `person` WHERE id=?", [req.query.per_id], function(err, result) {
        if (err) {
          next(err);
          return;
        }
        res.send(JSON.stringify(result[0]));
      });
    }
    else {
      res.send(JSON.stringify([new String('false')]));
    }
  });
});



app.get('/delete', function(req, res, next) {
  var context = {};
  pool.query("DELETE FROM `person` WHERE id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    res.render('form_table', context);
  });
  pool.query("DELETE FROM `review` WHERE given_by_id=?", [req.query.id], function(err,result){
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `review` WHERE belongs_to_id=?", [req.query.id], function(err,result){
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `has` WHERE per_id=?", [req.query.id], function(err,result){
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `belongs_to` WHERE per_id=?", [req.query.id], function(err,result){
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `has_higher_status` WHERE hi_per_id=?", [req.query.id], function(err,result){
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `has_higher_status` WHERE lo_per_id=?", [req.query.id], function(err,result){
    if (err) {
      next(err);
      return;
    }
  });
});

app.get('/update', function(req, res, next) {
  var context = {};
  pool.query("SELECT * FROM `person` WHERE id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    var params = [];

    for (var i in rows) {
      var info = {
        'name': rows[i].name,
        'email': rows[i].email,
        'id': rows[i].id,
      };
      params.push(info);
    }
    context.results = params[0];
    res.render('update_page', context);
  });
});

app.get('/homepage', function(req, res, next) {
  var context = {};
  var params = [];
  //get this persons info
  pool.query("SELECT * FROM `person` WHERE id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    for (var i in rows) {
      var info = {
        'u_name': rows[i].name,
        'u_email': rows[i].email,
        'u_id': rows[i].id,
      };
      params.push(info);
    }
  });

  //get everyone elses info [just name and id] for add to company
  pool.query("SELECT `name`, `id` FROM `person` WHERE id!=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }

    for (var i in rows) {
      var info = {
        'notu_name': rows[i].name,
        'notu_id': rows[i].id,
      };
      params.push(info);
    }
  });

  //get company ids of user
  var companyIdString = "SELECT DISTINCT c.name AS `name`, c.id AS `id` " +
              "FROM company c INNER JOIN belongs_to bt ON bt.co_id = c.id " +
              "INNER JOIN person p ON p.id = bt.per_id " +
              "where p.id=? AND c.name !='World' ";
  pool.query(companyIdString, [req.query.id], function(err, rows, fields){
    if (err) {
      next(err);
      return;
    }

    for (var i in rows) {
      /*if(rows[i].name == "Friends"){
        var companyInfo ={
          'co_friend': rows[i].name,
          'co_friend_id': rows[i].id,
        };
        params.push(companyInfo);
      }
      else if(rows[i].name=="Work"){
        var companyInfo ={
          'co_work': rows[i].name,
          'co_work_id': rows[i].id,
        };
        params.push(companyInfo);
      }
      else if(rows[i].name=="Family"){
        var companyInfo ={
          'co_family': rows[i].name,
          'co_fam_id': rows[i].id,
        };
        params.push(companyInfo);
      }*/

      var  companyInfo={
        'co_name': rows[i].name,
        'co_id': rows[i].id
      }
      params.push(companyInfo);
      var peopleString = "SELECT everyone_else.name AS `name`, everyone_else.id AS `id`, " +
                          "user.co_name AS `co_name`, everyone_else.avg_rating AS `avg_rating`, " +
                          "everyone_else.top_classifier AS `top_classifier` " +
                          "FROM (SELECT p.name, p.id, p.avg_rating, p.top_classifier, bt.co_id FROM person p " +
                          "INNER JOIN belongs_to bt ON bt.per_id = p.per_id " +
                          "WHERE p.id!=? ) AS everyone_else " +
                    "LEFT JOIN (SELECT c.id AS cid, c.name AS co_name FROM company c " +
                    	"INNER JOIN belongs_to bt ON bt.co_id = c.id " +
                    	"INNER JOIN person p ON p.id = bt.per_id " +
                    	"WHERE p.id =? and c.id =? " +
                    	"GROUP BY c.id) AS user " +
                    "ON everyone_else.co_id = user.cid; "
      pool.query(companyIdString, [req.query.id, rows[i].id], function(err, rows, fields){
        if (err) {
          next(err);
          return;
        }

        for (var i in rows) {
          if(rows[i].co_name == "Friends"){
            var member_info = {
              'fr_name': rows[i].name,
              'fr_id': rows[i].id,
              'fr_rating': rows[i].avg_rating,
              'fr_term': rows[i].top_classifier
            };
            params.push(member_info);
          }
          else if(rows[i].co_name == "Work"){
            var member_info = {
              'w_name': rows[i].name,
              'w_id': rows[i].id,
              'w_rating': rows[i].avg_rating,
              'w_term': rows[i].top_classifier
            };
            params.push(member_info);
          }
          else if(rows[i].co_name == "Family"){
            var member_info = {
              'fa_name': rows[i].name,
              'fa_id': rows[i].id,
              'fa_rating': rows[i].avg_rating,
              'fa_term': rows[i].top_classifier
            };
            params.push(member_info);
          }
        }
      });
    }
  });
  // get reviews they've given info
  pool.query("SELECT * FROM `reviews` WHERE given_by_id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }

    for (var i in rows) {
      var info = {
        'given_star_rating': rows[i].star_rating,
        'given_classifier_term': rows[i].classifer_term,
        'given_given_by_id': rows[i].given_by_id,
        'given_belongs_to_id': rows[i].belongs_to_id
      };
      params.push(info);
    }
  });

  // get reviews they've received
  pool.query("SELECT * FROM `reviews` WHERE belongs_to_id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }

    for (var i in rows){
      var info = {
        'belongs_star_rating': rows[i].star_rating,
        'belongs_classifier_term': rows[i].classifer_term,
        'belongs_given_by_id': rows[i].given_by_id,
        'belongs_belongs_to_id': rows[i].belongs_to_id
      };
      params.push(info);
    }
  });

  // get reviews they've received
  pool.query("SELECT * FROM `reviews` WHERE belongs_to_id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }

    for (var i in rows) {
      var info = {
        'belongs_star_rating': rows[i].star_rating,
        'belongs_classifier_term': rows[i].classifer_term,
        'belongs_given_by_id': rows[i].given_by_id,
        'belongs_belongs_to_id': rows[i].belongs_to_id
      };
      params.push(info);
    }
    context.results=params;
    res.render('home_page', context);
  });
});

app.get('/sendupdate', function(req, res, next) {
  var context = {};

  pool.query("SELECT * FROM `person` WHERE  id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
    if (result.length == 1) {
      var stored = result[0];

      pool.query("UPDATE `person` SET name=?, email=? WHERE id=?", [req.query.name || stored.name, req.query.email || stored.email, req.query.id], function(err, result) {
        if (err) {
          next(err);
          return;
        }
        pool.query("SELECT * FROM `person`", function(err, rows, fields) {
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
