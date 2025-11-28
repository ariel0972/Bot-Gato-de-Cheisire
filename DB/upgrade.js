const upgrades = new Map()

upgrades.set('boostFragmentos',{
    name: 'Coletor de Fragmentos',
    description: 'Aumenta a quantidade de fragmentos ganhos por mensagens.',
    // custos[Nível_Alvo] = Preço
    costs: {
        2: 100, // Comprar o Nível 2 custa 100 fragmentos
        3: 250, // Comprar o Nível 3 custa 250 fragmentos
        4: 500,
        5: 800,
        6: 1200  // Comprar o Nível 4 custa 500 fragmentos
    },
    maxLevel: 6
})

module.exports = upgrades