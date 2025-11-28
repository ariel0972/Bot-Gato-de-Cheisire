const Database = require('better-sqlite3');
const db = new Database('pontos.db');

try {
    // Remove itens que começam com '#' (cores hexadecimais) da tabela guarda_roupa
    const info = db.prepare("DELETE FROM inventario WHERE itemId LIKE 'O Saleiro'").run();
    console.log(`Limpeza concluída! ${info.changes} itens inválidos removidos.`);
    // db.exec('ALTER TABLE inventario ADD COLUMN itemType TEXT DEFAULT "colecionavel"')
    // db.exec('UPDATE inventario SET itemType = "colecionavel" WHERE itemType IS NULL');

} catch (error) {
    console.error('Erro ao limpar:', error);
}