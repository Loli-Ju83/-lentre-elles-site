// Ce script tourne automatiquement à chaque publication (configuré côté Netlify).
// Il lit les fiches individuelles créées via /admin (une par catégorie, besoin, membre...)
// et les rassemble dans un seul fichier par type, que le site va ensuite charger.
// Rien à exécuter à la main : Netlify s'en occupe tout seul à chaque mise à jour.

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function aggregateFolder(folderName, wrapperKey) {
  const folderPath = path.join(dataDir, folderName);
  if (!fs.existsSync(folderPath)) {
    return { [wrapperKey]: [] };
  }
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
  const items = files.map(f => {
    const slug = f.replace(/\.json$/, '');
    let content = {};
    try {
      content = JSON.parse(fs.readFileSync(path.join(folderPath, f), 'utf8'));
    } catch (e) {
      console.error('Erreur de lecture sur', f, e.message);
    }
    return Object.assign({ slug: slug }, content);
  });
  return { [wrapperKey]: items };
}

function writeJSON(fileName, data) {
  fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2));
  console.log('Généré :', fileName, '(' + (Object.values(data)[0] || []).length + ' élément(s))');
}

writeJSON('categories.json', aggregateFolder('categories', 'categories'));
writeJSON('besoins.json', aggregateFolder('besoins', 'besoins'));
writeJSON('event_categories.json', aggregateFolder('event_categories', 'categories'));
writeJSON('members.json', aggregateFolder('members', 'members'));

console.log('Tous les fichiers ont été générés avec succès.');
