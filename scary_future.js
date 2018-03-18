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
        'avgRating': rows[i].avg_rating,
        'topClassifier': rows[i].top_classifier,
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

    pool.query("INSERT INTO `company` (`name`) VALUES ('Family')", function(err, result) {
      if (err) {
        next(err);
        return;
      }
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.insertId], function(err, result) {
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
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.insertId], function(err, result) {
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
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, result.insertId], function(err, result) {
        if (err) {
          next(err);
          return;
        }
      });
    });

    pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)", [person_id, '1'], function(err, result) {
      if (err) {
        next(err);
        return;
      }
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



app.get('/insertToCompany', function(req, res, next) {
  pool.query("SELECT * FROM `belongs_to` WHERE `per_id`=? AND `co_id`=?", [req.query.per_id, req.query.co_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }

    if (result.length > 0) {
      res.send(JSON.stringify([new String('false')]));
    } else {
      pool.query("INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES (?,?)", [req.query.per_id, req.query.co_id], function(err, result) {
        if (err) {
          next(err);
          return;
        }

        var poiCoString = "SELECT p.name, p.id, p.avg_rating, p.top_classifier, bt.co_id AS `cid`, c.name AS `co_name` FROM person p " +
          "INNER JOIN belongs_to bt ON bt.per_id = p.id " +
          "INNER JOIN company c ON c.id = bt.co_id " +
          "WHERE p.id=? AND c.id=? ;";

        pool.query(poiCoString, [req.query.per_id, req.query.co_id], function(err, result) {
          if (err) {
            next(err);
            return;
          }
          console.log(JSON.stringify(result[0]));
          res.send(JSON.stringify(result[0]));
        });
      });
    }
  });
});

app.get('/insertToReviews', function(req, res, next) {

  pool.query("INSERT INTO `reviews` (`belongs_to_id`, `given_by_id`, `star_rating`, `classifier_term`) VALUES (?,?,?,?)", [req.query.bt_id, req.query.gb_id, req.query.rating, req.query.term], function(err, result) {
    if (err) {
      next(err);
      return;
    }

      // update avg_rating
      pool.query("UPDATE `person` SET `avg_rating` = (SELECT AVG(reviews.star_rating) AS `avg_star_rating` FROM `reviews` WHERE reviews.belongs_to_id = ? ) WHERE person.id = ? ;", [req.query.bt_id, req.query.bt_id],
        function(err, result) {
          if (err) {
            next(err);
            return;
          }
        });

      // update top classifier
      pool.query("UPDATE `person` SET `top_classifier` = (SELECT n1term.classifier_term FROM(SELECT `classifier_term`, COUNT(`classifier_term`) AS `classifier_occurrence` " +
        "FROM `reviews` WHERE reviews.belongs_to_id = ? GROUP BY `classifier_term` " +
        "ORDER BY `classifier_occurrence` DESC LIMIT 1) AS n1term) WHERE person.id = ? ;", [req.query.bt_id, req.query.bt_id],
        function(err, result) {
          if (err) {
            next(err);
            return;
          }
        });

      // perform delete
      pool.query("DELETE FROM `has_higher_status` WHERE hi_per_id=?", [req.query.bt_id], function(err, result) {
        if (err) {
          next(err);
          return;
        }
      });
      pool.query("DELETE FROM `has_higher_status` WHERE lo_per_id=?", [req.query.bt_id], function(err, result) {
        if (err) {
          next(err);
          return;
        }
      });

      // update has_higher_status
      pool.query("INSERT INTO `has_higher_status` (`hi_per_id`, `lo_per_id`) SELECT person.id, ? FROM `person` " +
        "WHERE person.avg_rating > (SELECT person.avg_rating FROM `person` " +
        "WHERE person.id = ? )", [req.query.bt_id, req.query.bt_id],
        function(err, result) {
          if (err) {
            next(err);
            return;
          }
        });

      // update has_higher_status
      pool.query("INSERT INTO `has_higher_status` (`lo_per_id`, `hi_per_id`) SELECT person.id, ? FROM `person` " +
        "WHERE person.avg_rating < (SELECT person.avg_rating FROM `person` " +
        "WHERE person.id = ? ) ", [req.query.bt_id, req.query.bt_id],
        function(err, result) {
          if (err) {
            next(err);
            return;
          }
        });

      pool.query("SELECT  p.name AS `name`, r.belongs_to_id AS `belongs_to_id`, r.star_rating AS `star_rating`, " +
        "r.given_by_id AS `given_by_id`,  r.classifier_term AS  `classifier_term` FROM reviews r " +
        "INNER JOIN person p ON p.id=r.belongs_to_id  WHERE `belongs_to_id`=? AND `given_by_id`=?", [req.query.bt_id, req.query.gb_id],
        function(err, result) {
          if (err) {
            next(err);
            return;
          }
          res.send(JSON.stringify(result[0]));
        });
  });

});


app.get('/deleteAllButPerson', function(req, res, next) {


  pool.query("ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_ibfk_1`", function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  pool.query("ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_ibfk_2`", function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  pool.query("ALTER TABLE `has` DROP FOREIGN KEY `has_ibfk_1`", function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("ALTER TABLE `has` DROP FOREIGN KEY `has_ibfk_2`", function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  pool.query("ALTER TABLE `has_higher_status` DROP FOREIGN KEY `has_higher_status_ibfk_1`", function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("ALTER TABLE `has_higher_status` DROP FOREIGN KEY `has_higher_status_ibfk_2`", function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });


  pool.query("DELETE FROM `reviews` WHERE given_by_id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `reviews` WHERE belongs_to_id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `has` WHERE per_id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  pool.query("DELETE FROM `has_higher_status` WHERE hi_per_id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
  pool.query("DELETE FROM `has_higher_status` WHERE lo_per_id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });



  var getUserCoString = "SELECT c.id AS cid, c.name AS co_name FROM company c " +
    "INNER JOIN belongs_to bt ON bt.co_id = c.id " +
    "INNER JOIN person p ON p.id = bt.per_id " +
    "WHERE p.id=? AND c.name!='World' ;";
  pool.query(getUserCoString, [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }

    for (var i in rows) {
      pool.query("DELETE FROM `company` WHERE id=?", [rows[i].cid], function(err, result) {
        if (err) {
          next(err);
          return;
        }
      });
    }
  });

  pool.query("DELETE FROM `belongs_to` WHERE per_id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  pool.query("DELETE FROM `person` WHERE id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }

    pool.query("ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY(`given_by_id`) REFERENCES `person`(`id`)", function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });

    pool.query("ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_2`  FOREIGN KEY(`belongs_to_id`) REFERENCES `person`(`id`)", function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });

    pool.query("ALTER TABLE `has` ADD CONSTRAINT `has_ibfk_1` FOREIGN KEY(`per_id`) REFERENCES `person`(`id`)", function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });

    pool.query("ALTER TABLE `has` ADD CONSTRAINT `has_ibfk_2` FOREIGN KEY(`mod_id`) REFERENCES `module`(`id`)", function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });

    pool.query("ALTER TABLE `has_higher_status` ADD CONSTRAINT `has_higher_status_ibfk_1` FOREIGN KEY(`hi_per_id`) REFERENCES `person`(`id`)", function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });
    pool.query("ALTER TABLE `has_higher_status` ADD CONSTRAINT `has_higher_status_ibfk_2` FOREIGN KEY(`lo_per_id`) REFERENCES `person`(`id`)", function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });
  });

});

app.get('/deletePerson', function(req, res, next) {
  pool.query("DELETE FROM `person` WHERE id=?", [req.query.id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
});

app.get('/deleteFromCompany', function(req, res, next) {
  var context = {};
  pool.query("DELETE FROM `belongs_to` WHERE per_id=? AND co_id=?", [req.query.per_id, req.query.co_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
});

app.get('/deleteFromReviews', function(req, res, next) {
  var context = {};
  pool.query("DELETE FROM `reviews` WHERE belongs_to_id=? AND given_by_id=?", [req.query.bt_id, req.query.gb_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  // perform delete
  pool.query("DELETE FROM `has_higher_status` WHERE hi_per_id=?", [req.query.bt_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });

  pool.query("DELETE FROM `has_higher_status` WHERE lo_per_id=?", [req.query.bt_id], function(err, result) {
    if (err) {
      next(err);
      return;
    }
  });
});

app.get('/updateAfterReview', function(req, res, next) {
  // update avg_rating
  pool.query("UPDATE `person` SET `avg_rating` = (SELECT AVG(reviews.star_rating) AS `avg_star_rating` " +
    "FROM `reviews` WHERE reviews.belongs_to_id = ? ) WHERE person.id = ? ;", [req.query.bt_id, req.query.bt_id],
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });
  // update top classifier
  pool.query("UPDATE `person` SET `top_classifier` = (SELECT n1term.classifier_term FROM(SELECT `classifier_term`, COUNT(`classifier_term`) AS `classifier_occurrence` " +
    "FROM `reviews` WHERE reviews.belongs_to_id = ? GROUP BY `classifier_term` " +
    "ORDER BY `classifier_occurrence` DESC LIMIT 1) AS n1term) WHERE person.id = ? ;", [req.query.bt_id, req.query.bt_id],
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });

  // update has_higher_status
  pool.query("INSERT INTO `has_higher_status` (`hi_per_id`, `lo_per_id`) SELECT person.id, ? FROM `person` " +
    "WHERE person.avg_rating > (SELECT person.avg_rating FROM `person` " +
    "WHERE person.id = ? )", [req.query.bt_id, req.query.bt_id],
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });
  // update has_higher_status
  pool.query("INSERT INTO `has_higher_status` (`lo_per_id`, `hi_per_id`) SELECT person.id, ? FROM `person` " +
    "WHERE person.avg_rating < (SELECT person.avg_rating FROM `person` " +
    "WHERE person.id = ? ) ", [req.query.bt_id, req.query.bt_id],
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
    });

  pool.query("SELECT  p.name AS `name`, r.belongs_to_id AS `belongs_to_id`, r.star_rating AS `star_rating`, " +
    "r.given_by_id AS `given_by_id`,  r.classifier_term AS  `classifier_term` FROM reviews r " +
    "INNER JOIN person p ON p.id=r.belongs_to_id  WHERE `belongs_to_id`=? AND `given_by_id`=?", [req.query.bt_id, req.query.gb_id],
    function(err, result) {
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
        'uName': rows[i].name,
        'uEmail': rows[i].email,
        'uId': rows[i].id,
        'uAvg_Rating': rows[i].avg_rating,
        'uTop_Classifier': rows[i].top_classifier
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
        'notUName': rows[i].name,
        'notUId': rows[i].id,
        'totallyUId': req.query.id
      };
      params.push(info);
    }
  });

  //get everyone elses not reviewed by user
  pool.query("SELECT ap.name AS `name`, ap.id AS `id` " +
    "FROM(SELECT r.belongs_to_id AS `id` FROM reviews r " +
    "WHERE r.given_by_id=?) as ag " +
    "RIGHT JOIN (SELECT p.id AS `id`, p.name AS `name` FROM person p WHERE p.id!=?) AS ap " +
    "ON ag.id=ap.id WHERE ag.id IS NULL; ", [req.query.id, req.query.id],
    function(err, rows, fields) {
      if (err) {
        next(err);
        return;
      }

      for (var i in rows) {
        var info = {
          'notRevName': rows[i].name,
          'notRevId': rows[i].id,
          'totallyUId': req.query.id
        };
        params.push(info);
      }
    });

  //get company ids of user
  var companyIdString = "SELECT DISTINCT c.name AS `name`, c.id AS `id` " +
    "FROM company c INNER JOIN belongs_to bt ON bt.co_id = c.id " +
    "INNER JOIN person p ON p.id = bt.per_id " +
    "where p.id=? AND c.name!='World'";
  pool.query(companyIdString, [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }

    for (var i in rows) {
      var companyInfo = {
        'coName': rows[i].name,
        'coId': rows[i].id
      }
      params.push(companyInfo);
      var peopleString = "SELECT everyone_else.name AS `name`, everyone_else.id AS `id`, " +
        "user.co_name AS `co_name`, user.cid AS `cid`, everyone_else.avg_rating AS `avg_rating`, " +
        "everyone_else.top_classifier AS `top_classifier` " +
        "FROM (SELECT p.name, p.id, p.avg_rating, p.top_classifier, bt.co_id FROM person p " +
        "INNER JOIN belongs_to bt ON bt.per_id = p.id " +
        "WHERE p.id!=? ) AS everyone_else " +
        "INNER JOIN (SELECT c.id AS cid, c.name AS co_name FROM company c " +
        "INNER JOIN belongs_to bt ON bt.co_id = c.id " +
        "INNER JOIN person p ON p.id = bt.per_id " +
        "WHERE p.id =? and c.id =? " +
        "GROUP BY c.id) AS user " +
        "ON everyone_else.co_id = user.cid; ";
      pool.query(peopleString, [req.query.id, req.query.id, rows[i].id], function(err, rows, fields) {
        if (err) {
          next(err);
          return;
        }

        for (var i in rows) {
          if (rows[i].co_name == "Friends") {
            var member_info = {
              'frName': rows[i].name,
              'frPerId': rows[i].id,
              'frRating': rows[i].avg_rating,
              'frTerm': rows[i].top_classifier,
              'frCoId': rows[i].cid
            };
            params.push(member_info);
          } else if (rows[i].co_name == "Work") {
            var member_info = {
              'wName': rows[i].name,
              'wPerId': rows[i].id,
              'wRating': rows[i].avg_rating,
              'wTerm': rows[i].top_classifier,
              'wCoId': rows[i].cid
            };
            params.push(member_info);
          } else if (rows[i].co_name == "Family") {
            var member_info = {
              'faName': rows[i].name,
              'faPerId': rows[i].id,
              'faRating': rows[i].avg_rating,
              'faTerm': rows[i].top_classifier,
              'faCoId': rows[i].cid
            };
            params.push(member_info);
          }
        }
      });
    }
  });

  // get reviews that belong to them
  pool.query("SELECT r.star_rating AS `star_rating`, r.classifier_term AS  `classifier_term`, r.belongs_to_id AS `belongs_to_id`," +
    " r.given_by_id AS `given_by_id`, p.name AS `name` FROM reviews r " +
    "INNER JOIN person p ON p.id=r.belongs_to_id  WHERE given_by_id=?", [req.query.id],
    function(err, rows, fields) {
      if (err) {
        next(err);
        return;
      }

      for (var i in rows) {
        var info = {
          'givenStarRating': rows[i].star_rating,
          'givenClassifierTerm': rows[i].classifier_term,
          'givenGivenById': rows[i].given_by_id,
          'givenBelongsToId': rows[i].belongs_to_id,
          'givenName': rows[i].name
        };
        params.push(info);
      }
    });

  // get reviews they've been given
  pool.query("SELECT r.star_rating AS `star_rating`, r.classifier_term AS  `classifier_term`, r.belongs_to_id AS `belongs_to_id`," +
    " r.given_by_id AS `given_by_id`, p.name AS `name` FROM reviews r " +
    "INNER JOIN person p ON p.id=r.given_by_id  WHERE belongs_to_id=?", [req.query.id],
    function(err, rows, fields) {
      if (err) {
        next(err);
        return;
      }

      for (var i in rows) {
        var info = {
          'belongsStarRating': rows[i].star_rating,
          'belongsClassifierTerm': rows[i].classifier_term,
          'belongsGivenById': rows[i].given_by_id,
          'belongsBelongsToId': rows[i].belongs_to_id,
          'belongsName': rows[i].name
        };
        params.push(info);
      }
      context.results = params;
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

app.get('/ranking', function(req, res, next) {
  var context = {};
  pool.query("SELECT * FROM `person` WHERE id=?", [req.query.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    var params = [];
    for (var i in rows) {
      var exercise = {
        'name': rows[i].name,
        'rating': rows[i].avg_rating,
      };
      params.push(exercise);
    }
    // update has_higher_status
    pool.query("SELECT person.id, person.name, person.avg_rating FROM `person` " +
      "WHERE person.avg_rating > (SELECT person.avg_rating FROM `person` " +
      "WHERE person.id = ? ) ORDER BY person.avg_rating DESC", [req.query.id],
      function(err, rows, fields) {
        if (err) {
          next(err);
          return;
        }
        for (var i in rows) {
          var info = {
            'hiName': rows[i].name,
            'hiRating': rows[i].avg_rating
          };
          params.push(info);
        }
      });

    pool.query("SELECT person.id, person.name, person.avg_rating FROM `person` " +
      "WHERE person.avg_rating < (SELECT person.avg_rating FROM `person` " +
      "WHERE person.id = ? ) ORDER BY person.avg_rating DESC", [req.query.id],
      function(err, rows, fields) {
        if (err) {
          next(err);
          return;
        }
        for (var i in rows) {
          var info = {
            'loName': rows[i].name,
            'loRating': rows[i].avg_rating
          };
          params.push(info);
        }
      });
    context.results = params;
    res.render('show_ranking', context);
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
