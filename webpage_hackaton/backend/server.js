const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
    host: 'movilidadunitec.c3sk4oigqx9u.us-east-2.rds.amazonaws.com',
    user: 'postgres',
    password: '12345678',
    database: 'movilidadunitec',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

app.get('/filters', async (req, res) => {
    try {
        const client = await pool.connect();
        console.log('Connected to the database');
        try {
            const queryCarrerasFacultades = 'SELECT DISTINCT carrera, facultad FROM public.alumno';
            const queryHorasDiasEdificios = 'SELECT DISTINCT hora, dias, aula FROM public.seccion';

            const resultCarrerasFacultades = await client.query(queryCarrerasFacultades);
            const resultHorasDiasEdificios = await client.query(queryHorasDiasEdificios);

            const carreras = [...new Set(resultCarrerasFacultades.rows.map(item => item.carrera).filter(item => item))];
            const facultades = [...new Set(resultCarrerasFacultades.rows.map(item => item.facultad).filter(item => item))];
            const horas = [...new Set(resultHorasDiasEdificios.rows.map(item => item.hora).filter(item => item))];
            const dias = [...new Set(resultHorasDiasEdificios.rows.map(item => item.dias).filter(item => item))];

            const edificios = new Set();
            const aulas = new Set();

            resultHorasDiasEdificios.rows.forEach(item => {
                if (item.aula) {
                    if (item.aula.includes('/')) {
                        const [edificio, aula] = item.aula.split('/');
                        edificios.add(edificio);
                        aulas.add(aula);
                    } else if (item.aula === 'POLID') {
                        edificios.add(item.aula);
                    } else {
                        aulas.add(item.aula);
                    }
                }
            });

            res.json({
                carreras,
                facultades,
                horas,
                dias,
                edificios: [...edificios],
                aulas: [...aulas]
            });
        } finally {
            client.release();
            console.log('Client released');
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Server error');
    }
});

app.get('/graph-data', async (req, res) => {
    try {
        const { dia, hora, carreraUniversitaria, facultad, nivelDetalle, edificio } = req.query;
        const client = await pool.connect();
        console.log('Connected to the database');

        try {
            let query = `
                SELECT a.cuenta, a.carrera, a.facultad, s.seccion, s.hora, s.aula, s.dias 
                FROM public.alumnoxseccion ax
                INNER JOIN public.alumno a ON ax.cuenta = a.cuenta
                INNER JOIN public.seccion s ON ax.seccion = s.seccion
                WHERE 1=1
            `;
            
            // Filtros obligatorios
            if (dia) {
                query += ` AND s.dias LIKE '%${dia}%'`;
            }

            if (hora) {
                query += ` AND s.hora = '${hora}'`;
            }

            // Filtros opcionales
            if (carreraUniversitaria) {
                query += ` AND a.carrera = '${carreraUniversitaria}'`;
            } else if (facultad) {
                query += ` AND a.facultad = '${facultad}'`;
            }

            // Detalle por edificio o aula
            if (nivelDetalle === 'classroom' && edificio) {
                query += ` AND s.aula LIKE '${edificio}/%'`;
            } else if (nivelDetalle === 'building' && !edificio) {
                query += ` AND s.aula LIKE '%'`;
            }

            console.log('SQL Query:', query);
            const result = await client.query(query);
            console.log('Query result:', result.rows);

            const nodes = [];
            const links = [];
            const nodeSet = new Set();

            result.rows.forEach(row => {
                const [edificio, aula] = row.aula.split('/');
                const cuenta = row.cuenta;
                const nodeAula = { id: `${edificio}-${aula}`, label: aula, group: edificio };
                const nodeCuenta = { id: cuenta, label: cuenta };

                if (!nodeSet.has(`${edificio}-${aula}`)) {
                    nodes.push(nodeAula);
                    nodeSet.add(`${edificio}-${aula}`);
                }

                if (!nodeSet.has(cuenta)) {
                    nodes.push(nodeCuenta);
                    nodeSet.add(cuenta);
                }

                links.push({ source: cuenta, target: `${edificio}-${aula}` });
            });

            const graphData = { nodes, links };

            console.log('Graph data:', graphData);

            if (nodes.length === 0 || links.length === 0) {
                console.warn('No nodes or links found in the graph data');
            }

            res.json(graphData);
        } finally {
            client.release();
            console.log('Client released');
        }
    } catch (err) {
        console.error('Error fetching graph data:', err);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
