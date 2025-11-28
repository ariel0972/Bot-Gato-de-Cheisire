const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
require('dotenv').config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
})

client.commands = new Collection()
client.messageAliases = new Collection()
client.voiceSessions = new Map()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
            if (command.data.aliases && Array.isArray(command.data.aliases)) {
                command.data.aliases.forEach(alias => {
                    client.messageAliases.set(alias, command.data.name);
                });
            }
        } else {
            console.log(`[Aviso!!] O comando em  ${filePath} está faltando a propreidade 'data' ou 'execute'.`)
        }
    }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.file) {
        client.once(event.name, (...args) => event.execute(...args, client))
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.TOKEN)