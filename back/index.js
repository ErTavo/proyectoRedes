const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const dbConfig = require('./dbConfig');

const app = express();
let sqlite3 = null;
let sqliteDb = null;
let mssql = null;

app.use(cors());
app.use(express.json());

async function initDatabases(){
  if (dbConfig.useMssql) {
    try{
      mssql = require('mssql');
      const cfg = {
        user: dbConfig.user,
        password: dbConfig.password,
        server: dbConfig.host,
        port: Number(dbConfig.port || 1433),
        database: dbConfig.database,
        options: { encrypt: false, trustServerCertificate: true }
      };
      global.mssqlPool = await mssql.connect(cfg);
      console.log('Connected to MSSQL at', dbConfig.host + ':' + dbConfig.port);
    }catch(err){
      console.error('MSSQL connection error:', err.message || err);
      process.exit(1);
    }
  } else {
    sqlite3 = require('sqlite3').verbose();
    const dbFile = path.join(__dirname, 'data.db');
    sqliteDb = new sqlite3.Database(dbFile);
    sqliteDb.serialize(() => {
      sqliteDb.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    });
    console.log('SQLite DB ready at', dbFile);
  }
}

// GET items
app.get('/api/items', async (req, res) => {
  if (dbConfig.useMssql) {
    try{
      const pool = global.mssqlPool;
      const result = await pool.request().query('SELECT id, name, email, message, created_at FROM dbo.submissions ORDER BY created_at DESC');
      res.json(result.recordset);
    }catch(err){
      res.status(500).json({ error: err.message || String(err) });
    }
  } else {
    sqliteDb.all('SELECT * FROM submissions ORDER BY created_at DESC', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// POST item
app.post('/api/items', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  if (dbConfig.useMssql) {
    try{
      const pool = global.mssqlPool;
      const r = await pool.request()
        .input('name', mssql.NVarChar(200), name)
        .input('email', mssql.NVarChar(200), email)
        .input('message', mssql.NVarChar(mssql.MAX), message || '')
        .query('INSERT INTO dbo.submissions (name, email, message) OUTPUT INSERTED.id VALUES (@name, @email, @message)');
      const insertedId = r.recordset && r.recordset[0] && r.recordset[0].id;
      res.json({ id: insertedId });
    }catch(err){
      res.status(500).json({ error: err.message || String(err) });
    }
  } else {
    const stmt = sqliteDb.prepare('INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)');
    stmt.run(name, email, message || '', function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
    stmt.finalize();
  }
});

const PORT = process.env.PORT || 3000;

// Serve frontend build if present
const frontDist = path.join(__dirname, '..', 'front', 'dist');
if (fs.existsSync(frontDist)) {
  app.use(express.static(frontDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontDist, 'index.html')));
}

initDatabases().then(() => {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize databases:', err);
  process.exit(1);
});
