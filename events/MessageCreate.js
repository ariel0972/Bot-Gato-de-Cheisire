const { Events } = require('discord.js')
const { prefix } = require('../config.json')


module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        let command = client.commands.get(commandName)

        if (!command) {
            const mainCommandName = client.messageAliases.get(commandName)

            if (mainCommandName) {
                command = client.commands.get(mainCommandName)
            }
        }

        if (!command) {
            await message.channel.sendTyping()
            return message.reply('Esse comando não existe! Ta na disney?')
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('Houve um erro ao tentar executar esse comando!');
        }
    }
}