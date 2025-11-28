module.exports = {
    data: {
        name: 'ping',
        description: 'Responde com Pong!',
    },
    async execute(message, args) {
        await message.channel.send('Pong!');
    },
};