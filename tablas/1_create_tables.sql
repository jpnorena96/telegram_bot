CREATE TABLE Alumno (
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
);