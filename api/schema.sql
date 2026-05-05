-- ============================================
-- Database: undangan_pernikahan
-- Elvy & Rokim Wedding Invitation
-- ============================================

CREATE DATABASE IF NOT EXISTS undangan_pernikahan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE undangan_pernikahan;

-- Tabel Invitations (Daftar Undangan)
CREATE TABLE IF NOT EXISTS invitations (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  title      VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel RSVP (Konfirmasi Kehadiran)
CREATE TABLE IF NOT EXISTS rsvp (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invitation_id INT UNSIGNED NOT NULL,
  nama          VARCHAR(150) NOT NULL,
  jumlah_tamu   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status        ENUM('hadir','tidak') NOT NULL,
  alasan        TEXT         NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Ucapan & Doa (Guestbook)
CREATE TABLE IF NOT EXISTS ucapan (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invitation_id INT UNSIGNED NOT NULL,
  nama          VARCHAR(150) NOT NULL,
  pesan         TEXT         NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
