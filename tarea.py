import os
import zipfile

# 1. Código de las Tablas
sql_tables = """CREATE TABLE Alumno (
    cod_a INT PRIMARY KEY,
    nom_a VARCHAR(100) NOT NULL,
    dir_a VARCHAR(150),
    tel_a VARCHAR(20)
);

CREATE TABLE Materia (
    cod_m INT PRIMARY KEY,
    nom_m VARCHAR(100) NOT NULL,
    ih INT
);

CREATE TABLE Libro (
    isbn VARCHAR(20) PRIMARY KEY,
    ejm INT,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100)
);

CREATE TABLE Bibliografia (
    cod_m INT,
    isbn VARCHAR(20),
    PRIMARY KEY (cod_m, isbn),
    FOREIGN KEY (cod_m) REFERENCES Materia(cod_m),
    FOREIGN KEY (isbn) REFERENCES Libro(isbn)
);

CREATE TABLE Ejemplar (
    cod_l INT PRIMARY KEY,
    isbn VARCHAR(20),
    FOREIGN KEY (isbn) REFERENCES Libro(isbn)
);

CREATE TABLE Inscripcion (
    cod_a INT,
    cod_m INT,
    grupo INT,
    nota1 NUMERIC(3,1),
    nota2 NUMERIC(3,1),
    nota3 NUMERIC(3,1),
    PRIMARY KEY (cod_a, cod_m),
    FOREIGN KEY (cod_a) REFERENCES Alumno(cod_a),
    FOREIGN KEY (cod_m) REFERENCES Materia(cod_m)
);

CREATE TABLE Prestamo (
    cod_a INT,
    cod_l INT,
    f_prestamo DATE,
    f_entrega DATE,
    PRIMARY KEY (cod_a, cod_l, f_prestamo),
    FOREIGN KEY (cod_a) REFERENCES Alumno(cod_a),
    FOREIGN KEY (cod_l) REFERENCES Ejemplar(cod_l)
);"""

# 2. Código de los Inserts
sql_inserts = """INSERT INTO Alumno (cod_a, nom_a, dir_a, tel_a) VALUES
(1, 'Pedro', 'Cra 79 #69-16', '2243128'),
(2, 'Luz Angela', 'Cra. 64 #24-47', '3153437'),
(3, 'Gerardo', 'CI 144 #12-54', '4436402'),
(4, 'Olga', 'Cra 69B #24Bis-16', '7222568'),
(5, 'Carlos', 'Cra 27B #5-19', '2777346');

INSERT INTO Materia (cod_m, nom_m, ih) VALUES
(1, 'SEMINARIO 1', 2),
(2, 'HERRAMIENTAS SIG I', 8),
(3, 'BDDE', 4),
(4, 'PERCEPCION REMOTA', 8),
(5, 'SIG', 8);

INSERT INTO Libro (isbn, ejm, titulo, autor) VALUES
('9999-8888', 5, 'Principles of GIS', 'Burrough'),
('9999-8887', 4, 'GIS and Science', 'Goodchild'),
('9999-8886', 3, 'Geo-Information', 'Lemmens'),
('9999-8885', 2, 'The Design of GIS', 'Harmon'),
('9999-8884', 1, 'Introduction to GIS', 'ITC');

INSERT INTO Bibliografia (cod_m, isbn) VALUES
(1, '9999-8888'), (1, '9999-8887'), (1, '9999-8886'),
(2, '9999-8888'), (2, '9999-8887'), (2, '9999-8886'),
(2, '9999-8885'), (2, '9999-8884'), (5, '9999-8884'),
(5, '9999-8886'), (5, '9999-8888');

INSERT INTO Ejemplar (cod_l, isbn) VALUES
(1, '9999-8884'), (2, '9999-8885'), (3, '9999-8886'),
(4, '9999-8887'), (5, '9999-8888');

INSERT INTO Inscripcion (cod_a, cod_m, grupo, nota1, nota2, nota3) VALUES
(1, 1, 1, 3.2, 4.5, 3.8), (2, 1, 1, 2.5, 4.0, 3.9), (3, 1, 1, 3.0, 3.2, 3.5),
(4, 1, 1, 4.0, 4.2, 4.0), (5, 1, 1, 4.2, 4.0, 4.8), (1, 2, 1, 1.5, 4.9, 4.9),
(2, 2, 1, 3.0, 4.4, 4.5), (3, 2, 1, 5.0, 3.6, 4.5), (4, 2, 1, 3.0, 4.8, 3.0),
(1, 3, 1, 2.2, 4.0, 4.8), (2, 3, 1, 1.5, 4.5, 4.9), (3, 3, 1, 2.0, 3.4, 4.5),
(4, 3, 1, 5.0, 4.5, 4.0), (1, 4, 1, 3.0, 3.5, 4.8), (2, 4, 1, 2.0, 3.0, 4.9),
(3, 4, 1, 2.0, 3.2, 4.5), (4, 4, 1, 3.0, 3.2, 4.5), (5, 4, 1, 4.0, 4.2, 4.0),
(1, 5, 1, 3.5, 4.0, 2.9), (2, 5, 1, 2.0, 3.2, 3.5), (3, 5, 1, 1.0, 4.2, 4.5),
(4, 5, 1, 5.0, 3.2, 5.0);

INSERT INTO Prestamo (cod_a, cod_l, f_prestamo, f_entrega) VALUES
(1, 1, '2017-09-08', '2017-09-10'),
(2, 2, '2018-03-10', '2018-09-15'),
(3, 1, '2018-11-10', '2018-11-15'),
(4, 3, '2018-11-10', '2018-11-15'),
(5, 4, '2019-05-10', '2019-06-15'),
(5, 5, '2019-03-10', '2019-07-09'),
(5, 1, '2019-03-10', NULL),
(5, 2, '2019-09-10', NULL);"""

# 3. Código de las Consultas
sql_consultas = """-- 1. Materias que ve el alumno Pedro
SELECT m.nom_m FROM Alumno a JOIN Inscripcion i ON a.cod_a = i.cod_a JOIN Materia m ON i.cod_m = m.cod_m WHERE a.nom_a = 'Pedro';

-- 2. Alumnos que ven la materia BDDE
SELECT a.nom_a FROM Materia m JOIN Inscripcion i ON m.cod_m = i.cod_m JOIN Alumno a ON i.cod_a = a.cod_a WHERE m.nom_m = 'BDDE';

-- 3. Título de los libros bibliografía de SIG
SELECT l.titulo FROM Materia m JOIN Bibliografia b ON m.cod_m = b.cod_m JOIN Libro l ON b.isbn = l.isbn WHERE m.nom_m = 'SIG';

-- 4. Alumnos que no han entregado Geo-information
SELECT a.nom_a FROM Libro l JOIN Ejemplar e ON l.isbn = e.isbn JOIN Prestamo p ON e.cod_l = p.cod_l JOIN Alumno a ON p.cod_a = a.cod_a WHERE l.titulo = 'Geo-Information' AND p.f_entrega IS NULL;

-- 5. Libros prestados/devueltos y número de préstamos
SELECT l.titulo, COUNT(p.cod_l) AS numero_prestamos FROM Libro l JOIN Ejemplar e ON l.isbn = e.isbn JOIN Prestamo p ON e.cod_l = p.cod_l WHERE p.f_entrega IS NOT NULL GROUP BY l.titulo;

-- 6. Total alumnos en PERCEPCION REMOTA
SELECT COUNT(i.cod_a) AS total_alumnos FROM Materia m JOIN Inscripcion i ON m.cod_m = i.cod_m WHERE m.nom_m = 'PERCEPCION REMOTA';

-- 7. Nombre, Materia, Nota Definitiva
SELECT a.nom_a, m.nom_m, (i.nota1 * 0.35 + i.nota2 * 0.35 + i.nota3 * 0.30) AS nota_definitiva FROM Alumno a JOIN Inscripcion i ON a.cod_a = i.cod_a JOIN Materia m ON i.cod_m = m.cod_m;

-- 8. Nota promedio de cada alumno
SELECT a.nom_a, AVG(i.nota1 * 0.35 + i.nota2 * 0.35 + i.nota3 * 0.30) AS nota_promedio FROM Alumno a JOIN Inscripcion i ON a.cod_a = i.cod_a GROUP BY a.cod_a, a.nom_a;

-- 9. Alumno con promedio superior a 3.9
SELECT a.cod_a, a.nom_a, a.dir_a, a.tel_a FROM Alumno a JOIN Inscripcion i ON a.cod_a = i.cod_a GROUP BY a.cod_a, a.nom_a, a.dir_a, a.tel_a HAVING AVG(i.nota1 * 0.35 + i.nota2 * 0.35 + i.nota3 * 0.30) > 3.9;

-- 10. Alumno con mejor promedio
SELECT a.nom_a, AVG(i.nota1 * 0.35 + i.nota2 * 0.35 + i.nota3 * 0.30) AS mejor_promedio FROM Alumno a JOIN Inscripcion i ON a.cod_a = i.cod_a GROUP BY a.cod_a, a.nom_a ORDER BY mejor_promedio DESC LIMIT 1;"""

# Crear carpetas si no existen
os.makedirs("tablas", exist_ok=True)
os.makedirs("inserts", exist_ok=True)
os.makedirs("consultas", exist_ok=True)

# Escribir los archivos SQL temporales
with open("tablas/1_create_tables.sql", "w", encoding="utf-8") as f: f.write(sql_tables)
with open("inserts/2_inserts.sql", "w", encoding="utf-8") as f: f.write(sql_inserts)
with open("consultas/3_consultas.sql", "w", encoding="utf-8") as f: f.write(sql_consultas)

# Crear el archivo ZIP y agregar los archivos
with zipfile.ZipFile("ejercicio3_sql.zip", "w", zipfile.ZIP_DEFLATED) as zipf:
    zipf.write("tablas/1_create_tables.sql", arcname="tablas/1_create_tables.sql")
    zipf.write("inserts/2_inserts.sql", arcname="inserts/2_inserts.sql")
    zipf.write("consultas/3_consultas.sql", arcname="consultas/3_consultas.sql")

print("¡Éxito! El archivo 'ejercicio3_sql.zip' ha sido creado en este directorio.")