const cooldowns = new Map()
const { addCollection } = require('../../DB/db')
const loots = require('../../DB/loots')

module.exports = {
    data: {
        name: 'explorar',
        description: 'Descubra sobre o País das Maravilhas! Colete Memórias e Sonhos para saber masi sobre!',
        aliases: ['exp', 'procurar', 'lembrar']
    },
    async execute(message, args) {
        const userId = message.author.id
        const guildId = message.guild.id
        // Tempo de cooldown em milissegundos (aqui, 60 segundos para testar)
        const cooldownTime = 40000

        // --- 1. VERIFICAÇÃO DE COOLDOWN ---
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownTime

            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000
                return message.reply(`Calma, apressadinho! Descanse um pouco. Você pode explorar novamente em ${timeLeft.toFixed(1)} segundos.`)
            }
        }

        // --- 2. DEFINIR O NOVO COOLDOWN ---
        // Coloca o usuário no Map de cooldowns
        cooldowns.set(userId, Date.now())
        // Limpa o Map depois que o tempo acabar (para não usar memória à toa)
        setTimeout(() => cooldowns.delete(userId), cooldownTime)

        // --- 3. LÓGICA DE RECOMPENSAS (LOOT TABLE) ---
        // "weight" (peso) define a chance. Números maiores são mais comuns.
        const lootTable = Array.from(loots.values())

        // Calcula o peso total
        const totalWeight = lootTable.reduce((acc, item) => acc + item.weight, 0);
        // Gera um número aleatório entre 0 e o peso total
        let random = Math.random() * totalWeight;
        let chosenItem

        // Itera na tabela para ver qual item foi "sorteado"
        for (const item of lootTable) {
            if (random < item.weight) {
                chosenItem = item;
                break;
            }
            random -= item.weight;
        }

        let id
        for (const [key, value] of loots.entries()){
            if (value === chosenItem){
                id = key
                break
            }
        }
        // --- 4. RESPOSTA AO USUÁRIO ---
        if (chosenItem.name === 'Nada') {
            await message.reply("Você anda, anda... e se encontra exatamente no mesmo lugar. Que curioso.");
        } else {
            try {
                addCollection(userId, guildId, id, chosenItem.name, chosenItem.type);
                
                await message.reply(`Em sua exploração, você encontrou: **${chosenItem.name}**! (Raridade: ${chosenItem.rarity})`);

            } catch (error) {
                console.error("Erro ao salvar colecionável:", error);
                await message.reply("Você encontrou algo, mas tropeçou e o perdeu... (Ocorreu um erro ao salvar no DB)");
            }
        }
    }
}