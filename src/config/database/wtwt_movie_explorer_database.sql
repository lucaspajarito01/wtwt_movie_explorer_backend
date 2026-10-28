-- DROP DATABASE IF EXISTS wtwt_movie_explorer_database;

CREATE DATABASE IF NOT EXISTS wtwt_movie_explorer_database;
USE wtwt_movie_explorer_database;

CREATE TABLE IF NOT EXISTS roles (
    id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (nombre) VALUES ('usuario'), ('admin');

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    role_id TINYINT UNSIGNED NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_de_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE director_peliculas(
    id_director INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(30) UNIQUE NOT NULL
);
CREATE TABLE plataformas(
    id_plataforma INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE idiomas(
    id_idioma INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE peliculas (
    id_pelicula INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) UNIQUE NOT NULL,
    descripcion TEXT,
    id_categoria INT,
    anio INT,
    duracion VARCHAR(50),
    id_director INT,
    id_plataforma INT,
    id_idioma INT,
    edad_recomendada VARCHAR(20),
    poster_url VARCHAR(255),
    banner_url VARCHAR(255),
    trailer_url VARCHAR(255),
    estado ENUM('pendiente','aprobado') NOT NULL DEFAULT 'pendiente',
	id_usuario_creador INT NULL,
	FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    FOREIGN KEY (id_director) REFERENCES director_peliculas(id_director) ON DELETE SET NULL,
    FOREIGN KEY (id_plataforma) REFERENCES plataformas(id_plataforma) ON DELETE SET NULL,
    FOREIGN KEY (id_idioma) REFERENCES idiomas(id_idioma) ON DELETE SET NULL
);

CREATE TABLE resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_pelicula INT,
    id_usuario INT,
    titulo_resena VARCHAR(100),
    comentario TEXT,
    calificacion TINYINT CHECK (calificacion BETWEEN 1 AND 10),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pelicula) REFERENCES peliculas(id_pelicula) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE resena_votos (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_resena INT,
    id_usuario INT,
    tipo_voto ENUM('like', 'dislike') NOT NULL,
    FOREIGN KEY (id_resena) REFERENCES resenas(id_resena) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    UNIQUE (id_resena, id_usuario) -- Evita que un usuario vote dos veces la misma reseña
);

-- ==========================================
-- ÍNDICES DE BÚSQUEDA Y RENDIMIENTO
-- ==========================================

ALTER TABLE peliculas ADD FULLTEXT idx_fulltext_pelicula (titulo, descripcion);
CREATE INDEX idx_pelicula_categoria ON peliculas(id_categoria);
CREATE INDEX idx_resena_pelicula ON resenas(id_pelicula);
CREATE INDEX idx_resena_fecha ON resenas(fecha_creacion DESC);

