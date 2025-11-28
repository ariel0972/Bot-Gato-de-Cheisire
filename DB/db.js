const Database = require('better-sqlite3');
const db = new Database('pontos.db');

// Cria a tabela se ela não existir
const creareTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            userId TEXT NOT NULL,
            guildId TEXT NOT NULL,
            totalTimeSeconds INTEGER DEFAULT 0,
            totalPoints INTEGER DEFAULT 0,
            background TEXT DEFAULT NULL,
            PRIMARY KEY (userId, guildId)
        )
    `
db.exec(creareTable);
console.log('Banco de dados pronto.');

const createWardrobe = `
    CREATE TABLE IF NOT EXISTS guarda_roupa (
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        itemId TEXT NOT NULL,
        PRIMARY KEY (userId, guildId, itemId)
    )
`;
db.exec(createWardrobe);

const createInventory = `
    CREATE TABLE IF NOT EXISTS inventario (
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        itemId TEXT NOT NULL,
        itemName TEXT NOT NULL,
        itemType TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        PRIMARY KEY (userId, guildId, itemId)
    )
`;
db.exec(createInventory);

try {
    // Tenta adicionar a coluna 'quantity' se ela não existir
    db.exec('ALTER TABLE guarda_roupa ADD COLUMN quantity INTEGER DEFAULT 1');
    console.log('Coluna "quantity" adicionada à tabela guarda_roupa.');
} catch (error) {
    // Se der erro dizendo que a coluna já existe, ignoramos.
    if (!error.message.includes('duplicate column')) {
        console.error('Erro ao adicionar coluna quantity:', error);
    }
}

try {
    db.exec('ALTER TABLE usuarios ADD COLUMN backgroundUrl TEXT DEFAULT NULL');
    console.log('Coluna "backgroundUrl" adicionada com sucesso.');
} catch (error) {
    if (!error.message.includes('duplicate column')) {
        console.error('Erro ao adicionar coluna no DB:', error);
    }
}

function swapEquippedBackground(userId, guildId, newItemId) {
    // A transação garante que nada se perca no meio do caminho
    const swapTransaction = db.transaction(() => {

        const userEntry = db.prepare('SELECT backgroundUrl FROM usuarios WHERE userId = ? AND guildId = ?').get(userId, guildId);
        const currentEquippedId = userEntry ? userEntry.backgroundUrl : null;

        const removeStmt = db.prepare(`
            UPDATE guarda_roupa 
            SET quantity = quantity - 1 
            WHERE userId = ? AND guildId = ? AND itemId = ?
        `);
        const info = removeStmt.run(userId, guildId, newItemId);

        if (info.changes === 0) {
            throw new Error("Você não possui este item no inventário para equipar.");
        }

        db.prepare('DELETE FROM guarda_roupa WHERE quantity <= 0').run();

        if (currentEquippedId) {
            const isColorOrLink = currentEquippedId.startsWith('#') || currentEquippedId.startsWith('http')
            if (!isColorOrLink) {
                const addStmt = db.prepare(`
                    INSERT INTO guarda_roupa (userId, guildId, itemId, quantity)
                    VALUES (?, ?, ?, 1)
                    ON CONFLICT(userId, guildId, itemId) DO UPDATE SET
                        quantity = quantity + 1
                `);
                addStmt.run(userId, guildId, currentEquippedId);
            }
        }

        const equipStmt = db.prepare(`
            INSERT INTO usuarios (userId, guildId, backgroundUrl) VALUES (?, ?, ?)
            ON CONFLICT(userId, guildId) DO UPDATE SET backgroundUrl = excluded.backgroundUrl
        `);
        equipStmt.run(userId, guildId, newItemId)
    });

    // Executa a transação
    swapTransaction();
}

function updateBackground(userId, guildId, url) {
    getUserStats(userId, guildId)

    const stmt = db.prepare('UPDATE usuarios SET backgroundUrl = ? WHERE userId = ? AND guildId = ?')
    stmt.run(url, userId, guildId)
}

// Função para atualizar os dados do usuário
function updateUserStats(userId, guildId, timeSeconds, pointsEarned) {
    const stmt = db.prepare(`
        INSERT INTO usuarios (userId, guildId, totalTimeSeconds, totalPoints)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(userId, guildId) DO UPDATE SET
            totalTimeSeconds = totalTimeSeconds + excluded.totalTimeSeconds,
            totalPoints = TotalPoints + excluded.totalPoints
    `);
    stmt.run(userId, guildId, timeSeconds, pointsEarned);
}

// Função para pegar os dados do usuário (para um comando !pontos)
function getUserStats(userId, guildId) {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE userId = ? AND guildId = ?');
    let user = stmt.get(userId, guildId);

    if (!user) {
        const insertStmt = db.prepare('INSERT INTO usuarios (userId, guildId) VALUES (?, ?)');
        insertStmt.run(userId, guildId);
        user = { userId, guildId, totalTimeSeconds: 0, totalPoints: 0, backgroundUrl: null };
    }
    return user;
}

function Comprar(userId, guildId, amount) {
    const stmt = db.prepare(`
            UPDATE usuarios
            SET totalPoints = totalPoints - ?
            WHERE userId = ? AND guildId = ?
        `)
    stmt.run(amount, userId, guildId)
}

function addItem(userId, guildId, itemId) {
    const stmt = db.prepare(`
        INSERT INTO guarda_roupa (userId, guildId, itemId) 
        VALUES (?, ?, ?)
        ON CONFLICT(userId, guildId, itemId) DO NOTHING
    `);
    stmt.run(userId, guildId, itemId);
}

// Verifica se o usuário JÁ POSSUI um item
function checkItem(userId, guildId, itemId) {
    const stmt = db.prepare('SELECT 1 FROM guarda_roupa WHERE userId = ? AND guildId = ? AND itemId = ?');
    const item = stmt.get(userId, guildId, itemId);
    return !!item; // Retorna true se 'item' existir, false se não
}

// Pega todos os itens do inventário de um usuário
function getInv(userId, guildId) {
    const stmt = db.prepare('SELECT itemId FROM guarda_roupa WHERE userId = ? AND guildId = ?');
    return stmt.all(userId, guildId); // Retorna um array [ {itemId: 'vermelho'}, {itemId: 'floresta'} ]
}

function addCollection(userId, guildId, itemId, itemName, itemType) {
    const stmt = db.prepare(`
        INSERT INTO inventario (userId, guildId, itemId, itemName, itemType, quantity)
        VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(userId, guildId, itemId) DO UPDATE SET
            quantity = quantity + 1
    `);
    stmt.run(userId, guildId, itemId, itemName, itemType)
}

function getCollection(userId, guildId) {
    const stmt = db.prepare('SELECT itemId, quantity FROM inventario WHERE userId = ? AND guildId = ?')
    return stmt.all(userId, guildId)
}

function consumirItems(userId, guildId, Items) {
    const transaction = db.transaction((items) => {
        for (const item of items) {
            const stmt = db.prepare(`
                UPDATE inventario
                SET quantity = quantity - ?
                WHERE userId = ? AND guildId = ? and itemId = ?
                `)
            const info = stmt.run(item.qtd, userId, guildId, item.id)

            if (info.changes === 0){
                throw new Error(`Item ${item.id} não encontrado ou quantidade insuficiente`);
                
            }
        }
        db.prepare('DELETE FROM inventario WHERE quantity <= 0').run()
    })

    transaction(Items)
}

// Exporta as funções
module.exports = {
    updateUserStats,
    getUserStats,
    Comprar,
    updateBackground,
    addItem,
    checkItem,
    getInv,
    swapEquippedBackground,
    addCollection,
    getCollection,
    consumirItems
}