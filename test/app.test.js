const http = require('http');

function request(path) {
	return new Promise((resolve, reject) => {
	//	http.get(`http://localhost:3002${path}`, (res) => {
		const PORT = process.env.PORT || 3002;
		http.get(`http://localhost:${PORT}${path}`, (res) => {
			let data = '';
			res.on('data', chunk => data += chunk);
			res.on('end', () => resolve({ status: res.statusCode, body:JSON.parse(data) }));
		      }).on('error', reject);
	   });
}

async function run() {
  //demarre le serveur
	const server = require('../src/index');
	await new Promise(r => setTimeout(r, 500));

	let passed = 0;
	let failed = 0;

	async function test(name, fn) {
		try {
		   await fn();
		   console.log(` ${name}`);
		   passed++;
		} catch (err) {
		   console.log(` ${name} - ${err.message}`);
		  failed++;
		}
	       }

		console.log('\nRunning tests...\n');

		await test('GET / retoune 200', async () => {
			const res = await request('/');
			if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
		     });
		await test('GET / retourne un message', async () => {
			const res = await request('/');
			if (!res.body.message) throw new Error('pas de champ message');
		});

		await test ('GET /whoami retourne un uid', async () => {
			const  res = await request('/whoami');
			if (res.body.uid === undefined) throw new Error( 'pas de champ uid');
		});

		await test( 'GET /count retourne un compteur', async () => {
			const res = await request('/count');
			if (res.body.count === undefined) throw new Error('pas de champ count');
		});
		console.log(`\n${passed} passed, ${failed} failed\n`);
		server.close();
		process.exit(failed > 0 ? 1 :0);
  }
run().catch(err => { console.error(err); process.exit(1); });
