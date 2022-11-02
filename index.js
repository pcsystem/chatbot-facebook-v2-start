const express = require('express');
//const bodyParser = require('body-parser');
const app = express();
//require('dotenv').config();
const { Pool } = require('pg');
const { WebhookClient } = require('dialogflow-fulfillment');

//Puerto del servidor si no existe variable PORT usaremos el puerto 3780
var port = process.env.PORT || 3780;

// Definimos el pool de conexion a la base de datos
const client = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_datapublica',
  password: 'mysql',
  port: 5432,
  //  ssl: {
  //   rejectUnauthorized: false,
  // },
});

/*Iniciamos el servidor*/
app.listen(port, () => {
  console.log(`Servidor iniciado en puerto ${port}`);
});

/*Metodo get del servidor*/
app.get('/', function (req, res) {
  res.send('Hola mundo')
})

/*Metodo  principal del servidor de tipo post*/
app.post('/webhook', express.json(), function (req, res) {
  const agent = new WebhookClient({ request: req, response: res });

  /* Lo siguiente permite visualizar  por consola el headers y body 
  del request   en formato JSON  */
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));

  // Definimos los intents de Dialogflow
  function welcome(agent) {
    agent.add(`Bienvenido a mi agente!`);
  }
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function inscripcionCurso(agent) {
    //const nombre = agent.parameters.nombre.toString();
    //const curso = agent.parameters.curso.toString();

    /*Obtenemos los parametros recibidos*/
    const nombre = agent.parameters['nombre'].toString();// -> $1
    const curso = agent.parameters['curso'].toString();// -> $2

    //Metemos los datos de nombre y curso a un array
    const valores = [nombre, curso];
    const sql = 'insert into inscripcionCurso(nombreCurso,nombrePersona)values($1,$2)RETURNING *';

    //Ejecutamos la sentencia sql insert
    client.query(sql, valores).then(
      res => {
        console.log(res.rows[0])
      }).catch(e => console.error(e.stack));

    //Respondemos al cliente
    agent.add('Hola ' + nombre + ', gracias por elegirnos, \n te has inscrito correctamente al curso de ' + curso + ' \n puedes empezar en cualquier momento');

    //Mostramos por consola contenido de la tabla inscripcioncurso
    mostrarInscripciones().then((result) => {
      console.log('\n-----Mostrar datos-----\n');
      console.log(result);
    });

  }
  /*Mapeamos los intent creados en Dialogflow*/
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('CursosCapacitacion', inscripcionCurso);
  agent.handleRequest(intentMap);
});




//Mostrar datos de la tabla 
const mostrarInscripciones = async () => {
  const res = await client.query('select * from inscripcionCurso');
  const result = res.rows;
  return result;
};


/*
Nota:
Cuando se usa Pool de conexiones
ya no es necesario abrir y cerrar la conexion
*/