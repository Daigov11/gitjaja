CREATE TABLE IF NOT EXISTS web_carousel_slide (
  id_slide INT NOT NULL AUTO_INCREMENT,
  slide_title VARCHAR(160) NOT NULL DEFAULT '',
  slide_subtitle VARCHAR(255) NOT NULL DEFAULT '',
  slide_link_url VARCHAR(500) NULL,
  slide_image_url VARCHAR(500) NOT NULL,
  slide_position INT NOT NULL DEFAULT 0,
  slide_status TINYINT(1) NOT NULL DEFAULT 1,
  slide_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  slide_actu DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_slide),
  KEY idx_web_carousel_slide_public (slide_status, slide_position, id_slide)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
