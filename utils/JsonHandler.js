const fs = require('node:fs');
const path = require('node:path');

// Sobe dois níveis (ex: de /events/admin para a raiz) e aponta para pontos.json
const dbPath = path.join(__dirname, '..', 'pontos.json');

// Carrega os dados do JSON
function loadData() {
    try {
        if (fs.existsSync(dbPath)) {
            const content = fs.readFileSync(dbPath, 'utf8');
            if (content) {
                return JSON.parse(content);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar pontos, criando novo DB:', error);
    }
    return {}
}

// --- Esta é a nossa cópia dos dados na memória ---
let dataCache = loadData(); 

// Função para LER os dados da memória
function getData() {
    return dataCache;
}

// Salva os dados no JSON (de forma assíncrona)
function saveData(data) {

    dataCache = data
    
    try {
        fs.writeFile(dbPath, JSON.stringify(dataCache, null, 2), (error) => {
            if (error) console.error('Erro ao salvar os dados:', error);
        });
        backup(data)
    } catch (error) {
        console.error('Erro fatal ao tentar salvar dados:', error);
    }
}

function backup(data) {

    dataCache = data
    const backupPath = path.join(__dirname, '..', 'pontos-backup.json')
    
    try {
        fs.writeFile(backupPath, JSON.stringify(dataCache, null, 2), (error) => {
            if (error) console.error('Erro ao salvar os dados:', error);
        });
    } catch (error) {
        console.error('Erro fatal ao tentar salvar dados:', error);
    }
}

module.exports = { loadData, saveData, getData };