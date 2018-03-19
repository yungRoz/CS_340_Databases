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



--Set avg_rating
UPDATE `person`
SET `avg_rating` =
(SELECT AVG(reviews.star_rating) AS `avg_star_rating`
 FROM `reviews`
 WHERE reviews.belongs_to_id=16)
WHERE person.id=16;

-- Set topClassifier
UPDATE `person`
SET `top_classifier` =
(SELECT n1term.classifier_term FROM (SELECT `classifier_term`, COUNT(`classifier_term`) AS `classifier_occurrence`
FROM `reviews`
WHERE reviews.belongs_to_id=20
GROUP BY `classifier_term`
ORDER BY `classifier_occurrence` DESC
LIMIT    1) AS n1term)
WHERE person.id=20;



-- insert into has_higher_status
INSERT INTO `has_higher_status` (`hi_per_id`,`lo_per_id`)
SELECT person.id, '19' FROM `person`
WHERE person.avg_rating < (SELECT person.avg_rating FROM `person` WHERE person.id=19)

-- insert into person
INSERT INTO `person` (`name`, `email`) VALUES (?, ?)

-- create various companies for an individual
INSERT INTO `company` (`name`) VALUES ('Family')

-- insert into company relationship many-many table
INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES(?,?)

-- get all data for a person
SELECT * FROM `person` WHERE id=?

-- check for existance of table before creating many to many relationship
SELECT * FROM `belongs_to` WHERE `per_id`=? AND `co_id`=?;
INSERT INTO `belongs_to` (`per_id`, `co_id`) VALUES (?,?);
SELECT p.name, p.id, p.avg_rating, p.top_classifier, bt.co_id AS `cid`, c.name AS `co_name` FROM person p
INNER JOIN belongs_to bt ON bt.per_id = p.id
INNER JOIN company c ON c.id = bt.co_id
WHERE p.id=? AND c.id=? ;

--adding a review process--
INSERT INTO `reviews` (`belongs_to_id`, `given_by_id`, `star_rating`, `classifier_term`) VALUES (?,?,?,?)
--adding a review process--
UPDATE `person` SET `avg_rating` = (SELECT AVG(reviews.star_rating) AS `avg_star_rating` FROM `reviews` WHERE reviews.belongs_to_id = ? ) WHERE person.id = ? ;
--adding a review process--
UPDATE `person` SET `top_classifier` =
(SELECT n1term.classifier_term
FROM(SELECT `classifier_term`, COUNT(`classifier_term`) AS `classifier_occurrence`
FROM `reviews` WHERE reviews.belongs_to_id = ? GROUP BY `classifier_term`
ORDER BY `classifier_occurrence` DESC LIMIT 1) AS n1term) WHERE person.id = ? ;
--adding a review process--
SELECT  p.name AS `name`, p.avg_rating AS `avg_rating`, r.belongs_to_id AS `belongs_to_id`, r.star_rating AS `star_rating`,
  r.given_by_id AS `given_by_id`,  r.classifier_term AS  `classifier_term` FROM reviews r
  INNER JOIN person p ON p.id=r.belongs_to_id  WHERE `belongs_to_id`=? AND `given_by_id`=?;

--delete from has_higher_status
DELETE FROM `has_higher_status` WHERE hi_per_id=?;
DELETE FROM `has_higher_status` WHERE lo_per_id=?;
--update has_higher_status
INSERT INTO `has_higher_status` (`hi_per_id`, `lo_per_id`) SELECT person.id, ? FROM `person`
  WHERE person.avg_rating > (SELECT person.avg_rating FROM `person`
  WHERE person.id = ?;
INSERT INTO `has_higher_status` (`lo_per_id`, `hi_per_id`) SELECT person.id, ? FROM `person`
    WHERE person.avg_rating < (SELECT person.avg_rating FROM `person`
    WHERE person.id = ?




--delete a person--
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_ibfk_1`;
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_ibfk_2`;
ALTER TABLE `has` DROP FOREIGN KEY `has_ibfk_1`;
ALTER TABLE `has` DROP FOREIGN KEY `has_ibfk_2`;
ALTER TABLE `has_higher_status` DROP FOREIGN KEY `has_higher_status_ibfk_1`;
ALTER TABLE `has_higher_status` DROP FOREIGN KEY `has_higher_status_ibfk_2`;
DELETE FROM `reviews` WHERE given_by_id=?;
DELETE FROM `reviews` WHERE belongs_to_id=?;
DELETE FROM `has` WHERE per_id=?;
DELETE FROM `has_higher_status` WHERE hi_per_id=?;
DELETE FROM `has_higher_status` WHERE lo_per_id=?;
SELECT c.id AS cid, c.name AS co_name FROM company c
  INNER JOIN belongs_to bt ON bt.co_id = c.id
  INNER JOIN person p ON p.id = bt.per_id
  WHERE p.id=? AND c.name!='World';
--for all company ids
DELETE FROM `company` WHERE id=?;
DELETE FROM `belongs_to` WHERE per_id=?;
DELETE FROM `person` WHERE id=?;
--reinstate foreign keys
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY(`given_by_id`) REFERENCES `person`(`id`);
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_2`  FOREIGN KEY(`belongs_to_id`) REFERENCES `person`(`id`);
ALTER TABLE `has` ADD CONSTRAINT `has_ibfk_1` FOREIGN KEY(`per_id`) REFERENCES `person`(`id`);
ALTER TABLE `has` ADD CONSTRAINT `has_ibfk_2` FOREIGN KEY(`mod_id`) REFERENCES `module`(`id`);
ALTER TABLE `has_higher_status` ADD CONSTRAINT `has_higher_status_ibfk_1` FOREIGN KEY(`hi_per_id`) REFERENCES `person`(`id`);
ALTER TABLE `has_higher_status` ADD CONSTRAINT `has_higher_status_ibfk_2` FOREIGN KEY(`lo_per_id`) REFERENCES `person`(`id`);

--removing a friend from relationship
DELETE FROM `belongs_to` WHERE per_id=? AND co_id=?;


-- deleting a review
DELETE FROM `reviews` WHERE belongs_to_id=? AND given_by_id=?;
-- update after delete review
UPDATE `person` SET `avg_rating` = (SELECT AVG(reviews.star_rating) AS `avg_star_rating`
FROM `reviews` WHERE reviews.belongs_to_id = ? ) WHERE person.id = ? ;
UPDATE `person` SET `top_classifier` = (SELECT n1term.classifier_term FROM(SELECT `classifier_term`, COUNT(`classifier_term`) AS `classifier_occurrence`
FROM `reviews` WHERE reviews.belongs_to_id = ? GROUP BY `classifier_term`
ORDER BY `classifier_occurrence` DESC LIMIT 1) AS n1term) WHERE person.id = ? ;
SELECT p.name AS `name`, r.belongs_to_id AS `belongs_to_id`, r.star_rating AS `star_rating`,
  r.given_by_id AS `given_by_id`,  r.classifier_term AS  `classifier_term` FROM reviews r
  INNER JOIN person p ON p.id=r.belongs_to_id  WHERE `belongs_to_id`=? AND `given_by_id`=?;


  -- get everyone not yet reviewed by user

  SELECT ap.name AS `name`, ap.id AS `id`
    FROM(SELECT r.belongs_to_id AS `id` FROM reviews r
    WHERE r.given_by_id=?) as ag
    RIGHT JOIN (SELECT p.id AS `id`, p.name AS `name` FROM person p WHERE p.id!=?) AS ap
    ON ag.id=ap.id WHERE ag.id IS NULL;


    SELECT DISTINCT c.name AS `name`, c.id AS `id`
      FROM company c INNER JOIN belongs_to bt ON bt.co_id = c.id
      INNER JOIN person p ON p.id = bt.per_id
      where p.id=? AND c.name!='World';

-- get everyone that belongs to one of the users companies
SELECT everyone_else.name AS `name`, everyone_else.id AS `id`,
  user.co_name AS `co_name`, user.cid AS `cid`, everyone_else.avg_rating AS `avg_rating`,
  everyone_else.top_classifier AS `top_classifier`
FROM (SELECT p.name, p.id, p.avg_rating, p.top_classifier, bt.co_id FROM person p
INNER JOIN belongs_to bt ON bt.per_id = p.id
  WHERE p.id!=? ) AS everyone_else
  INNER JOIN (SELECT c.id AS cid, c.name AS co_name FROM company c
  INNER JOIN belongs_to bt ON bt.co_id = c.id
  INNER JOIN person p ON p.id = bt.per_id
  WHERE p.id =? and c.id =?
    GROUP BY c.id) AS user
      ON everyone_else.co_id = user.cid;

-- get review
SELECT r.star_rating AS `star_rating`, r.classifier_term AS  `classifier_term`, r.belongs_to_id AS `belongs_to_id`,
r.given_by_id AS `given_by_id`, p.name AS `name` FROM reviews r
INNER JOIN person p ON p.id=r.belongs_to_id  WHERE given_by_id=?;


SELECT r.star_rating AS `star_rating`, r.classifier_term AS  `classifier_term`, r.belongs_to_id AS `belongs_to_id`,
  r.given_by_id AS `given_by_id`, p.name AS `name` FROM reviews r
  INNER JOIN person p ON p.id=r.given_by_id  WHERE belongs_to_id=?;


-- get all ratings higher than this person
SELECT person.id, person.name, person.avg_rating FROM `person`
  WHERE person.avg_rating < (SELECT person.avg_rating FROM `person`
  WHERE person.id = ? ) ORDER BY person.avg_rating DESC;

-- get all reings lower than this person
  SELECT person.id, person.name, person.avg_rating FROM `person`
    WHERE person.avg_rating > (SELECT person.avg_rating FROM `person`
    WHERE person.id = ? ) ORDER BY person.avg_rating DESC
