const loots = require('../loots');
const recipes = require('../recipes');
const rewards = require('../rewards');
const shop = require('../shop'); // Até os da loja!

// Cria um Mapzão gigante com tudo
const allItems = new Map([...loots, ...rewards, ...recipes]);

module.exports = allItems;