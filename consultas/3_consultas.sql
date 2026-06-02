-- 1. Materias que ve el alumno Pedro
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
SELECT a.nom_a, AVG(i.nota1 * 0.35 + i.nota2 * 0.35 + i.nota3 * 0.30) AS mejor_promedio FROM Alumno a JOIN Inscripcion i ON a.cod_a = i.cod_a GROUP BY a.cod_a, a.nom_a ORDER BY mejor_promedio DESC LIMIT 1;