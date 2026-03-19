-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema visa_bot_db_telegram
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema visa_bot_db_telegram
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `visa_bot_db_telegram` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `visa_bot_db_telegram` ;

-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`active_sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`active_sessions` (
  `session_id` VARCHAR(64) NOT NULL,
  `user_email` VARCHAR(255) NULL DEFAULT NULL,
  `last_seen` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `machine_id` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `device_id` VARCHAR(255) NULL DEFAULT NULL,
  `country` VARCHAR(255) NOT NULL,
  `min_date` DATE NULL DEFAULT NULL,
  `max_date` DATE NULL DEFAULT NULL,
  `need_asc` TINYINT(1) NULL DEFAULT NULL,
  `schedule_id` VARCHAR(255) NULL DEFAULT NULL,
  `facility_id` VARCHAR(255) NULL DEFAULT NULL,
  `asc_facility_id` VARCHAR(255) NULL DEFAULT NULL,
  `is_authorized` TINYINT(1) NULL DEFAULT '0',
  `plan` VARCHAR(20) NULL DEFAULT 'platino',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`user_appointments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`user_appointments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `telegram_user_id` BIGINT NULL DEFAULT NULL,
  `user_id` INT NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `consulate_asc` VARCHAR(255) NULL DEFAULT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  `country` VARCHAR(10) NULL DEFAULT 'co',
  `consulate` VARCHAR(255) NULL DEFAULT 'Lima',
  `min_consulate_date` DATE NULL DEFAULT NULL,
  `max_consulate_date` DATE NULL DEFAULT NULL,
  `min_consulate_time` TIME NULL DEFAULT '06:00:00',
  `max_consulate_time` TIME NULL DEFAULT '19:30:00',
  `min_asc_date` DATE NULL DEFAULT NULL,
  `max_asc_date` DATE NULL DEFAULT NULL,
  `min_asc_time` TIME NULL DEFAULT NULL,
  `max_asc_time` TIME NULL DEFAULT NULL,
  `date_created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(255) NULL DEFAULT 'pending',
  `ivr` VARCHAR(255) NULL DEFAULT 'null',
  PRIMARY KEY (`id`),
  INDEX `telegram_user_id` (`telegram_user_id` ASC) VISIBLE,
  INDEX `fk_user_appointments_user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_appointments_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `visa_bot_db_telegram`.`users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 91
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
