const recipes = new Map()

recipes.set('memoria_chapeleiro', {
    name: 'Memória da uma Festa do Chá',
    description: 'A memória do Chepeleiro de um dia belo sobre sua Festa do Chá.',
    costFragmentos: 80, // Valor para contruir a memória
    value: 2500, // valor a ser trocado
    type: 'memoria',
    rarity: 'Único',
    ingredients: [
        { id: 'chapeu', qtd: 1 },
        { id: 'xicara', qtd: 4 },
    ]
})

recipes.set('festa_do_cha', {
    name: 'Uma Festa do Chá Comum',
    description: 'Uma simples memória de do que foi um dia uma festa do chá',
    costFragmentos: 50, // Valor para contruir a memória
    value: 1600, // valor a ser trocado
    type: 'memoria',
    rarity: 'Único',
    ingredients: [
        { id: 'bule', qtd: 2 },
        { id: 'xicara', qtd: 4 },
        { id: 'bolo', qtd: 1 },
        { id: 'biscoito', qtd: 1 }
    ]
})

recipes.set('xarada', {
    name: 'Uma xarada feita pelo Chapeleiro',
    description: '"Qual a diferença entre um corvo🐦‍⬛e uma escrivaninha?" - Disse o Chapeleiro à Alice',
    costFragmentos: 50, // Valor para contruir a memória
    value: 950, // valor a ser trocado
    type: 'memoria',
    rarity: 'Único',
    ingredients: [
        { id: 'escrivaninha', qtd: 1 },
        { id: 'pena', qtd: 1 },
    ]
})

module.exports = recipes