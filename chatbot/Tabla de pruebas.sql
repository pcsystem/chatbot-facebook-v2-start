/*nombre de base de datos
db_datapublica
*/
create table inscripcionCurso(
	idinscripcion serial  primary key,
	nombreCurso varchar(50),
	nombrePersona VARCHAR(50) 
);