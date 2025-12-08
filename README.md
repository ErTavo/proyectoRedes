Proyecto simple: backend (Express + SQLite) y frontend (React + Vite)

Instrucciones rápidas (Windows PowerShell):

1) Backend

- Abrir terminal en `back`:

  cd "c:\Users\gusjr\OneDrive\Documentos\udeo\SO-Redes\ProyectoRedes\back"
  npm install
  npm start

El servidor quedará escuchando en `http://localhost:3000`.

2) Frontend (desarrollo)

- Abrir terminal en `front`:

  cd "c:\Users\gusjr\OneDrive\Documentos\udeo\SO-Redes\ProyectoRedes\front"
  npm install
  npm run dev

El servidor de Vite por defecto corre en `http://localhost:5173`.

3) Frontend (producción)

- Para construir la versión de producción y que el backend la sirva:

  cd "c:\Users\gusjr\OneDrive\Documentos\udeo\SO-Redes\ProyectoRedes\front"
  npm run build

Esto genera `front/dist`. Si ejecutas el backend desde `back` (npm start), el servidor Express detectará `front/dist` y servirá la SPA en `http://localhost:3000`.

Notas:
- El backend usa CORS en desarrollo para permitir peticiones desde el dev server de Vite.
- La base de datos es `back/data.db` (excluida en `.gitignore`).

Comandos resumen (PowerShell):

```powershell
cd "c:\Users\gusjr\OneDrive\Documentos\udeo\SO-Redes\ProyectoRedes\back"
npm install
npm start

cd "c:\Users\gusjr\OneDrive\Documentos\udeo\SO-Redes\ProyectoRedes\front"
npm install
npm run dev    # o `npm run build` + volver a arrancar backend para servir la build
```

Si quieres, puedo ejecutar `npm install` aquí y arrancar los servidores por ti (dime cuál prefieres: solo backend, o backend + frontend dev).

4) Inicializar SQL Server (opcional)

Si quieres usar un SQL Server en lugar de SQLite, tienes dos opciones:

- Ejecutar el script T-SQL directamente en SQL Server Management Studio u otra herramienta. El script se encuentra en `back/create_mssql_db.sql`. Reemplaza el nombre de la base si quieres otro.

- Usar el script Node incluido `back/mssql_init.js` (usa `mssql` y `minimist`). Ejemplo de uso desde PowerShell con la información que pasaste:

```powershell
cd "c:\Users\gusjr\OneDrive\Documentos\udeo\SO-Redes\ProyectoRedes\back"
npm install
node mssql_init.js --server=192.168.1.6 --port=1433 --user=backEnd --password="user1234*" --database=ProyectoRedesDB
```

Notas de seguridad:
- Guardar credenciales en variables de entorno es preferible. En PowerShell puedes hacer:

```powershell
$env:MSSQL_USER = 'backEnd'
$env:MSSQL_PASSWORD = 'user1234*'
node mssql_init.js --server=192.168.1.6 --port=1433 --database=ProyectoRedesDB
```

Ejemplo rápido de conexión en `index.js` si quieres que el backend use SQL Server en vez de SQLite (no lo cambié automáticamente):

```js
// Ejemplo (instala `mssql`)
const sql = require('mssql')
const pool = await sql.connect({
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: '192.168.1.6',
  port: 1433,
  database: 'ProyectoRedesDB',
  options: { encrypt: false, trustServerCertificate: true }
})
const result = await pool.request().query('SELECT TOP 100 * FROM dbo.submissions')
```

Si quieres que adapte `back/index.js` para usar SQL Server directamente, lo hago cuando me confirmes.
