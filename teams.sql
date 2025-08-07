CREATE TABLE `teams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `score` INT DEFAULT 0,
  `flower_parts` INT DEFAULT 5,
  `item_add_used` BOOLEAN DEFAULT FALSE,
  `item_burn_used` BOOLEAN DEFAULT FALSE,
  `item_revive_used` BOOLEAN DEFAULT FALSE,
  `is_burned` BOOLEAN DEFAULT FALSE
);
