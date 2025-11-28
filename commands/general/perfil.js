const Canvas = require('@napi-rs/canvas')
const { AttachmentBuilder } = require('discord.js');
const { getUserStats } = require('../../DB/db');
const { loadData } = require('../../utils/JsonHandler')
const shop = require('../../DB/shop')
const GIFencoder = require('gif-encoder-2')


module.exports = {
    data: {
        name: 'perfil',
        description: 'Mostra o Perfil do usuário',
        aliases: ['pr']
    },
    async execute(message, args) {
        await message.channel.sendTyping()

        const guildId = message.guild.id
        let user
        const mentionedUser = message.mentions.users.first();

        if (mentionedUser) {
            // Se o usuário marcou alguém: !perfil @amigo
            user = mentionedUser;
        } else if (args[0]) {
            try {
                // Se o usuário passou um ID: !perfil 123456789
                user = await message.client.users.fetch(args[0]);
            } catch (error) {
                // Se o ID for inválido, usa o autor
                user = message.author;
            }
        } else {
            // Se não passou nada: !perfil
            user = message.author;
        }
        const stats = getUserStats(user.id, guildId)
        const data = loadData()
        const guildData = data[guildId]
        const userData = guildData.users[user.id]

        const canvas = Canvas.createCanvas(800, 350)
        const ctx = canvas.getContext('2d')

        const equippedId = stats.backgroundUrl
        let backgroundToDraw = '#ff5757'

        if (equippedId) {
            const item = shop.get(equippedId)

            if (item) {
                backgroundToDraw = item.value
            }
        }

        try {
            if (backgroundToDraw.startsWith('#')) {
                ctx.fillStyle = backgroundToDraw
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                const background = await Canvas.loadImage(backgroundToDraw)
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
            }
        } catch (error) {
            console.error('Erro ao carregar fundo do perfil (link quebrado?):', error);
            // FUNDO DE EMERGÊNCIA (se o link da imagem quebrar)
            ctx.fillStyle = '#ff5757';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = '#0a0a0aff'
        ctx.fillRect(0, 200, 800, 150)

        // Nome de usuário
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 25px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(user.username, 120, 260)


        if (userData.boostFragmentos == 1) {
            const frag = await Canvas.loadImage('./Assets/images/fragmentos.png')
            ctx.drawImage(frag, 410, 205, 40, 40)
        } else if (userData.boostFragmentos == 2) {
            const frag = await Canvas.loadImage('./Assets/images/fragmento-verde.png')
            ctx.drawImage(frag, 410, 205, 40, 40)
        } else if (userData.boostFragmentos >= 3 && userData.boostFragmentos <= 4) {
            const frag = await Canvas.loadImage('./Assets/images/fragmento-rosa.png')
            ctx.drawImage(frag, 410, 205, 40, 40)
        } else if (userData.boostFragmentos == 5) {
            const frag = await Canvas.loadImage('./Assets/images/fragmento-laranja.png')
            ctx.drawImage(frag, 410, 205, 40, 40)
        } else {
            const frag = await Canvas.loadImage('./Assets/images/fragmento-vermelha.png')
            ctx.drawImage(frag, 410, 205, 40, 40)
        }

        //Sonhos
        const sonhoImg = await Canvas.loadImage('./Assets/images/sonhos.png')
        ctx.drawImage(sonhoImg, 215, 205, 50, 50)


        ctx.font = '20px sans-serif center'
        ctx.fillStyle = '#b9bbbe'
        ctx.textAlign = 'left'
        const totalHours = Math.floor(stats.totalTimeSeconds / 3600)
        ctx.fillText(`Sonhos: ${stats.totalPoints}`, 260, 240)
        ctx.fillText(`Fragmentos: ${userData.fragmentos}`, 450, 240)
        ctx.fillText(`Tempo em call: ${totalHours} horas`, 260, 270)

        ctx.beginPath()
        ctx.arc(125, 155, 75, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()

        const avatarUrl = user.displayAvatarURL({ extension: 'png' });

        const avatar = await Canvas.loadImage(avatarUrl);
        ctx.drawImage(avatar, 50, 80, 150, 150);

        // 3. Agora o toBuffer() (linha 63) vai funcionar
        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'perfil-image.png' });

        // Substitui "interaction.editReply" por "message.channel.send"
        await message.channel.send({ files: [attachment] });
    },
}