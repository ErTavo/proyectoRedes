/*
Node script para crear la base (opcional) y la tabla en SQL Server usando `mssql`.
Uso:
  node mssql_init.js --server=192.168.1.6 --port=1433 --user=backEnd --password="user1234*" --database=ProyectoRedesDB

Si tu usuario no tiene permisos para crear la base, primero crea la base con el script SQL y luego ejecuta con --database apuntando a la base existente.
*/

const sql = require('mssql')
const argv = require('minimist')(process.argv.slice(2))

const server = argv.server || 'localhost'
const port = argv.port || 1433
const user = argv.user || process.env.MSSQL_USER
const password = argv.password || process.env.MSSQL_PASSWORD
const database = argv.database || 'ProyectoRedesDB'

if (!user || !password) {
  console.error('Falta usuario o contraseña. Pasa --user y --password o define MSSQL_USER/MSSQL_PASSWORD.');
  process.exit(1)
}

async function main(){
  // Conectar a la base 'master' para poder crear la DB si hace falta
  const masterConfig = {
    user,
    password,
    server,
    port: Number(port),
    options: { encrypt: false, trustServerCertificate: true },
    database: 'master'
  }

  try{
    let pool = await sql.connect(masterConfig)
    // Crear DB si no existe
    const checkDb = await pool.request()
      .query(`IF DB_ID(N'${database}') IS NULL CREATE DATABASE [${database}];`)
    console.log('Comprobada/creada base:', database)

    // Ahora conectamos a la base creada para crear la tabla
    await pool.close()
    const dbConfig = Object.assign({}, masterConfig, { database })
    pool = await sql.connect(dbConfig)

    const createTable = `IF OBJECT_ID(N'dbo.submissions', N'U') IS NULL
    CREATE TABLE dbo.submissions (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(200) NOT NULL,
      email NVARCHAR(200) NOT NULL,
      message NVARCHAR(MAX) NULL,
      created_at DATETIME2 DEFAULT SYSUTCDATETIME()
    );`

    await pool.request().batch(createTable)
    console.log('Tabla dbo.submissions comprobada/creada en', database)

    await pool.close()
    process.exit(0)
  }catch(err){
    console.error('Error:', err.message || err)
    process.exit(2)
  }
}

main()
