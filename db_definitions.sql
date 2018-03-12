-- These are the database sql definitions
-- for a web project "Scary Future Rating
-- Database"

DROP TABLE IF EXISTS `person`;
DROP TABLE IF EXISTS `belongs_to`;
DROP TABLE IF EXISTS `has_higher_status`;
DROP TABLE IF EXISTS `has`;
DROP TABLE IF EXISTS `company`;
DROP TABLE IF EXISTS `module`;
DROP TABLE IF EXISTS `reviews`;


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
  KEY `given_by_id` (`given_by_id`)
  KEY `belongs_to_id` (`belongs_to_id`)
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY(`given_by_id`) REFERENCES
   `person`(`id`)
   CONSTRAINT `reviews_ibfk_2` FOREIGN KEY(`belongs_to_id`) REFERENCES
    `person`(`id`)
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
  KEY `per_id` (`per_id`)
  KEY `mod_id` (`mod_id`)
  CONSTRAINT `has_ibfk_1` FOREIGN KEY(`per_id`) REFERENCES
   `person`(`id`)
   CONSTRAINT `has_ibfk_2` FOREIGN KEY(`mod_id`) REFERENCES
    `modules`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `belongs_to` (
  `per_id` int NOT NULL,
  `co_id` int NOT NULL,
  PRIMARY KEY(`per_id`, `co_id`),
  KEY `per_id` (`per_id`)
  KEY `co_id` (`co_id`)
  CONSTRAINT `belongs_to_ibfk_1` FOREIGN KEY(`per_id`) REFERENCES
   `person`(`id`)
   CONSTRAINT `belongs_to_ibfk_2` FOREIGN KEY(`co_id`) REFERENCES
    `company`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `has_higher_status` (
  `hi_per_id` int NOT NULL,
  `lo_per_id` int NOT NULL,
  PRIMARY KEY(`hi_per_id`, `lo_per_id`),
  KEY `hi_per_id` (`hi_per_id`)
  KEY `lo_per_id` (`lo_per_id`)
  CONSTRAINT `has_higher_status_ibfk_1` FOREIGN KEY(`hi_per_id`) REFERENCES
   `person`(`id`)
   CONSTRAINT `has_higher_status_ibfk_2` FOREIGN KEY(`lo_per_id`) REFERENCES
    `person`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
