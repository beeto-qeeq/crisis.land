const fs = require('fs');
const https = require('https');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'Holamundo0%',
    host: '35.188.41.3',
    port: 5432,
    database: 'postgres',
});

const TYPE_ICON = { fire: '🔥', block: '🚧', spike: '🛞', shooting: '💥', other: '⚠️' };

https.get('https://narcos-app-422d4-default-rtdb.firebaseio.com/reports.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
        let reports = [];
        try {
            const fbData = JSON.parse(data);
            if (fbData) {
                reports = Object.entries(fbData).map(([id, v]) => ({
                    id, ...v
                })).filter(r => r.status === 'approved');
            }
        } catch (e) { console.error('Error parsing FB', e); }

        const html = fs.readFileSync('netlify_index.html', 'utf8');
        const match = html.match(/const INITIAL = (\[[\s\S]*?\]);/);
        let initials = [];
        if (match) {
            try {
                initials = eval(match[1]);
            } catch (e) { console.error('Error parsing INITIAL', e); }
        }

        let inserts = [];

        initials.forEach(inc => {
            inserts.push({
                title: inc.title || 'Evento',
                description: inc.address || inc.place || '',
                latitude: inc.lat,
                longitude: inc.lng,
                source: 'OFICIAL',
                created_at: new Date(inc.ts || Date.now()).toISOString()
            });
        });

        reports.forEach(r => {
            const emoji = TYPE_ICON[r.type] || '⚠️';
            const desc = r.desc || '';
            let title = emoji + ' ' + (desc.length > 50 ? desc.substring(0, 50) + '...' : desc);
            if (!desc) title = emoji + ' Reporte ciudadano';

            inserts.push({
                title: title,
                description: desc,
                latitude: r.lat,
                longitude: r.lng,
                source: 'CIUDADANO',
                created_at: new Date(r.ts || Date.now()).toISOString()
            });
        });

        console.log(`Total events to insert: ${inserts.length}`);

        try {
            for (let event of inserts) {
                await pool.query(
                    'INSERT INTO events (title, description, latitude, longitude, source, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
                    [event.title, event.description, event.latitude, event.longitude, event.source, event.created_at]
                );
            }
            console.log('Done inserting!');
        } catch (e) {
            console.error('DB Error', e);
        }
        process.exit();
    });
});
