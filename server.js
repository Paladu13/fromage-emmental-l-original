const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================================
//  CONFIG — Modifiez ces valeurs selon vos besoins
// ============================================================
const CONFIG = {
  // Nom du fichier screamer (GIF, image, vidéo… placé dans /public/)
  screamerFileName: 'screamer.gif',

  // Temps du chrono en secondes (120 = 2 minutes)
  timerSeconds: 10,

  // Volume des sons du screamer (fichiers dans /musique) en pourcentage (0-100)
  screamerVolume: 1000,
};
// ============================================================

const PORT = process.env.PORT || 3000;

// MIME types pour servir correctement tous les fichiers
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.wma': 'audio/x-ms-wma',
};

/**
 * Liste les fichiers d'un dossier de manière sécurisée.
 * Retourne un tableau d'objets { name, ext }.
 */
function listFilesInDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
      .filter(f => {
        const full = path.join(dirPath, f);
        return fs.statSync(full).isFile();
      })
      .map(f => ({
        name: f,
        ext: path.extname(f).toLowerCase(),
      }));
  } catch {
    return [];
  }
}

const server = http.createServer((req, res) => {
  // Normaliser le chemin de la requête
  let reqPath = req.url.split('?')[0]; // ignorer query string
  if (reqPath === '/') reqPath = '/index.html';

  // ----- API : configuration du screamer -----
  if (reqPath === '/screamer-config') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({
      screamerFileName: CONFIG.screamerFileName,
      timerSeconds: CONFIG.timerSeconds,
      screamerVolume: CONFIG.screamerVolume,
    }));
    return;
  }

  // ----- API : liste des fichiers dans /musique -----
  if (reqPath === '/musique-list') {
    const files = listFilesInDir(path.join(__dirname, 'musique'));
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(files));
    return;
  }

  // ----- API : liste des fichiers dans /chill -----
  if (reqPath === '/chill-list') {
    const files = listFilesInDir(path.join(__dirname, 'chill'));
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(files));
    return;
  }

  // ----- Servir les fichiers statiques -----
  // Sécurité : éviter les traversées de répertoire
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  // Vérifier que le fichier est bien dans le répertoire du site
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Accès interdit');
    return;
  }

  // Lire et servir le fichier
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fichier non trouvé → 404
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 — Page non trouvée</h1>');
      } else {
        // Erreur serveur → 500
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erreur interne du serveur');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});