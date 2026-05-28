-- ============================================
-- KT_CHARACTER — SCHÉMA SQL
-- PRÉREQUIS : la table `users` doit exister
-- (fournie par le resource `union`)
-- ============================================

-- ============================================
-- CHARACTERS
-- ============================================
CREATE TABLE IF NOT EXISTS `characters` (
    `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `unique_id`   VARCHAR(36)  NOT NULL,

    `firstname`   VARCHAR(50)  NOT NULL,
    `lastname`    VARCHAR(50)  NOT NULL,
    `dateofbirth` DATE         NOT NULL,

    `ped_model`   VARCHAR(60)  NOT NULL DEFAULT 'mp_m_freemode_01',
    `position`    JSON         DEFAULT NULL,

    `health`      INT          DEFAULT 200,
    `armor`       INT          DEFAULT 0,
    `is_dead`     TINYINT(1)   DEFAULT 0,

    `job`         VARCHAR(50)  DEFAULT 'unemployed',
    `job_grade`   INT          DEFAULT 0,

    `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    `last_played` TIMESTAMP    NULL DEFAULT NULL,
    `updated_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_unique_id` (`unique_id`),
    INDEX `idx_job` (`job`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- USER_CHARACTER — table de jonction N-N
-- Un user peut posséder plusieurs personnages,
-- un personnage peut appartenir à plusieurs users.
-- ============================================
CREATE TABLE IF NOT EXISTS `user_character` (
    `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `identifier`  VARCHAR(60)  NOT NULL,
    `unique_id`   VARCHAR(36)  NOT NULL,
    `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_user_char` (`identifier`, `unique_id`),
    INDEX `idx_identifier` (`identifier`),
    INDEX `idx_unique_id` (`unique_id`),

    CONSTRAINT `fk_uc_user`
        FOREIGN KEY (`identifier`)
        REFERENCES `users` (`identifier`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_uc_char`
        FOREIGN KEY (`unique_id`)
        REFERENCES `characters` (`unique_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CHARACTER APPEARANCES
-- FIX : face_features et tattoos sont des
-- colonnes dédiées, pas enfouies dans skin_data.
-- ============================================
CREATE TABLE IF NOT EXISTS `character_appearances` (
    `id`            INT UNSIGNED AUTO_INCREMENT,
    `unique_id`     VARCHAR(36) NOT NULL,

    -- Données principales (headBlend, hair, overlays, components, props)
    `skin_data`     LONGTEXT    DEFAULT NULL,

    -- FIX : colonnes séparées — lues et écrites indépendamment
    `face_features` LONGTEXT    DEFAULT NULL,
    `tattoos`       LONGTEXT    DEFAULT NULL,

    `created_at`    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_unique_id` (`unique_id`),

    CONSTRAINT `fk_appearance_char`
        FOREIGN KEY (`unique_id`)
        REFERENCES `characters` (`unique_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CHARACTER OUTFITS
-- FIX : contrainte UNIQUE sur (unique_id, name)
--       pour éviter les doublons de noms.
--       job_grade DEFAULT 0 pour cohérence.
-- ============================================
CREATE TABLE IF NOT EXISTS `character_outfits` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `unique_id`     VARCHAR(36)  NOT NULL,
    `name`          VARCHAR(50)  NOT NULL,
    `components`    LONGTEXT     DEFAULT NULL,
    `props`         LONGTEXT     DEFAULT NULL,
    `is_job_outfit` TINYINT(1)   DEFAULT 0,
    `job_name`      VARCHAR(50)  DEFAULT NULL,
    `job_grade`     INT          DEFAULT 0,
    `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_outfit_name` (`unique_id`, `name`),
    INDEX `idx_unique_id` (`unique_id`),
    INDEX `idx_job` (`job_name`, `job_grade`),

    CONSTRAINT `fk_outfit_char`
        FOREIGN KEY (`unique_id`)
        REFERENCES `characters` (`unique_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
