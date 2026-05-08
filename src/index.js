const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const DATA_FILE = '/app/data/counter.json'; // persistant
const TEMP_FILE = '/tmp/session.txt'; // temporaire

// Initialise le compteur si le fichier n'exixte pas

function getCounter() {
	try {
	   return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
	} catch {
	  return { count: 0 };
	}
}

function saveCounter(data) {
	fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
	fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

const server = http.createServer((req, res) => {
	res.setHeader('content-Type', 'application/json');
	if (req.url === '/') {
	   res.end(JSON.stringify({
		message: 'Hello from secure-demo v2',
		hostname: os.hostname(),
	}));

	} else if (req.url === '/count') {
	// ecrit dans /app/data => doit persister entre les restarts
	  const data = getCounter();
	  data.count += 1;
	  saveCounter(data);
	  res.end(JSON.stringify( { count: data.count, stored_in: DATA_FILE }));
	} else if (req.url === '/session') {
	//ecrit dans /tmp => doit disparaitre au restart
	  const val = Date.now().toString();
	  fs.writeFileSync(TEMP_FILE, val);
	  res.end(JSON.stringify({ session: val, stored_in: TEMP_FILE }));
	} else if (req.url === '/status') {
	  const counter = getCounter();
	  let session = null;
	  try { session = fs.readFileSync(TEMP_FILE, 'utf8'); } catch {}
	  res.end(JSON.sringify({
		counter_persisted: counter.count,
		session_in_ram: session,
	  }));

	} else if (req.url === '/whoami') {
	// Revele quel utilisateur fait tourner le process
	res.end(JSON.stringify({
		uid: process.getuid(),
		gid: process.getgid(),
		user: os.userInfo().username,
		}));
	} else if (req.url === '/write-test') {
	// tente d'ecrire un ficjier - revele si le Fs est read-only
	  try {
	    fs.writeFileSync('/app/hack.txt', 'pwned');
	    res.end(JSON.stringify({ result: 'WRITE SUCCESS - filesystem is writable '}));
	  } catch (err) {
		res.end(JSON.stringify({ result: 'WRITE BLOCKED - filesystem is read-only' }));
	  }
	}  else {
		res.statusCode = 404;
		res.end(JSON.stringify({ error: 'Not found'}));
	}

   });
  server.listen(PORT, () =>{
	console.log(`server running on port ${PORT}`);
	console.log(`Running as UID: ${process.getuid()}`);
  });
