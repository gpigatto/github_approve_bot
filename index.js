const { Client, GatewayIntentBits, REST, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { token, client_id, guild_id } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const TOKEN = token;
const CLIENT_ID = client_id;
const GUILD_ID = guild_id;

const limit = 3;

const rest = new REST({ version: '10' }).setToken(TOKEN);

const commands = [
    {
        name: 'approve',
        description: 'Create a Approve',
        type: 1,
        options: [
            {
                name: 'url',
                description: 'github url',
                type: 3,
                required: true,
            },
            {
                name: 'team',
                description: 'team',
                type: 8,
                required: false
            }
        ],
    },
];

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(`/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`, {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async (interaction) => {
    console.log(interaction)

    if (interaction.isChatInputCommand()) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('approve_button_0')
                    .setLabel(`✅ Approved [0 / ${limit.toString()}]`)
                    .setStyle('Success')
            );

        const content = `PR: ${interaction.options.data[0].value} ${interaction.options.data[1] != null ? `Team: ${interaction.options.data[1].role.name}` : ''}`

        await interaction.reply({
            content: content,
            components: [row],
        });
    }

    if (interaction.customId != null && interaction.customId.includes('approve_button') && interaction.customId != 'approve_button_delete') {
        const nextPosition = parseInt(interaction.customId.slice(-1)) + 1;

        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_button_${nextPosition.toString()}`)
                    .setLabel(`✅ Approved [${nextPosition.toString()} / ${limit.toString()}]`)
                    .setStyle('Success')
            );

        if (nextPosition >= limit) {
            row = row
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('approve_button_delete')
                        .setLabel('💥 Delete Message')
                        .setStyle('Danger')
                );
        }

        await interaction.update({
            components: [row],
        });
    }

    if (interaction.customId === 'approve_button_delete') {
        await interaction.deferUpdate();
        await interaction.deleteReply();
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('error', console.error);

client.login(TOKEN);