-- These are the database sql definitions
-- for a web project "Scary Future Rating
-- Database"


DROP TABLE IF EXISTS `belongs_to`;
DROP TABLE IF EXISTS `has_higher_status`;
DROP TABLE IF EXISTS `has`;
--DROP TABLE IF EXISTS `module`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `person`;

CREATE TABLE `person` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `top_classifier` varchar(255),
  `avg_rating` decimal(2,2),
  PRIMARY KEY(`id`),
  UNIQUE KEY(`name`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `reviews` (
  `star_rating` int NOT NULL,
  `classifier_term` varchar(255) NOT NULL,
  `given_by_id` int NOT NULL,
  `belongs_to_id` int NOT NULL,
  PRIMARY KEY(`given_by_id`, `belongs_to_id`),
  KEY `given_by_id` (`given_by_id`),
  KEY `belongs_to_id` (`belongs_to_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`given_by_id`)
  REFERENCES `person`(`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`belongs_to_id`)
  REFERENCES `person`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `company` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `module` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson` blob NOT NULL,
  `classifier` varchar(255) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `has` (
  `per_id` int NOT NULL,
  `mod_id` int NOT NULL,
  PRIMARY KEY(`per_id`, `mod_id`),
  KEY `per_id` (`per_id`),
  KEY `mod_id` (`mod_id`),
  CONSTRAINT `has_ibfk_1` FOREIGN KEY(`per_id`) REFERENCES
   `person`(`id`),
   CONSTRAINT `has_ibfk_2` FOREIGN KEY(`mod_id`) REFERENCES
    `module`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `belongs_to` (
  `per_id` int NOT NULL,
  `co_id` int NOT NULL,
  PRIMARY KEY(`per_id`, `co_id`),
  KEY `per_id` (`per_id`),
  KEY `co_id` (`co_id`),
  CONSTRAINT `belongs_to_ibfk_1` FOREIGN KEY(`per_id`) REFERENCES
   `person`(`id`),
   CONSTRAINT `belongs_to_ibfk_2` FOREIGN KEY(`co_id`) REFERENCES
    `company`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `has_higher_status` (
  `hi_per_id` int NOT NULL,
  `lo_per_id` int NOT NULL,
  PRIMARY KEY(`hi_per_id`, `lo_per_id`),
  KEY `hi_per_id` (`hi_per_id`),
  KEY `lo_per_id` (`lo_per_id`),
  CONSTRAINT `has_higher_status_ibfk_1` FOREIGN KEY(`hi_per_id`) REFERENCES
   `person`(`id`),
   CONSTRAINT `has_higher_status_ibfk_2` FOREIGN KEY(`lo_per_id`) REFERENCES
    `person`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



---- Get EVERYONE in the users companies, name and company name
SELECT everyone_else.name AS `name`, everyone_else.id AS `id`
FROM (SELECT p.name, p.id, bt.co_id FROM person p
      INNER JOIN belongs_to bt ON bt.per_id = p.per_id
      WHERE p.id!=?
    ) AS everyone_else
LEFT JOIN (SELECT c.id AS cid, c.name AS co_name FROM company c
	INNER JOIN belongs_to bt ON bt.co_id = c.id
	INNER JOIN person p ON p.id = bt.per_id
	WHERE p.id =? and c.id =?
	GROUP BY c.id) AS user
ON everyone_else.co_id = user.cid;

-- Get EVERYONE but the user
SELECT `name`, `id`
FROM person
WHERE person.id !=?;


-- All user companies except World


-- Get all users friends belonging to a given company
SELECT  everyone.name AS `name`, everyone.id AS `id`

-- Get Everyone not yet reviewed by the user
---- Get EVERYONE in the users companies, name and company name
SELECT ap.name AS `name`, ap.id AS `id`
FROM(SELECT r.belongs_to_id AS `id` FROM reviews r
WHERE r.given_by_id=?) as ag
RIGHT JOIN (SELECT p.id AS `id`, p.name AS `name` FROM person p WHERE p.id!=10) AS ap
ON ag.id=ap.id
WHERE ag.id IS NULL;

SELECT AVG(reviews.star_rating)
FROM `reviews`
WHERE  belongs_to_id=?;



SELECT `classifier`, COUNT(`classifier`) AS `classifier_occurrence`
FROM `reviews`
GROUP BY `classifier`
ORDER BY `classifier_occurrence` DESC
LIMIT    1;
