// Función Lambda que se ejecuta cuando se sube una imagen a la carpeta in/ de un bucket
// La función obtiene el archivo desde S3, lo redimensiona y guarda el resultado en la carpeta out/ del bucket

// Cargar el archivo con el código
var convert = require('./convert');

// Controlador de la función Lambda: https://docs.aws.amazon.com/es_es/lambda/latest/dg/nodejs-prog-model-handler.html
// La función Lambda recibe dos parámetros: event y context
// event almacena los datos del evento que ha activado la ejecución de la función
// context proporciona métodos y propiedades que facilitan información acerca de la invocación, la función y el entorno de ejecución
// Fuente: https://docs.aws.amazon.com/es_es/lambda/latest/dg/nodejs-prog-model-context.html
exports.handler = async function (event, context) {
	  console.log('processing', JSON.stringify(event));

    // Obtener el evento
	  var eventRecord = event.Records && event.Records[0];

    // Obtener el nombre del bucket
    var bucket = eventRecord.s3.bucket.name;

    // Obtener la ruta del objeto (archivo de imagen subido al bucket)
    var fileKey = eventRecord.s3.object.key;

    // Llamar a la función que ejecuta el procesado.
    // La función convert devuelve una promesa, de acuerdo con https://docs.aws.amazon.com/es_es/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-handler-async
		return convert(bucket, fileKey);
};
