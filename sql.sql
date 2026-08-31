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
  `full_name` VARCHAR(255) NULL DEFAULT NULL,
  `role` VARCHAR(50) NULL DEFAULT 'NATURAL_PERSON',
  `plan` VARCHAR(20) NULL DEFAULT 'platino',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
  `telegram_user_id` BIGINT NULL DEFAULT NULL,
  `whatsapp_number` VARCHAR(30) NULL DEFAULT NULL,
  `subscription_status` VARCHAR(50) NULL DEFAULT 'pending',
  `subscription_plan` VARCHAR(50) NULL DEFAULT NULL,
  `wompi_transaction_id` VARCHAR(100) NULL DEFAULT NULL,
  `logo_url` VARCHAR(512) NULL DEFAULT NULL,
  `balance` INT NULL DEFAULT '0',
  `module_visa_enabled` TINYINT(1) NULL DEFAULT '1',
  `module_appointments_enabled` TINYINT(1) NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 40
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`agency_profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`agency_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `alias` VARCHAR(100) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(512) NULL DEFAULT NULL,
  `brand_color` VARCHAR(50) NULL DEFAULT '#4F46E5',
  `status` VARCHAR(50) NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `alias` (`alias` ASC) VISIBLE,
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `agency_profiles_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `visa_bot_db_telegram`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`balance_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`balance_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `type` ENUM('topup', 'spend') NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `balance_history_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `visa_bot_db_telegram`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) NULL DEFAULT 'info',
  `is_read` TINYINT(1) NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_notifications_user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_notifications_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `visa_bot_db_telegram`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 179
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`processed_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`processed_transactions` (
  `transaction_id` VARCHAR(100) NOT NULL,
  `user_id` INT NOT NULL,
  `amount` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`))
ENGINE = InnoDB
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
  `min_asc_time` TIME NULL DEFAULT '06:00:00',
  `max_asc_time` TIME NULL DEFAULT '19:30:00',
  `date_created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(255) NULL DEFAULT 'pending',
  `ivr` VARCHAR(255) NULL DEFAULT 'null',
  `schedule_id` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Schedule ID seleccionado en el portal de visas',
  `date_booked` TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha y hora en la que se agendó la cita',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
  `schedule_names` VARCHAR(512) NULL DEFAULT NULL,
  `process_type` VARCHAR(50) NULL DEFAULT 'Individual',
  `assigned_consulate_date` DATETIME NULL DEFAULT NULL,
  `assigned_cas_date` DATETIME NULL DEFAULT NULL,
  `group_size` INT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  INDEX `telegram_user_id` (`telegram_user_id` ASC) VISIBLE,
  INDEX `fk_user_appointments_user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_appointments_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `visa_bot_db_telegram`.`users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 782
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`visa_processes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`visa_processes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `client_email` VARCHAR(255) NULL DEFAULT NULL,
  `type` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'En Progreso',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `target_country` VARCHAR(100) NOT NULL DEFAULT 'Estados Unidos',
  `visa_category` VARCHAR(100) NOT NULL DEFAULT 'B1/B2',
  `token` VARCHAR(64) NULL DEFAULT NULL,
  `group_type` VARCHAR(50) NULL DEFAULT 'Individual',
  `purpose` VARCHAR(100) NULL DEFAULT 'Turismo / Negocios',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `token` (`token` ASC) VISIBLE,
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `visa_processes_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `visa_bot_db_telegram`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 16
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`visa_applicants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`visa_applicants` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `process_id` INT NOT NULL,
  `full_name` VARCHAR(255) NULL DEFAULT NULL,
  `relationship` VARCHAR(100) NOT NULL DEFAULT 'primary',
  `passport_number` VARCHAR(100) NULL DEFAULT NULL,
  `ds160_confirmation` VARCHAR(100) NULL DEFAULT NULL,
  `form_data` LONGTEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `process_id` (`process_id` ASC) VISIBLE,
  CONSTRAINT `visa_applicants_ibfk_1`
    FOREIGN KEY (`process_id`)
    REFERENCES `visa_bot_db_telegram`.`visa_processes` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `visa_bot_db_telegram`.`visa_documents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visa_bot_db_telegram`.`visa_documents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `applicant_id` INT NOT NULL,
  `document_type` VARCHAR(100) NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'uploaded',
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `applicant_id` (`applicant_id` ASC) VISIBLE,
  CONSTRAINT `visa_documents_ibfk_1`
    FOREIGN KEY (`applicant_id`)
    REFERENCES `visa_bot_db_telegram`.`visa_applicants` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 11
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
