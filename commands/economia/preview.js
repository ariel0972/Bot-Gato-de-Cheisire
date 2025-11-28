const Canvas = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { getUserStats } = require('../../DB/db'); // Para os stats (pontos, tempo)
const shop = require('../../DB/shop.js'); // Para o fundo

module.exports = {
    data: {
        name: 'preview',
        description: 'Mostra uma prévia de como seu perfil ficaria com um item.',
    },
    async execute(message, args) {
        const itemId = args[0]?.toLowerCase();
        if (!itemId) {
            return message.reply('Você precisa dizer o ID do item para ver o preview. Use `!loja`.');
        }

        // 1. Pega o item do catálogo
        const item = shop.get(itemId);
        if (!item) {
            return message.reply(`Item \`${itemId}\` não encontrado.`);
        }
        
        await message.channel.sendTyping();

        // 2. Pega os dados do usuário (para os textos)
        const user = message.author;
        const stats = getUserStats(user.id, message.guild.id);
        
        // --- INÍCIO DA LÓGICA DO CANVAS (copiada do !perfil) ---
        const canvas = Canvas.createCanvas(800, 350);
        const ctx = canvas.getContext('2d');

        // 3. A MÁGICA: Usa o valor do item da loja, não do DB
        const backgroundValue = item.value; 

        try {
            if (backgroundValue.startsWith('#')) {
                ctx.fillStyle = backgroundValue;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                const background = await Canvas.loadImage(backgroundValue)
                ctx.drawImage(background, 0, -600, background.width*1.60, background.height*1.60)
            }
        } catch (error) {
            console.error('Erro ao carregar preview:', error);
            ctx.fillStyle = '#9b90f6'; // Fundo de emergência
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 4. Desenha o resto (textos, avatar, etc.)
        // (Copie esta parte do seu comando !perfil funcional)
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(user.username, 230, 90); 

        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#ffffff'; 
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        
        const totalHours = (stats.totalTimeSeconds || 0 / 3600).toFixed(2);
        const totalPontos = stats.totalPoints || 0;

        ctx.fillText(`Sonhos: ${totalPontos}`, 230, 140);
        ctx.fillText(`Tempo em call: ${totalHours}h`, 230, 180);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 1;

        ctx.beginPath();
        ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        try {
            const avatarUrl = user.displayAvatarURL({ extension: 'png' });
            if (avatarUrl) {
                const avatar = await Canvas.loadImage(avatarUrl);
                ctx.drawImage(avatar, 50, 50, 150, 150);
            }
        } catch (err) {}
        
        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'preview-image.png' });
        await message.channel.send({ 
            content: `Aqui está uma prévia de **${item.name}**:`,
            files: [attachment] 
        });
        // --- FIM DA LÓGICA DO CANVAS ---
    }
}