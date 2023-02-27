// Librerías
// Jimp para editar las imágenes
var jimp = require('jimp');
// AWS SDK para conectar a S3
const { s3 } = require("@aws-sdk/client-s3");

// Función de conversión de imágenes:
// - Recibe un nombre de bucket y el nombre de la imagen subida a dicho bucket
// - Se conecta a S3 para obtener la imagen
// - Redimensiona la imagen
// - Guarda la imagen redimensionada en el mismo bucket en la carpeta out/
// bucket: nombre del bucket en S3
// fileKey: nombre del archivo subido al bucket en la carpeta in/
module.exports = async function convert(bucket, fileKey) {

    // Conectar al bucket de S3 y obtener la imagen
    var orig = await s3.getObject({
	Bucket: bucket,
	Key: fileKey
    }).promise();
    console.log("Imagen leída correctamente desde S3");

    // Cargar la imagen mediante la librería Jimp
    // El contenido del archivo está en el campo 'Body' del objeto leído de S3
    var im = await jimp.read(orig.Body);
    console.log("Imagen cargada correctamente por Jimp");

    // Redimensionar la imagen y generar el resultado en un buffer
    var resiz = await im.resize(300,300).getBufferAsync(jimp.AUTO);
    console.log("Imagen redimensionada correctamente por Jimp");

    // Guardar la imagen redimensionada en el mismo bucket en la carpeta out/
    // Devuelve una promesa, necesario para utilizar funciones asíncronas en el controlador lambda
    // https://docs.aws.amazon.com/es_es/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-handler-async
    return s3.putObject({
	Bucket: bucket,
	Key: fileKey.replace(/^in/, 'out'),
	Body: resiz,
	ACL: 'private'
    }).promise();
};
