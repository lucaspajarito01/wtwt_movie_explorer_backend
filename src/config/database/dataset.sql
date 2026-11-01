USE wtwt_movie_explorer_database;

INSERT INTO categorias (nombre, descripcion) VALUES
    ('Acción', 'Películas con alta dosis de adrenalina, persecuciones y secuencias de combate.'),
    ('Comedia', 'Películas diseñadas para entretener y hacer reír a la audiencia a través del humor.'),
    ('Drama', 'Historias centradas en el desarrollo de personajes y conflictos emocionales profundos.'),
    ('Ciencia Ficción', 'Narrativas basadas en avances científicos futuros, tecnología avanzada o viajes espaciales.'),
    ('Terror', 'Películas orientadas a provocar miedo, tensión, sobresaltos y suspense en el espectador.'),
    ('Aventura', 'Historias de exploración, viajes épicos y búsqueda de objetivos o tesoros lejanos.'),
    ('Animación', 'Obras realizadas mediante técnicas de dibujo, animación 3D o stop-motion, aptas para todo público.'),
    ('Romance', 'Tramas enfocadas en las relaciones amorosas, la pasión y los vínculos afectivos.'),
    ('Suspenso', 'Historias llenas de misterio y tensión psicológica que mantienen la intriga hasta el final.'),
    ('Fantasía', 'Mundos imaginarios con elementos mágicos, criaturas mitológicas y eventos sobrenaturales.'),
    ('Documental', 'Producciones de no ficción enfocadas en investigar, informar y presentar hechos reales.'),
    ('Crimen', 'Narrativas sobre actividades delictivas, investigaciones policiales, juicios y mafias.'),
    ('Musical', 'Películas donde la música, las canciones y las coreografías impulsan y forman parte central de la trama.'),
    ('Western', 'Historias ambientadas en el Lejano Oeste estadounidense con vaqueros, forajidos y duelos.'),
    ('Histórica', 'Recreaciones cinematográficas de eventos, épocas y personajes reales del pasado.');


INSERT INTO director_peliculas (nombre) VALUES
    ('Christopher Nolan'),
    ('Quentin Tarantino'),
    ('Steven Spielberg'),
    ('Martin Scorsese'),
    ('Denis Villeneuve'),
    ('Greta Gerwig'),
    ('David Fincher'),
    ('Bong Joon-ho'),
    ('Hayao Miyazaki'),
    ('Guillermo del Toro'),
    ('Ridley Scott'),
    ('Pedro Almodóvar'),
    ('Alejandro González Iñárritu'),
    ('Wes Anderson'),
    ('James Cameron');

INSERT INTO plataformas (nombre) VALUES
    ('Netflix'),
    ('Amazon Prime Video'),
    ('Disney+'),
    ('HBO Max'),
    ('Apple TV+'),
    ('Paramount+'),
    ('Crunchyroll'),
    ('Cine (Salas de Cine)'),
    ('Star+'),
    ('Google Play Películas');

INSERT INTO idiomas (nombre) VALUES
    ('Español'),
    ('Inglés'),
    ('Francés'),
    ('Alemán'),
    ('Japonés'),
    ('Coreano'),
    ('Italiano'),
    ('Portugués'),
    ('Mandarín'),
    ('Ruso');

INSERT INTO peliculas (
    titulo, descripcion, id_categoria, anio, duracion,
    id_director, id_plataforma, id_idioma, edad_recomendada,
    poster_url, banner_url, trailer_url, estado, id_usuario_creador
) VALUES
    (
        'Inception',
        'Un especialista en extraer secretos del subconsciente recibe la mision de implantar una idea en la mente de un empresario.',
        4, 2010, '148 min', 1, 8, 2, '+13',
        'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
        'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
        'https://www.themoviedb.org/movie/27205-inception/videos', 'aprobado', NULL
    ),
    (
        'Interstellar',
        'Un grupo de exploradores viaja a traves de un agujero de gusano en busca de un futuro para la humanidad.',
        4, 2014, '169 min', 1, 8, 2, '+13',
        'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'https://image.tmdb.org/t/p/w1280/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
        'https://www.themoviedb.org/movie/157336-interstellar/videos', 'aprobado', NULL
    ),
    (
        'Reservoir Dogs',
        'El fracaso de un robo organizado provoca desconfianza y enfrentamientos entre los criminales sobrevivientes.',
        12, 1992, '99 min', 2, 8, 2, '+18',
        'https://image.tmdb.org/t/p/w500/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg',
        'https://image.tmdb.org/t/p/w1280/jqFjgNnxpXIXWuPsyfqmcLXRo9p.jpg',
        'https://www.themoviedb.org/movie/500-reservoir-dogs/videos', 'aprobado', NULL
    ),
    (
        'Django Unchained',
        'Con la ayuda de un cazarrecompensas, un hombre liberado busca rescatar a su esposa de un poderoso terrateniente.',
        14, 2012, '165 min', 2, 8, 2, '+18',
        'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
        'https://image.tmdb.org/t/p/w1280/n2eUT4zQA2yYcKOgAFidgOyiFoH.jpg',
        'https://www.themoviedb.org/movie/68718-django-unchained/videos', 'aprobado', NULL
    ),
    (
        'Jaws',
        'Un enorme tiburon blanco amenaza a una comunidad costera y obliga a sus habitantes a organizar su captura.',
        5, 1975, '124 min', 3, 8, 2, '+13',
        'https://image.tmdb.org/t/p/w500/l1yltvzILaZcx2jYvc5sEMkM7Eh.jpg',
        'https://image.tmdb.org/t/p/w1280/slkPgAt1IQgxZXNrazEcOzhAK8f.jpg',
        'https://www.themoviedb.org/movie/578-jaws/videos', 'aprobado', NULL
    ),
    (
        'Schindler''s List',
        'Un empresario aleman utiliza su fabrica para salvar la vida de cientos de personas durante el Holocausto.',
        15, 1993, '195 min', 3, 8, 2, '+16',
        'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
        'https://image.tmdb.org/t/p/w1280/zb6fM1CX41D9rF9hdgclu0peUmy.jpg',
        'https://www.themoviedb.org/movie/424-schindlers-list/videos', 'aprobado', NULL
    ),
    (
        'Goodfellas',
        'La historia del ascenso y la caida de un hombre que se integra al mundo del crimen organizado.',
        12, 1990, '145 min', 4, 8, 2, '+18',
        'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
        'https://image.tmdb.org/t/p/w1280/sw7mordbZxgITU877yTpZCud90M.jpg',
        'https://www.themoviedb.org/movie/769-goodfellas/videos', 'aprobado', NULL
    ),
    (
        'Taxi Driver',
        'Un veterano trabaja como taxista nocturno en Nueva York mientras su aislamiento y frustracion aumentan.',
        3, 1976, '114 min', 4, 8, 2, '+18',
        'https://image.tmdb.org/t/p/w500/ekstpH614fwDX8DUln1a2Opz0N8.jpg',
        'https://image.tmdb.org/t/p/w1280/6aoyUbvu0419XLKLIMoH0TkEicH.jpg',
        'https://www.themoviedb.org/movie/103-taxi-driver/videos', 'aprobado', NULL
    ),
    (
        'Dune',
        'Paul Atreides viaja al peligroso planeta Arrakis, donde se disputa el control de un recurso de gran valor.',
        4, 2021, '155 min', 5, 8, 2, '+13',
        'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        'https://image.tmdb.org/t/p/w1280/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
        'https://www.themoviedb.org/movie/438631-dune/videos', 'aprobado', NULL
    ),
    (
        'Arrival',
        'Una especialista en linguistica intenta comunicarse con visitantes extraterrestres que llegan a la Tierra.',
        4, 2016, '116 min', 5, 8, 2, '+13',
        'https://image.tmdb.org/t/p/w500/7Yd1qVsFRypQPCiVbzZNDExJFo7.jpg',
        'https://image.tmdb.org/t/p/w1280/8MUZz7oPXQftFTslZpRP3CVMOoq.jpg',
        'https://www.themoviedb.org/movie/329865-arrival/videos', 'aprobado', NULL
    )