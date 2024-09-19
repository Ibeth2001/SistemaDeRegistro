const express = require('express');
const mysql = require('mysql2');
const exceljs = require('exceljs');
const multer = require('multer');
const app = express();
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ab123456',
    database: 'equipo_db'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

// Rutas
app.post('/equipos', (req, res) => {
    const { nombre, ip, agencia, ubicacion } = req.body;
    const query = `INSERT INTO equipos (nombre, ip, agencia, ubicacion) VALUES (?, ?, ?, ?)`;
    db.query(query, [nombre, ip, agencia, ubicacion], (err, result) => {
        if (err) throw err;
        res.send('Equipo registrado');
    });
});

// Subida de archivo Excel
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
    const workbook = new exceljs.Workbook();
    workbook.xlsx.readFile(req.file.path).then(() => {
        const worksheet = workbook.getWorksheet(1);
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const [nombre, ip, agencia, ubicacion] = row.values;
            const query = `INSERT INTO equipos (nombre, ip, agencia, ubicacion) VALUES (?, ?, ?, ?)`;
            db.query(query, [nombre, ip, agencia, ubicacion], (err, result) => {
                if (err) throw err;
            });
        });
        res.send('Archivo subido y datos registrados');
    });
});

// Exportar a Excel
app.get('/export', (req, res) => {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Equipos');
    worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 25 },
        { header: 'IP', key: 'ip', width: 15 },
        { header: 'Agencia', key: 'agencia', width: 20 },
        { header: 'Ubicación', key: 'ubicacion', width: 20 }
    ];
    
    db.query('SELECT * FROM equipos', (err, rows) => {
        if (err) throw err;
        rows.forEach(row => worksheet.addRow(row));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="equipos.xlsx"');
        workbook.xlsx.write(res).then(() => res.end());
    });
});
// Obtener todos los equipos (para la tabla)
app.get('/equipos', (req, res) => {
    db.query('SELECT * FROM equipos', (err, rows) => {
        if (err) throw err;
        res.json(rows);
    });
});


app.listen(5500, () => console.log('Servidor iniciado en el puerto 3000'));
