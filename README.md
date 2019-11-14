# Función Lambda para redimensionar imágenes subidas a S3
Ejemplo sencillo con NodeJS para comprobar el funcionamiento de una función AWS Lambda que responde a eventos generados desde AWS S3.

Utiliza [Claudia](https://claudiajs.com/) para automatizar la activación de eventos y crear los privilegios necesarios para acceder a S3.

La función se ejecuta cuando se sube una imagen a la carpeta `in/` del bucket. Una vez subido el archivo, se redimensiona con un tamaño de 300x300px y se guarda el resultado en la carpeta `out` del mismo bucket.

Está basado en [este proyecto de ejemplo de ClaudiaJS](https://github.com/claudiajs/example-projects/tree/master/s3-file-processing).

# Instalación
1. Instalar [Node](https://nodejs.org/es/)
2. Instalar [Claudia](https://claudiajs.com/) como paquete global: `npm install -g claudia`
3. Crear un usuario de IAM con las siguientes características:
  - Tipo: **Acceso mediante programación**. 
  - Permisos: **Asociar directamente a las políticas existente**
    - `AWSLambdaFullAccess`
    - `IAMFullAccess`
4. Descargar la clave de acceso y la clave secreta y almacenarlas en el archivo `.aws/credentials` dentro de la carpeta de usuario en el equipo local
5. Crear un bucket en AWS S3 en la misma región en que se lanzará la función Lambda (por defecto, `eu-west-1`, Irlanda).
6. Clonar el repositorio mediante `git clone`
7. Acceder a la carpeta del repositorio `cd image-resizer`
8. Instalar las dependencias mediante `npm install`
9. Crear la función ejecutando `npm start`
10. Ejecutar `claudia add-s3-event-source --bucket NOMBRE_BUCKET --prefix in/` para conectar los eventos que se produzcan en el bucket con la función Lambda (reemplazar `NOMBRE_BUCKET` por el nombre del bucket creado)
11. Subir una imagen al bucket dentro de la carpeta `in/`
12. Comprobar que se genera automáticamente una copia de la imagen redimensionada en la carpeta `out/` del mismo bucket
13. Si se desea hacer cambios en la función y publicarlos en Lambda se deberá ejecutar `npm run deploy`

# Funcionamiento
Puedes ver el procedimiento de despliegue de la aplicación en este tutorial en Youtube:
[![Tutorial en Youtube](https://img.youtube.com/vi/xLQ8BhsB9fU/0.jpg)](https://www.youtube.com/watch?v=xLQ8BhsB9fU)

## Archivo `package.json`
Este archivo contiene la información de la aplicación así como su configuración.

Como dependencias tiene los paquetes `aws-sdk` para realizar conexiones a S3 desde la función Lambda y `jimp` para realizar la edición de la imagen.

Como dependencias de desarrollo tiene el paquete `claudia` para poder desplegar la aplicación.

En el campo `scripts` se definen las acciones que se pueden realizar:
- `start` - Define el código para **crear** la función Lambda. Para ello se utiliza el comando `claudia create` indicando:
  - `--name image-resizer` - El nombre de la función (`image-resizer`)
  - `--region eu-west-1` - La región de AWS donde se desplegará la función. Debe coincidir con la región donde se ha creado el bucket de S3.
  - `--handler main.handler` - Indica el nombre del módulo JS que se ejecutará. Se refiere al archivo `main.js`
  - `--timeout 10` - Indica que el timeout de la función será de 10 segundos. Si en ese tiempo la función no ha terminado, se abortará su ejecución.
- `deploy` - Define el comando utilizado para subir los cambios a una función de Lambda ya creada. Se utiliza el comando `claudia update`
- `test` - Comando utilizado para realizar un test de la función. Se ejecuta `claudia test-lambda`

Al realizar la creación de la función, `Claudia` creará automáticamente un **rol** en IAM con el nombre `image-resizer-executor` con permisos para crear logs que serán visibles en AWS CloudWatch.

## Archivo `main.js`
Contiene el [controlador principal](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html) de la función Lambda. Esta función es el punto de entrada cada vez que se ejecuta la función Lambda.

Como la función se ejecuta a partir de un evento, los parámetros de la función contendrán los datos de dicho evento: en este caso, el nombre del bucket y la ruta del fichero creado.

## Archivo `convert.js`
Este archivo contiene el código para realizar la conversión de una imagen guardada en la carpeta `in/` del bucket y guardar el resultado en la carpeta `out/` del mismo bucket.

## Comando `claudia add-s3-event-source`
No basta solo con crear la función Lambda: también hay que configurar el bucket de S3 para que **notifique** a la función Lambda cuando se produzca una subida de un archivo. Este paso se puede realizar a través de la consola en un entorno gráfico o a través de la línea de comandos.

`Claudia` ofrece un comando apropiado para realizar esta tarea: 

`claudia add-s3-event-source --bucket NOMBRE_BUCKET --prefix in/`

Como parámetros se indican el nombre del bucket de S3 y el **prefijo**, que corresponde con la runta de la carpeta `in/`. De esta manera solo se informará de los archivos subidos a dicha carpeta.

Este comando realiza las siguientes tareas:
- Modifica la configuración del bucket para que notifique todos los eventos de creación de objetos a la función Lambda
- Modifica la política `image-resizer-executor` asociada a la función Lambda para que le proporcione permisos de acceso (lectura y escritura) al bucket
