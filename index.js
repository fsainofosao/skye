// Imports | Requires | Consts \\
const Discord = require('discord.js');
//const client = new Discord.Client({ intents: ['DIRECT_MESSAGES', '', 'GUILD_BANS', '', '', 'GUILD_WEBHOOKS'], partials: ['CHANNEL', 'MESSAGE'] });
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const { ButtonBuilder, ButtonStyle, SlashCommandBuilder,  Events } = require('discord.js');
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: ['CHANNEL', 'MESSAGE']
});
const Config = require('./config.json');
const Keys = require('./keys.json');
const { MessageEmbed } = require('discord.js');
const { Client } = require('twitchrequest');
const { YouTube } = require("@livecord/notify");
const { MessageActionRow, MessageButton, StringSelectMenuBuilder } = require('discord.js');
const { Modal, TextInputComponent, SelectMenuComponent } = require('discord-modals');
const FiveM = require("fivem") // Import the npm package.
const srv = new FiveM.Server(`${Config.ip}:${Config.port}`) // Set the IP with port.
var fivereborn = require("fivereborn-query")
const discordModals = require('discord-modals')
const exec = require('child_process').exec;
discordModals(client);

// Variables \\
const logo = 'https://media.discordapp.net/attachments/1049043663583461397/1141514682105069760/SkyEmpty.png'
const StaffRole = Config.dev_role || Config.stjerne_role
const options = {
    channels: ["zunt1e_"],
    client_id: Keys.twitch_clientid,
    client_secret: Keys.twitch_clientsecret,
    interval: 3
};

// SoMe \\
const twitchclient = new Client(options);
const youtube = new YouTube({
    interval: 1000,
    useDatabase: true
});


// Auto Status \\
function autoStatus() {
    const server = client.guilds.cache.get(Config.guild)
    log('Starter Rich Presence.')
    setInterval(() => {
        fivereborn.query(Config.ip, Config.port, (err, data) => {
            if (err) {
                log(`Fejl opstod under opdatering af rich presence.\n**Fivereborn-query NPM Module Error**`, 'error')
                client.user.setActivity(`Server Connection Error ⚠️`, { type: 'WATCHING'})
            } else {
                client.user.setActivity(`${data.clients}/${data.maxclients} i byen 🏙️`, { type: 'WATCHING' })
            }
        })
        setTimeout(() => {
            let memberCount = client.guilds.cache.get(Config.guild).memberCount
            client.user.setActivity(`${memberCount} discord brugere 👤`, { type: 'WATCHING' })
            setTimeout(() => {
                const channel = server.channels.cache.filter((channel) => channel.id === Config.whitelist_category);
                const ansøgere = channel.reduce((acc, channel) => channel.children.size, 0)
                client.user.setActivity(`${ansøgere} whitelist ansøgere 📬`, { type: 'WATCHING' });
                setTimeout(() => {
                    const channel2 = server.channels.cache.filter((channel) => channel.id === Config.ticket_category);
                    const tickets = channel2.reduce((acc, channel) => channel.children.size, 0)
                    client.user.setActivity(`${tickets}  åbne tickets ✉️`, { type: 'WATCHING' });
                }, 3000)
            }, 3000)

        }, 3000)
    }, 12000)
}

// Logs \\
function log(message, type) {
    const channel = client.channels.cache.get(Config.log_channel);
    const embed = new EmbedBuilder()
        .setTitle('Sky Evolved- Logs')
        .setDescription(message)
        .setTimestamp()
        .setFooter({text: 'Sky Evolved- Logs', iconURL: logo})

    if (!type) {
        embed.setColor('#0099ff')
    } else if (type === 'error') {
        embed.setColor('#ff0000')
    }

    channel.send({
        embeds: [embed]
    })

}

// Kontrolpanel Status Module \\
async function kontrolpanel_status() {
    const channel = client.channels.cache.get(Config.kontrolpanel_channel);
    const defaultEmbed = new EmbedBuilder()
        .setTitle('Status')
        .setDescription('**LOADING...** :gear:')
        .setTimestamp()
        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
        .setColor('#0099ff')
    const message = await channel.send({
        embeds: [defaultEmbed]
    })
    setInterval(() => {
        try {
            srv.getServerStatus().then(data => {
                if (data.online == true) {
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('Status')
                        .setDescription('**Status**: Online 🟢')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin 🟢', iconURL: logo})
                        .setColor('#0099ff')
                    message.edit({
                        embeds: [statusEmbed]
                    })
                } else if (data.online == false) {
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('Status')
                        .setDescription('**Status**: Offline 🔴')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin 🔴', iconURL: logo})
                        .setColor('#0099ff')
                    message.edit({
                        embeds: [statusEmbed]
                    })
                } else {
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('Status')
                        .setDescription('**Status**: Kan ikke kontakte serveren ⚠️')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin ⚠️', iconURL: logo})
                        .setColor('#0099ff')
                    message.edit({
                        embeds: [statusEmbed]
                    })
                }
            })
        } catch (err) {
            const statusEmbed = new EmbedBuilder()
                .setTitle('Status')
                .setDescription('**Status**: Kan ikke kontakte serveren ⚠️')
                .setTimestamp()
                .setFooter({text: 'Sky_panel by Odin ⚠️', iconURL: logo})
                .setColor('#0099ff')
            message.edit({
                embeds: [statusEmbed]
            })
            log('Fejl opstod under forbindelse til FiveM serveren', 'error')
        }
    }, 3000)


}
// Kontrolpanel Spillerliste Module \\
async function kontrolpanel_spillerliste() {
    const channel = client.channels.cache.get(Config.kontrolpanel_channel);
    const defaultEmbed = new EmbedBuilder()
        .setTitle('Spillerliste')
        .setDescription('**LOADING...** :gear:')
        .setTimestamp()
        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
        .setColor('#0099ff')

    const message = await channel.send({
        embeds: [defaultEmbed]
    })

    try {
        setInterval(() => {
            srv.getServerStatus().then(data => {
                if (data.online == true) {
                    srv.getPlayersAll().then(data => {
                        const embed = new EmbedBuilder()
                            .setTitle('Spillerliste')
                            .setDescription('[**ID**] Spillernavn - **Ping**(ms)')
                            .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                            .setColor('#0099ff')
                            .setTimestamp()

                        const row =  new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("advanced")
                                    .setEmoji("🔎")
                                    .setStyle("Primary")
                                    .setLabel("Advanced"),
                            )

                        //              if (data.length == 0) {
                        //            embed.addField('** **', 'Ingen spillere online ❌', true)
                        //        } else {
                        //            embed.addField('** **', '> ' + data.map(player => `[**${player.id}**] ${player.name} - **${player.ping}**ms`).join('\n'), true)
                        //     }
                        message.edit({
                            embeds: [embed],
                            components: [row]
                        })

                        const filter = ( button ) => button.clicker;
                        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

                        collector.on('collect', async (button) => {
                            if (button.customId == "advanced") {
                                const advancedEmbed = new EmbedBuilder()
                                    .setTitle('Spillerliste')
                                    .setDescription('[**ID**] Spillernavn - **Ping**(ms)')
                                    .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                                    .setColor('#0099ff')
                                    .setTimestamp()

                                const row =  new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId("advanced")
                                            .setEmoji("🔎")
                                            .setStyle("Primary")
                                            .setLabel("Advanced"),
                                    )

                                if (data.length == 0) {
                                    advancedEmbed.addField('** **', 'Ingen spillere online ❌', true)
                                } else {
                                    advancedEmbed.addField('** **', '> ' + data.map(player => `[**${player.id}**] ${player.name} - **${player.ping}**ms\n> *${player.identifiers[0]}*\n> *${player.identifiers[3]}*\n> *${player.identifiers[4]}*`).join('\n'), true)
                                }
                                message.edit({
                                    embeds: [advancedEmbed],
                                    components: [row]
                                })
                                log(`${button.user} brugte advanced mode på spillerlisten under kontrolpanelet.`)
                            }
                        })

                    })
                } else if (data.online == false) {
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('Spillerliste')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                        .setColor('#0099ff')
                    //.addField('** **', 'Ingen spillere online ❌')
                    message.edit({
                        embeds: [statusEmbed]
                    })
                } else {
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('Spillerliste')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                        .setColor('#0099ff')
                    //.addField('** **', 'Kan ikke kontakte serveren ⚠️.')
                    message.edit({
                        embeds: [statusEmbed]
                    })
                }
            })
        }, 3000)
    } catch (err) {
        const statusEmbed = new EmbedBuilder()
            .setTitle('Spillerliste')
            .setTimestamp()
            .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
            .setColor('#0099ff')
        //.addField('** **', 'Kan ikke kontakte serveren ⚠️.')
        message.edit({
            embeds: [statusEmbed]
        })
        log('Fejl opstod under forbindelse til FiveM serveren', 'error')
    }
}
// Kontrolpanel Ping Module \\
async function kontrolpanel_ping() {
    const channel = client.channels.cache.get(Config.kontrolpanel_channel);
    const defaultEmbed = new EmbedBuilder()
        .setTitle('Ping')
        .setDescription('**LOADING...** :gear:')
        .setTimestamp()
        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
        .setColor('#0099ff')
    const message = await channel.send({
        embeds: [defaultEmbed]
    })
    setInterval(() => {
        const pingEmbed = new EmbedBuilder()
            .setTitle('Ping')
            .setDescription(`**Bottens Ping**: ${client.ws.ping}ms`)
            .setTimestamp()
            .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
            .setColor('#0099ff')

        message.edit({
            embeds: [pingEmbed]
        })
    }, 3000)
}
// Kontrolpanel \\
async function kontrolPanel() {
    log('Loaded Kontrolpanel.')
    const channel = client.channels.cache.get(Config.kontrolpanel_channel);

    const embed = new EmbedBuilder()
        .setTitle('Sky Evolved- Kontrolpanel')
        .setDescription('Dette er Sky Evolveds kontrolpanel, til FiveM serveren.\nHer kan ud administrere ingame serveren, og udføre administrative formål.')
        .setTimestamp()
        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
        .setColor('#0099ff')

    const row =  new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("startServer")
                .setEmoji("✔️")
                .setStyle("Success")
                .setLabel("Start"),
            new ButtonBuilder()
                .setCustomId("genstartServer")
                .setEmoji("🔄")
                .setStyle("Primary")
                .setLabel("Genstart"),
            new ButtonBuilder()
                .setCustomId("stopServer")
                .setEmoji("✖️")
                .setStyle("Danger")
                .setLabel("Stop"),
            new ButtonBuilder()
                .setCustomId("forcekillServer")
                .setEmoji("⚠️")
                .setStyle("Danger")
                .setLabel("Forcekill"),
        )

    try {
        channel.messages.fetch().then(messages => {
            messages.forEach(message => {
                message.delete()
            })
        })
    } catch (err) {
        log(`Fejl opstod under sletning af beskeder vedr. kontrolpanelet\n\n**${err.name}**: ${err.message}`, 'error')
    }

    const message = await channel.send({
        embeds: [embed],
        components: [row]
    })

    const filter = ( button ) => button.clicker;
    const collector = message.createMessageComponentCollector(filter, { time: 120000 });

    collector.on('collect', async (button) => {
        if (button.customId == 'startServer') {
            srv.getServerStatus().then(data => {
                if (data.online == true) {
                    log(`${button.user} prøvede at starte FiveM serveren, men den er allerede online.`)
                    const embed = new EmbedBuilder()
                        .setTitle('Sky Evolved- Kontrolpanel')
                        .setDescription('FiveM serveren er allerede online.')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                        .setColor('#0099ff')
                    try {
                        button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    } catch (err) {
                        log(`Fejl opstod under besked sendt til ${button.user}\n\n**${err.name}**: ${err.message}`, 'error')
                    }
                } else if (data.online == false) {
                    const curPath = __dirname;
                    const embed = new EmbedBuilder()
                        .setTitle('Sky Evolved- Kontrolpanel')
                        .setDescription('FiveM serveren vil nu starte op.\nTjek på statusen på serveren, for at se, hvornår den er online.')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                        .setColor('#0099ff')


                    log(`${button.user} starter FiveM serveren, fra kontrolpanelet.`)
                    exec(`start ${curPath}\\${Config.kontrolpanel_startcmd}`)
                    log(`Åbner cmd/starter.py`)
                    log(`Åbner start_5562_default.bat`)
                    log(`Starter server`)

                    button.reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                }
            })

        } else if (button.customId == "stopServer") {
            srv.getServerStatus().then(data => {
                if (data.online == true) {
                    const curPath = __dirname;
                    const embed = new EmbedBuilder()
                        .setTitle('Sky Evolved- Kontrolpanel')
                        .setDescription('FiveM serveren vil nu stoppe.\nTjek på statusen på serveren, for at se, hvornår den er offline.')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                        .setColor('#0099ff')

                    log(`${button.user} stopper FiveM serveren, fra kontrolpanelet.`)
                    exec(`start ${curPath}\\${Config.kontrolpanel_stopcmd}`)
                    log('**Process Killed:** ' + Config.kontrolpanel_title + ' **-** ' + Config.kontrolpanel_fxserver)
                    log('**Setting Process Title:** ' + Config.kontrolpanel_killingtitle)
                    setTimeout(() => {
                        log('**Process Killed:** ' + Config.kontrolpanel_killingtitle)
                    }, 1000)

                    button.reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                } else if (data.online == false) {
                    const embed = new EmbedBuilder()
                        .setTitle('Sky Evolved- Kontrolpanel')
                        .setDescription('FiveM serveren er allerede offline.')
                        .setTimestamp()
                        .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                        .setColor('#0099ff')

                    button.reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                    log(`${button.user} prøvede at stoppe FiveM serveren, men den er allerede offline`)
                }
            })
        } else if (button.customId == "genstartServer") {
            const embed = new EmbedBuilder()
                .setTitle('Sky Evolved- Kontrolpanel')
                .setDescription('FiveM serveren vil nu genstarte.\nTjek på statusen på serveren, for at se, hvornår den er online.')
                .setTimestamp()
                .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                .setColor('#0099ff')

            log(`${button.user} genstarter FiveM serveren, fra kontrolpanelet.`)
            button.reply({
                embeds: [embed],
                ephemeral: true
            })

            try {
                srv.getServerStatus().then(data => {
                    if (data.online == true) {
                        button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                        exec(`start ${curPath}\\${Config.kontrolpanel_stopcmd}`)
                        log('**Process Killed:** ' + Config.kontrolpanel_title + ' **-** ' + Config.kontrolpanel_fxserver)
                        log('**Setting Process Title:** ' + Config.kontrolpanel_killingtitle)
                        setTimeout(() => {
                            log('**Process Killed:** ' + Config.kontrolpanel_killingtitle)
                        }, 1000)

                        setTimeout(() => {
                            exec(`start ${curPath}\\${Config.kontrolpanel_startcmd}`)
                            log(`Åbner cmd/starter.py`)
                            log(`Åbner start_5562_default.bat`)
                            log(`Starter server`)
                        }, 1000)
                    } else if (data.online == false) {
                        exec(`start ${curPath}\\${Config.kontrolpanel_startcmd}`)
                        log(`Åbner cmd/starter.py`)
                        log(`Åbner start_5562_default.bat`)
                        log(`Starter server`)
                        button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                })
            } catch (err) {
                log(`Fejl opstod under genstartning af FiveM serveren`, 'error')
            }
        } else if (button.customId == "forcekillServer") {
            const curPath = __dirname;
            const embed = new EmbedBuilder()
                .setTitle('Sky Evolved- Kontrolpanel')
                .setDescription('FiveM serveren vil nu blive forcekilled.\nTjek på statusen på serveren, for at se, hvornår den er offline.')
                .setTimestamp()
                .setFooter({text: 'Sky_panel by Odin', iconURL: logo})
                .setColor('#0099ff')

            log(`${button.user} forcekilled FiveM serveren, fra kontrolpanelet.`)
            button.reply({
                embeds: [embed],
                ephemeral: true
            })

            exec(`start ${curPath}\\${Config.kontrolpanel_stopcmd}`)
            log('**Process Killed:** ' + Config.kontrolpanel_title + ' **-** ' + Config.kontrolpanel_fxserver)
            log('**Setting Process Title:** ' + Config.kontrolpanel_killingtitle)
            setTimeout(() => {
                log('**Process Killed:** ' + Config.kontrolpanel_killingtitle)
            }, 1000)
        }
    })
    kontrolpanel_ping()
    log(`Kontrolpanelets Ping Modul blev startet.`)
    kontrolpanel_status()
    log(`Kontrolpanelets Status Modul blev startet.`)
    kontrolpanel_spillerliste()
    log(`Kontrolpanelets Spillerliste Modul blev startet.`)





// the `data` event is fired every time data is
// output from the command
    /*var count = 1
    command.stdout.on('data', output => {
        // the output data is captured and printed in the callback
        var output = output.toString()
        // remove [38;5;218m and
        output = output.replace(/\u001b\[38;5;218m/g, '')
        // remove  [0m[32m
        output = output.replace(/\u001b\[0m\u001b\[32m/g, '')
        // remove [38;5;161m
        output = output.replace(/\u001b\[38;5;161m/g, '')
        // remove [0m
        output = output.replace(/\u001b\[0m/g, '')
        // remove  [93m
        output = output.replace(/\u001b\[93m/g, '')
        // remove [32m
        output = output.replace(/\u001b\[32m/g, '')
        // remove ]0;
        output = output.replace(/\u001b\]0;/g, '')
        // everything between [ ] should be capitalized
        output = output.replace(/\[(.*?)\]/g, function(match, p1) {
            return `[**${p1}**]`
        })
    
        // remove the first line
        if (count === 1 || count === 2 || count === 3 || count === 4) {
            count++
            return
        }
    
    
    
        console.log(output)
    
    })*/

}

// Start Systems \\
async function startWhitelist() {
    log(`**[startSystems Function]** Whitelist Modul blev startet.`)
    const channel = client.channels.cache.get(Config.whitelist_channel);
    const whitelistEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('__Atlantic City 2.0 Whitelist__')
        .setDescription(
            '**Her kan du ansøge om whitelist.**\n' +
            'Først skal du ansøge om whitelist, det gør du ved at skrive **/ansøg**.\n'+
            'Er din ansøgning godkendt, skal du til en whitelist samtale, når der er åbent.'
        )
        .setFooter({ text: 'Atlantic City 2.0 - Whitelist', iconURL: logo })

    const modal = new Modal()
        .setCustomId("whitelist_ansøgning")
        .setTitle("Whitelist Ansøgning")
        .addComponents(
            new TextInputComponent()
                .setCustomId("whitelist_karakter")
                .setLabel("Information om karakter [Navn, Baggrund, etc]")
                .setPlaceholder("Indtast dit svar.")
                .setRequired(true)
                .setStyle("LONG"),

            new TextInputComponent()
                .setCustomId("whitelist_hvorfor")
                .setLabel("Hvorfor vil du gerne spille på Atlantic City?")
                .setPlaceholder("Indtast dit svar.")
                .setRequired(true)
                .setStyle("LONG"),

            new TextInputComponent()
                .setCustomId("whitelist_lave")
                .setLabel("Hvad regner du med at lave på Atlantic City?")
                .setPlaceholder("Indtast dit svar.")
                .setRequired(true)
                .setStyle("LONG"),

            new TextInputComponent()
                .setCustomId("whitelist_steam")
                .setLabel("Hvad er det Link til din steam profil?")
                .setPlaceholder("Indtast dit svar.")
                .setRequired(true)
                .setStyle("SHORT")
        );

    try {
        channel.messages
            .fetch({ limit: 100 })
            .then((messages) => {
                messages.forEach((message2) => {
                    setTimeout(() => {
                        if (message2.author.id == client.user.id) {
                            message2.delete();
                        } else {
                        }
                    }, 100);
                });
            })
            .catch(console.error);
    } catch (error) {
        log(
            `Fejl ved sletning af besked.\n\n**${error.name}**: ${error.message}`,
            "error"
        );
    }
    await channel.send({
        embeds: [whitelistEmbed],
    });

    // for every message that gets sent in the channel
    setInterval(() => {
        channel.messages.cache.forEach(async (message) => {
            try {
                if (message.author.id == client.user.id) {
                    return;
                } else {
                    await message.delete();
                    log(
                        `Slettede besked i <#${Config.ansøgning_channel}>\nSendt af <@${message.author.id}>\nIndhold: \n${message.content}`
                    );
                }
            } catch (error) {
                log(
                    `Fejl ved sletning af besked.\n\n**${error.name}**: ${error.message}`,
                    "error"
                );
            }
        });
    }, 1000);
}
async function startPing() {
    log(`**[startSystems Function]** Ping Modul blev startet.`)
    const channel = client.channels.cache.get(Config.pingrolle_channel);

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('__Sky EvolvedPing__')
        .setDescription(`Kunne du godt tænke dig at blive pinget, når der kommer nogle nyheder?\nSå tryk på knappen nedenfor, for at modtage <@&${Config.ping_role}> rollen.\nVil du ikke have den længere, kan du bare trykke på knappen igen.`)
        .setFooter({ text: 'Sky Evolved- Ping', iconURL: logo })

    const row =  new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("modtag")
                .setEmoji("📝")
                .setStyle("Success")
                .setLabel("Modtag"),
        )
    try {
        channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message2 => {
                setTimeout(() => {
                    if (message2.author.id == client.user.id) {
                        message2.delete()
                    } else {
                    }
                }, 100)
            });
        }).catch(console.error);
    } catch (err) {
        log(`Fejl ved sletning af besked.\n\n**${err.name}**: ${err.message}`, 'error');
    }

    const message = await channel.send({
        embeds: [embed],
        components: [row]
    })

    const filter = ( button ) => button.clicker;
    const collector = message.createMessageComponentCollector(filter, { time: 120000 });

    collector.on('collect', async (button) => {
        if (button.customId == "modtag") {
            const replyEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedPing__')
                .setDescription(`Du modtog <@&${Config.ping_role}> rollen.`)
                .setFooter({ text: 'Sky Evolved- Ping', iconURL: logo })
            const replyEmbed2 = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedPing__')
                .setDescription(`Du fik fjernet <@&${Config.ping_role}> rollen.`)
                .setFooter({ text: 'Sky Evolved- Ping', iconURL: logo })
            const targetUser = button.user;
            var guild = client.guilds.cache.get(Config.guild)
            const member = await guild.members.fetch(targetUser.id)
            const role = await guild.roles.fetch(Config.ping_role)
            // check if user has role
            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id)
                await button.reply({
                    embeds: [replyEmbed2],
                    ephemeral: true
                })
            } else {
                member.roles.add(role.id)
                await button.reply({
                    embeds: [replyEmbed],
                    ephemeral: true
                })
            }
        }
    })
}

async function startFAQ() {
    log(`**[startSystems Function]** FAQ Modul blev startet.`)
    const channel = client.channels.cache.get(Config.faq_channel);
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('__Sky EvolvedFAQ__')
        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
        .setDescription(
            'Nedenfor kan du vælge, hvad du vil have svar på.\n\n' +
            '1️⃣ **Hvad framework bruger i?**\n\n' +
            '2️⃣ **Hvordan ansøger jeg?**\n\n' +
            '3️⃣ **Hvad er aldersgrænsen?**\n\n' +
            '4️⃣ **Information om Sky Evolved?**\n\n' +
            '5️⃣ **Hvornår svarer i på ansøgninger?**\n\n' +
            '6️⃣ **Er det realistisk roleplay?**\n\n' +
            '7️⃣ **Hvor mange karaktere har man?**\n\n' +
            '8️⃣ **Hvor mange slots har i?**\n\n'
        )

    const row =  new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("1")
                .setEmoji("1️⃣")
                .setStyle("Secondary"),
            new ButtonBuilder()
                .setCustomId("2")
                .setEmoji("2️⃣")
                .setStyle("Secondary"),
            new ButtonBuilder()
                .setCustomId("3")
                .setEmoji("3️⃣")
                .setStyle("Secondary"),
            new ButtonBuilder()
                .setCustomId("4")
                .setEmoji("4️⃣")
                .setStyle("Secondary"),
        )

    const row2 =  new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("5")
                .setEmoji("5️⃣")
                .setStyle("Secondary"),
            new ButtonBuilder()
                .setCustomId("6")
                .setEmoji("6️⃣")
                .setStyle("Secondary"),
            new ButtonBuilder()
                .setCustomId("7")
                .setEmoji("7️⃣")
                .setStyle("Secondary"),
            new ButtonBuilder()
                .setCustomId("8")
                .setEmoji("8️⃣")
                .setStyle("Secondary"),

        )

    try {
        channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message2 => {
                setTimeout(() => {
                    if (message2.author.id == client.user.id) {
                        message2.delete()
                    } else {
                    }
                }, 100)
            });
        }).catch(console.error);
    } catch (err) {
        log(`Fejl ved sletning af besked.\n\n**${err.name}**: ${err.message}`, 'error');
    }
    channel.send({
        embeds: [embed],
        components: [row, row2]
    })

    const filter = ( button ) => button.clicker;
    const collector = channel.createMessageComponentCollector(filter, { time: 120000 });
    collector.on('collect', async (button) => {
        if (button.customId == '1') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription(`Sky Evolved benytter sig af ESX Legacy (**v1.7.5**) frameworked.`)
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } catch (error) {
                return
            }
        } else if (button.customId == '2') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription(`Du kan ansøge om de forskellige jobs, og om at blive en del af teamet, inde i <#${Config.ansøgning_channel}> `)
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } catch (error) {
                return
            }
        } else if (button.customId == '3') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription(`Der er ingen aldersgrænse på whitelist ansøgningerne, her handler det om ens timer og erfaring i FiveM.\nMen på visse whitelisted jobs og ansøgninger, kan en aldersgrænse forekomme.`)
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            }
            catch (error) {
                return
            }
        } else if (button.customId == '4') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription(
                    '**Baggrunds Historie**\n' +
                    '> Sky Evolved var en vRP server, der kørte tilbage i 2019.\n' +
                    '> Grundlaget for serverens lukning, var at ledelsen blev nød til at forlade, grundet økonomiske årsager.\n' +
                    '> Dengang lå Sky Evolved på gennemsnitligt 60 spiller dagligt, efter at have været oppe i 2 uger.\n\n' +
                    '**Moto & Info**\n' +
                    '> Dengang blev Sky Evolved kendt for deres udvikling, det var unikt og der var mange ting man ikke havde set før. ' +
                    'Det førte også til et forhøjet RP niveau.\n' +
                    '> Der var også god support, og et godt community. Det gjorde de ved at der ikke var nogen aldersgrænse, men at de kiggede på timerne, og erfaring.\n' +
                    '> Der var dog en aldersgrænse på visse jobs, og ting i teamet.\n\n' +
                    '**Formål med at åbne op igen.**\n' +
                    '> 2.0 har været i <@' + Config.odin_id + '> baghovedet længe. Han har længe gået og tænkt på at starte Sky Evolved op igen.\n' +
                    '> Han mener at det danske FiveM mangler nye servere, som ikke efterligner andre, og er unikke.\n' +
                    '> Han har dog taget sagen i sin egen hånd, og har fået penge til at betale det hele.\n\n' +
                    '**Fremtid for Sky Evolved**\n' +
                    '> Vi håber på at blive ved med at være på udviklingen, og bygge et af de bedste RP communities i Danmark.\n' +
                    '> Så vi en dag kan kaldes os nogle af de bedste i dag.'
                )
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            }
            catch (error) {
                return
            }
        } else if (button.customId == '5') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription('Det er forskelligt fra område til område, da der er forskellige ansvarlige.')
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            }
            catch (error) {
                return
            }
        } else if (button.customId == '6') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription('På Sky Evolved kører vi med realistisk roleplay.')
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } catch (error) {
                return
            }
        } else if (button.customId == '7') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription('Vi har valgt, at man skal have 2 karaktere.')
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } catch (error) {
                return
            }
        } else if (button.customId == '8') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setDescription('Vi har valgt at køre med 64 slots.')
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
            try {
                await button.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            } catch (error) {
                return
            }
        }
    })
}
async function startTickets() {
    log(`**[startSystems Function]** Tickets Modul blev startet.`)
    const channel = client.channels.cache.get(Config.ticket_channel);
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('__Atlantic City 2.0 Tickets__')
        .setDescription(
            '*Du kan vælge tickettens type nedenfor.*' +
            '\n\n' +
            '**✉️ Generel Ticket**\n' +
            '> Hvis du har brug for hjælp, eller hvis du har et spørgsmål.\n\n' +
            '**⚙️ Dev Ticket**\n' +
            '> Hvis du har brug for en developers hjælp, eller du har fundet en fejl.\n\n' +
            '**👤 Ledelse Ticket**\n' +
            '> Hvis du har brug for at kontakte en fra ledelsen.'
        )
        .setFooter({ text: 'Atlantic City 2.0 - Tickets', iconURL: logo })
    const row =  new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_type')
                .setPlaceholder('Vælg Ticket Type')
                .addOptions([
                    {
                        label: '✉️ Generel Ticket',
                        description: 'Tryk for at oprette en generel ticket.',
                        value: 'generelticket'
                    },
                    {
                        label: '⚙️ Dev Ticket',
                        description: 'Tryk for at oprette en dev ticket.',
                        value: 'devticket'
                    },
                    {
                        label: '👤 Ledelse Ticket',
                        description: 'Tryk for at oprette en ledelse ticket.',
                        value: 'ledelseticket'
                    },
                ])
        )

    try {
        channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message2 => {
                setTimeout(() => {
                    if (message2.author.id == client.user.id) {
                        message2.delete()
                    } else {
                    }
                }, 100)
            });
        }).catch(console.error);
    } catch (err) {
        log(`Fejl ved sletning af besked.\n\n**${err.name}**: ${err.message}`, 'error');
    }
    channel.send({
        embeds: [embed],
        components: [row],
    })
}
async function startRegler() {
    const channel = client.channels.cache.get(Config.regler_channel);
    const embed = new EmbedBuilder()
        .setTitle('__Sky Evolved- Regler__')
        .setDescription('*For at læse Sky Evolveds regler, skal du bruge knapperne nedenfor.*\n*Obs. Alle regler skal læses, men du kan selv vælge rækkefølgen.*\n\n' +
            '**Generelt**\nGenerelle regler, der vedrører discorden.' +
            '\n\n**Roleplay**\nRoleplay regler der vedrører, hvordan ens roleplay skal foregå.' +
            '\n\n**Multikaraktere**\nRegler de vedrører ens karaktere.' +
            '\n\n**OOC / Karakterbrud**\nRegler der vedrører OOC, og brud af karakter.' +
            '\n\n**Kørsel**\nRegler der vedrører ens kørsel.' +
            '\n\n**Arbejde**\nRegler der vedrører ens arbejde og, hvordan det skal fremføres.' +
            '\n\n**Opkald & Kommunikation**\nRegler der vedrører opkald til alarmcentralen, og hvordan der skal kommunikeres.' +
            '\n\n**Bugs, Snyd, Hacking & Exploiting**\nRegler der vedrører snyd, og andet i den form.' +
            '\n\n**Gruppinger & Bander**\nRegler om gruppinger og bander der vedrører, hvordan det skal foregå.' +
            '\n\n**Bandekrig**\nRegler for, hvordan en bandekrig skal foregå.' +
            '\n\n**Røverier**\nRegler om, hvordan røverier af diverse ting skal foregå.' +
            '\n\n**Karakterdrab (CK)**\nRegler der vedrører et karakterdrab og, hvordan det skal udføres.' +
            '\n\n**Handlinger**\nRegler der vedrører hans handlinger i på FiveM serveren.' +
            '\n\n**Køb & Salg (Real Money Trading)**\nRegler der involverer køb og salg af ingame ting, for rigtige penge.')
        .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
        .setColor('#0099ff')





    /*

    GENERELLE REGLER / OUTGAME REGLER
    ROLEPLAY REGLER
    FLERE KARAKTERERFLERE KARAKTERER
    Out Of Character (OOC) / Karakterbrud
    KØRSEL
    ARBEJDE
    OPKALD OG KOMMUNIKATION
    BUGS, SNYD, HACKING, EXPLOITING
    GRUPPERINGER / BANDER
    BANDEKRIG
    RØVERIER
    KARAKTERDRAB (CK)
    HANDLINGER
    KØB & SALG (REAL MONEY TRADING)

    */

    try {
        channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message2 => {
                setTimeout(() => {
                    if (message2.author.id == client.user.id) {
                        message2.delete()
                    } else {
                    }
                }, 100)
            });
        }).catch(console.error);
    } catch (err) {
        log(`Fejl ved sletning af besked.\n\n**${err.name}**: ${err.message}`, 'error');
    }

    channel.send({
        embeds: [embed]
    })
}
async function startSystems() {
    startWhitelist()
    //startAnsøgninger()
    //startPing()
    //startServerDrift()
   // startFAQ()
    //startTickets()
    startRegler()
}

// User Join \\
client.on('guildMemberAdd', member => {
    log(`<@${member.user.id}> tilsluttede sig serveren.`)
})
// User Leave \\
client.on('guildMemberRemove', member => {
    log(`<@${member.user.id}> forlod serveren.`)
})
// User Ban \\
client.on('guildBanAdd', (user) => {
    log(`<@${user.user.id}> blev bannet fra serveren.`)
})
// User Unban \\
client.on('guildBanRemove', (user) => {
    log(`<@${user.user.id}> blev unbannet fra serveren.`)
})

// Twitch Live \\
twitchclient.on('live', (streamData) => {
    const channel = client.channels.cache.get(Config.twitch_channel);
    const logChannel = client.channels.cache.get(Config.log_channel);
    const embed = new EmbedBuilder()
        .setAuthor('Sky Evolved- Twitch', streamData.profile)
        .setTitle(streamData.title)
        .setImage(streamData.thumbnail)
        .setDescription(`@**${streamData.name}** er nu live igen og spiller **${streamData.game}**!`)
        .setURL(`https://twitch.tv/${streamData.raw.user_login}`)
        .setTimestamp()
        .setFooter({text: 'Sky Evolved- Twitch'})
        .setColor('#9146ff')

    const row =  new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setEmoji('📺')
                .setStyle("Link")
                .setURL(`https://twitch.tv/${streamData.raw.user_login}`)
                .setLabel('Se nu')

        )
    channel.send({
        embeds: [embed],
        components: [row]
    })
    logChannel.send({
        embeds: [embed]
    })
});
// Twitch Going Offline \\
twitchclient.on('unlive', (streamData) => {
    const logChannel = client.channels.cache.get(Config.log_channel);
    const embed = new EmbedBuilder()
        .setAuthor('Sky Evolved- Twitch', streamData.profile)
        .setTitle(streamData.title)
        .setImage(streamData.thumbnail)
        .setDescription(`@**${streamData.name}** er ikke længere live.`)
        .setTimestamp()
        .setFooter({text: 'Sky Evolved- Twitch'})
        .setColor('#9146ff')

    logChannel.send({
        embeds: [embed]
    })
});
// Youtube New Upload \\
youtube.on("upload", video => {
    console.log(video)
    const channel = client.channels.cache.get(Config.youtube_channel);
    const logChannel = client.channels.cache.get(Config.log_channel);
    const Link = video.Link
    const thumbnail = Link.split('=')[1]

    const embed = new EmbedBuilder()
        .setAuthor('Sky Evolved- Youtube', logo)
        .setTitle(video.title)
        .setURL(video.Link)
        .setImage(`https://img.youtube.com/vi/${thumbnail}/hqdefault.jpg`)
        .setDescription(`@**${video.author}** har lige uploadet en ny video.`)
        .setTimestamp()
        .setFooter({text: 'Sky Evolved- Youtube'})
        .setColor('#ff0000')

    const row =  new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setEmoji('📺')
                .setStyle("Link")
                .setURL(Link)
                .setLabel('Se nu')
        )
    channel.send({
        embeds: [embed],
        components: [row]
    })
    logChannel.send({
        embeds: [embed]
    })

})


// Commands \\
client.on('interactionCreate', async (interaction) => {
    const { commandName, options } = interaction;
    if (!interaction.isCommand()) return;

    if (commandName == 'ping') {
        log('<@' + interaction.user.id + '> brugte kommandoen **/ping**.')
        interaction.reply('Pong!')
    }

    if (commandName == 'ansøgcreate') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/ansøgcreate**.')
            const channel = client.channels.cache.get(Config.ansøgning_channel);
            const ansøgningsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedAnsøgninger__')
                .setDescription('*Du kan ansøge nedenfor.*\n\n**Politi 👮**\nVær en del af politistyrken, og stop kriminelitet.\n\n**EMS 🚑**\nVær en del af EMS, for at medicinere og genoplive folk.\n\n**Advokat 💼**\nVær en advokat, og deltag i retsager.\n\n**Firma 👷**\nOpret og administrer dit eget firma.\n\n**Staff 👤**\n Vær en del af staff teamet, og hjælp til med at moderere på serveren.\n\n**Beta Tester ⚙️**\nHjælp med at finde fejl, og teste ting på vores dev server.\n\n**Whitelist Modtager 📝**\nVær en whitelist modtager, for at svare på whitelist ansøgninger samt samtalerne.')
                .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

            const row =  new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ansøgning_type')
                        .setPlaceholder('Vælg Ansøgning')
                        .addOptions([
                            {
                                label: 'Politi 👮',
                                description: 'Tryk for at oprette en politi ansøgning.',
                                value: 'politi'
                            },
                            {
                                label: 'EMS 🚑',
                                description: 'Tryk for at oprette en EMS ansøgning.',
                                value: 'ems'
                            },
                            {
                                label: 'Advokat 💼',
                                description: 'Tryk for at oprette en advokat ansøgning.',
                                value: 'advokat'
                            },
                            {
                                label: 'Firma 👷',
                                description: 'Tryk for at oprette en firma ansøgning.',
                                value: 'firma'
                            },
                            {
                                label: 'Staff 👤',
                                description: 'Tryk for at oprette en staff ansøgning.',
                                value: 'staff'
                            },
                            {
                                label: 'Beta Tester ⚙️',
                                description: 'Tryk for at oprette en beta tester ansøgning.',
                                value: 'betatester'
                            },
                            {
                                label: 'Whitelist Modtager 📝',
                                description: 'Tryk for at oprette en whitelist modtager ansøgning.',
                                value: 'whitelistmodtager'
                            }
                        ])
                )

            // Reply to user
            channel.send({
                embeds: [ansøgningsEmbed],
                components: [row]
            })
            interaction.reply({
                content: 'Opretter ansøgningerne...',
                ephemeral: true
            })
            log('<@' + interaction.user.id + '> oprettede ansøgningerne.')
        }

    }

    if (commandName == 'whitelistcreate') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/whitelistcreate**.')
            const channel = client.channels.cache.get(Config.whitelist_channel);
            const whitelistEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedWhitelist__')
                .setDescription(
                    '**Her kan du ansøge om whitelist.**\n' +
                    'Først skal du ansøge om whitelist, det gør du ved at skrive **/ansøg**.\n'+
                    'Er din ansøgning godkendt, skal du til en whitelist samtale, når der er åbent.'
                )
                .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

            const modal =  new Modal()
                .setCustomId('whitelist_ansøgning')
                .setTitle('Whitelist Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('whitelist_karakter')
                        .setLabel('Information om karakter [Navn, Baggrund, etc]')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('LONG'),

                    new TextInputComponent()
                        .setCustomId('whitelist_hvorfor')
                        .setLabel('Hvorfor vil du gerne spille på Sky Evolved?')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('LONG'),

                    new TextInputComponent()
                        .setCustomId('whitelist_lave')
                        .setLabel('Hvad regner du med at lave på Sky Evolved?')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('LONG'),

                    new TextInputComponent()
                        .setCustomId('whitelist_steam')
                        .setLabel('Hvad er det Link til din steam profil?')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('SHORT'),
                )

            await channel.send({
                embeds: [whitelistEmbed],
            })

            interaction.reply({
                content: 'Opretter ansøgningen...',
                ephemeral: true
            })
            log('<@' + interaction.user.id + '> oprettede whitelist ansøgningen.')

            // for every message that gets sent in the channel
            setInterval(() => {
                channel.messages.cache.forEach(async (message) => {
                    try {
                        if (message.author.id == client.user.id) {
                            return;
                        } else {
                            await message.delete();
                            log(`Slettede besked i <#${Config.ansøgning_channel}>\nSendt af <@${message.author.id}>\nIndhold: \n${message.content}`);
                        }
                    } catch (err) {
                        log(`Fejl ved sletning af besked.\n\n**${err.name}**: ${err.message}`, 'error');
                    }

                })
            }, 1000)
        }
    }

    if (commandName == 'whitelistadd') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log(`<@${interaction.user.id}> bruger kommandoen **/whitelistadd**.`)
            const targetUser = interaction.options.getUser('user');
            var guild = client.guilds.cache.get(Config.guild)
            const member = await guild.members.fetch(targetUser.id)
            const role = await guild.roles.fetch(Config.whitelist_role)

            member.roles.add(role)

            log(`<@${targetUser.id}> fik whitelist af <@${interaction.user.id}>.`)
            const dmEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedWhitelist__')
                .setDescription(
                    'Du har nu modtaget whitelist på Sky Evolved af en staff.\n' +
                    'Du kan hermed tilslutte dig serveren.\n'
                )
                .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedWhitelist__')
                .setDescription(`Du gav <@${targetUser.id}> whitelist.`)
                .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            })

            if (Config.dms == true) {
                try {
                    const dm = await targetUser.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${targetUser.id}>`)
                } catch (err) {
                    log(`Fejl ved DM send.\n\n**${err.name}**: ${err.message}`, 'error');
                }
            }

        }
    }

    if (commandName == 'whitelistremove') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log(`<@${interaction.user.id}> bruger kommandoen **/whitelistremove**.`)
            const targetUser = interaction.options.getUser('user');
            var guild = client.guilds.cache.get(Config.guild)
            const member = await guild.members.fetch(targetUser.id)
            const role = await guild.roles.fetch(Config.whitelist_role)

            member.roles.remove(role)

            log(`<@${targetUser.id}> fik frataget sit whitelist af <@${interaction.user.id}>.`)
            const dmEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedWhitelist__')
                .setDescription(
                    'Du har fået frataget dit whitelist, af en staff hos Sky Evolved.\n' +
                    'Du kan ikke længere tilslutte dig serveren.\n'
                )
                .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedWhitelist__')
                .setDescription(`Du fratog <@${targetUser.id}> whitelist.`)
                .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            })

            if (Config.dms == true) {
                try {
                    const dm = await targetUser.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${targetUser.id}>`)
                } catch (err) {
                    log(`Fejl ved DM send.\n\n**${err.name}**: ${err.message}`, 'error');
                }
            }

        }
    }

    if (commandName == 'ansøg') {
        log('<@' + interaction.user.id + '> brugte kommandoen **/ansøg**.')
        const channel = client.channels.cache.get(Config.whitelist_channel);
        const user = interaction.member;
        if (user.roles.cache.has(Config.whitelist_role)) {
            interaction.reply({
                content: 'Du har allerede whitelist.',
                ephemeral: true
            });
            log('<@' + interaction.user.id + '> brugte kommandoen **/ansøg**, men har allerede whitelist.')
        } else {
            if (interaction.channel == channel) {
                const modal =  new Modal()
                    .setCustomId('whitelist_ansøgning')
                    .setTitle('Whitelist Ansøgning')
                    .addComponents(
                        new TextInputComponent()
                            .setCustomId('whitelist_karakter')
                            .setLabel('Information om karakter [Navn, Baggrund, etc]')
                            .setPlaceholder('Indtast dit svar.')
                            .setRequired(true)
                            .setStyle('LONG'),

                        new TextInputComponent()
                            .setCustomId('whitelist_hvorfor')
                            .setLabel('Hvorfor vil du gerne spille på Sky Evolved?')
                            .setPlaceholder('Indtast dit svar.')
                            .setRequired(true)
                            .setStyle('LONG'),

                        new TextInputComponent()
                            .setCustomId('whitelist_lave')
                            .setLabel('Hvad regner du med at lave på Sky Evolved?')
                            .setPlaceholder('Indtast dit svar.')
                            .setRequired(true)
                            .setStyle('LONG'),

                        new TextInputComponent()
                            .setCustomId('whitelist_steam')
                            .setLabel('Link til din steam profil?')
                            .setPlaceholder('Indtast dit svar.')
                            .setRequired(true)
                            .setStyle('SHORT'),
                    )

                discordModals.showModal(modal, {
                    client: client,
                    interaction: interaction,
                })
                log('<@' + interaction.user.id + '> ansøger om whitelist.')
            }
        }
    }

    if (commandName == 'clear') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/clear**.')
            const amount = interaction.options.getInteger('amount');
            const channel = interaction.channel;
            log('<@' + interaction.user.id + '> slettede ' + amount + ' beskeder.')

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedAdministration__')
                .setDescription('**' + amount + '** beskeder blev slettet af en staff.')
                .setFooter({ text: 'Sky Evolved- Administration', iconURL: logo })
                .setTimestamp()

            if (amount > 100) {
                interaction.reply({
                    content: 'Disords API tillader maks. 100 beskeder pr. gang.',
                    ephemeral: true,
                })
                log('<@' + interaction.user.id + '> forsøgte at slette ' + amount + ' beskeder, men grænsen ligger på 100 pr. gang.')
            } else {
                channel.messages.fetch({ limit: amount }).then(messages => {
                    messages.forEach(message => {
                        setTimeout(() => {
                            message.delete();
                        }, 100)
                    });
                }).catch(console.error);
                await interaction.reply({
                    content: 'Sletning af ' + amount + ' beskeder er nu udført.',
                    ephemeral: true,
                })
                log('Slettede **' + amount + '** beskeder i <#' + channel.id + '>.')
                channel.send({
                    embeds: [embed]
                })
            }
        }
    }

    if (commandName == 'test') {
    }

    if (commandName == 'serverdrift') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/serverdrift**.')
            const channel = client.channels.cache.get(Config.serverdrift_channel);

            const loading = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Atlantic City 2.0 Serverdrift__')
                .setDescription('Loading serverdata ⚙️...')
                .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                .setTimestamp()

            const message = await channel.send({
                embeds: [loading]
            })

            setInterval(() => {
                try {
                    srv.getServerStatus().then(data => {
                        if (data.online == true) {
                            srv.getPlayersAll().then(data => {
                                const embed =   new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTitle('__Atlantic City 2.0 Serverdrift__')
                                    .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                                    .setTimestamp()

                                const row =  new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji("🚀")
                                            .setURL('https://cfx.re/join/qvaqlz')
                                            .setStyle("Link")
                                            .setLabel("Tilslut")
                                    )


                                if (data.length == 0) {
                                    embed.addField('**Spillerliste**', 'Ingen spillere online ❌', true)
                                    embed.addField('Status', 'Online 🟢', true)
                                } else {
                                    embed.addField('**Spillerliste**', '> ' + data.map(player => `[**${player.id}**] ${player.name} - **${player.ping}**ms`).join('\n'), true)
                                    embed.addField('Status', 'Online 🟢', true)
                                }

                                message.edit({
                                    embeds: [embed],
                                    components: [row]
                                })
                            })
                        } else if (!data.online) {
                            console.log('offline')
                            const embed =   new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle('__Atlantic City 2.0 Serverdrift__')
                                .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                                .setTimestamp()
                            //.addField('**Spillerliste**', 'Ingen spillere online ❌', true)
                            //.addField('Status', 'Offline ❌', true)
                            message.edit({
                                embeds: [embed]
                            })
                        } else {
                            console.log('error')
                            const embed =   new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle('__Atlantic City 2.0 Serverdrift__')
                                .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                                .setTimestamp()
                            //.addField('**Spillerliste**', 'Kunne ikke loade spillerdata ⚠️.', true)
                            //.addField('Status', 'Connection Error ⚠️', true)
                            message.edit({
                                embeds: [embed]
                            })

                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            }, 2000)
        }
    } if (commandName == 'serverdrift') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/serverdrift**.')
            const channel = client.channels.cache.get(Config.serverdrift_channel);

            const loading = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Atlantic City 2.0 Serverdrift__')
                .setDescription('Loading serverdata ⚙️...')
                .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                .setTimestamp()

            const message = await channel.send({
                embeds: [loading]
            })

            setInterval(() => {
                try {
                    srv.getServerStatus().then(data => {
                        if (data.online == true) {
                            srv.getPlayersAll().then(data => {
                                const embed =   new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTitle('__Atlantic City 2.0 Serverdrift__')
                                    .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                                    .setTimestamp()

                                const row =  new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji("🚀")
                                            .setURL('https://cfx.re/join/qvaqlz')
                                            .setStyle("Link")
                                            .setLabel("Tilslut")
                                    )


                                if (data.length == 0) {
                                    embed.addField('**Spillerliste**', 'Ingen spillere online ❌', true)
                                    embed.addField('Status', 'Online 🟢', true)
                                } else {
                                    embed.addField('**Spillerliste**', '> ' + data.map(player => `[**${player.id}**] ${player.name} - **${player.ping}**ms`).join('\n'), true)
                                    embed.addField('Status', 'Online 🟢', true)
                                }

                                message.edit({
                                    embeds: [embed],
                                    components: [row]
                                })
                            })
                        } else if (!data.online) {
                            console.log('offline')
                            const embed =   new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle('__Atlantic City 2.0 Serverdrift__')
                                .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                                .setTimestamp()
                            //.addField('**Spillerliste**', 'Ingen spillere online ❌', true)
                            //.addField('Status', 'Offline ❌', true)
                            message.edit({
                                embeds: [embed]
                            })
                        } else {
                            console.log('error')
                            const embed =   new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle('__Atlantic City 2.0 Serverdrift__')
                                .setFooter({ text: 'Atlantic City 2.0 - Serverdrift', iconURL: logo })
                                .setTimestamp()
                            //.addField('**Spillerliste**', 'Kunne ikke loade spillerdata ⚠️.', true)
                            //.addField('Status', 'Connection Error ⚠️', true)
                            message.edit({
                                embeds: [embed]
                            })

                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            }, 2000)
        }
    }

    if (commandName == 'pingcreate') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/pingcreate**.')
            const channel = client.channels.cache.get(Config.pingrolle_channel);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedPing__')
                .setDescription(`Kunne du godt tænke dig at blive pinget, når der kommer nogle nyheder?\nSå tryk på knappen nedenfor, for at modtage <@&${Config.ping_role}> rollen.\nVil du ikke have den længere, kan du bare trykke på knappen igen.`)
                .setFooter({ text: 'Sky Evolved- Ping', iconURL: logo })

            const row =  new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("modtag")
                        .setEmoji("📝")
                        .setStyle("Success")
                        .setLabel("Modtag"),
                )
            const message = await channel.send({
                embeds: [embed],
                components: [row]
            })

            const filter = ( button ) => button.clicker;
            const collector = message.createMessageComponentCollector(filter, { time: 120000 });

            collector.on('collect', async (button) => {
                if (button.customId == "modtag") {
                    const replyEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedPing__')
                        .setDescription(`Du modtog <@&${Config.ping_role}> rollen.`)
                        .setFooter({ text: 'Sky Evolved- Ping', iconURL: logo })
                    const replyEmbed2 = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedPing__')
                        .setDescription(`Du fik fjernet <@&${Config.ping_role}> rollen.`)
                        .setFooter({ text: 'Sky Evolved- Ping', iconURL: logo })
                    const targetUser = button.user;
                    var guild = client.guilds.cache.get(Config.guild)
                    const member = await guild.members.fetch(targetUser.id)
                    const role = await guild.roles.fetch(Config.ping_role)
                    // check if user has role
                    if (member.roles.cache.has(role.id)) {
                        member.roles.remove(role.id)
                        await button.reply({
                            embeds: [replyEmbed2],
                            ephemeral: true
                        })
                    } else {
                        member.roles.add(role.id)
                        await button.reply({
                            embeds: [replyEmbed],
                            ephemeral: true
                        })
                    }
                }
            })


        }
    }

    if (commandName == 'faq') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            const channel = client.channels.cache.get(Config.faq_channel);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedFAQ__')
                .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                .setDescription(
                    'Nedenfor kan du vælge, hvad du vil have svar på.\n\n' +
                    '1️⃣ **Hvad framework bruger i?**\n\n' +
                    '2️⃣ **Hvordan ansøger jeg?**\n\n' +
                    '3️⃣ **Hvad er aldersgrænsen?**\n\n' +
                    '4️⃣ **Information om Sky Evolved?**\n\n' +
                    '5️⃣ **Hvornår svarer i på ansøgninger?**\n\n' +
                    '6️⃣ **Er det realistisk roleplay?**\n\n' +
                    '7️⃣ **Hvor mange karaktere har man?**\n\n' +
                    '8️⃣ **Hvor mange slots har i?**\n\n'
                )

            const row =  new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("1")
                        .setEmoji("1️⃣")
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("2")
                        .setEmoji("2️⃣")
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("3")
                        .setEmoji("3️⃣")
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("4")
                        .setEmoji("4️⃣")
                        .setStyle("Secondary"),
                )

            const row2 =  new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("5")
                        .setEmoji("5️⃣")
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("6")
                        .setEmoji("6️⃣")
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("7")
                        .setEmoji("7️⃣")
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("8")
                        .setEmoji("8️⃣")
                        .setStyle("Secondary"),

                )

            channel.send({
                embeds: [embed],
                components: [row, row2]
            })

            const filter = ( button ) => button.clicker;
            const collector = channel.createMessageComponentCollector(filter, { time: 120000 });
            collector.on('collect', async (button) => {
                if (button.customId == '1') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription(`Sky Evolved benytter sig af ESX Legacy (**v1.7.5**) frameworked.`)
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    } catch (error) {
                        return
                    }
                } else if (button.customId == '2') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription(`Du kan ansøge om de forskellige jobs, og om at blive en del af teamet, inde i <#${Config.ansøgning_channel}> `)
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    } catch (error) {
                        return
                    }
                } else if (button.customId == '3') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription(`Der er ingen aldersgrænse på whitelist ansøgningerne, her handler det om ens timer og erfaring i FiveM.\nMen på visse whitelisted jobs og ansøgninger, kan en aldersgrænse forekomme.`)
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                    catch (error) {
                        return
                    }
                } else if (button.customId == '4') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription(
                            '**Baggrunds Historie**\n' +
                            '> Sky Evolved var en vRP server, der kørte tilbage i 2019.\n' +
                            '> Grundlaget for serverens lukning, var at ledelsen blev nød til at forlade, grundet økonomiske årsager.\n' +
                            '> Dengang lå Sky Evolved på gennemsnitligt 60 spiller dagligt, efter at have været oppe i 2 uger.\n\n' +
                            '**Moto & Info**\n' +
                            '> Dengang blev Sky Evolved kendt for deres udvikling, det var unikt og der var mange ting man ikke havde set før. ' +
                            'Det førte også til et forhøjet RP niveau.\n' +
                            '> Der var også god support, og et godt community. Det gjorde de ved at der ikke var nogen aldersgrænse, men at de kiggede på timerne, og erfaring.\n' +
                            '> Der var dog en aldersgrænse på visse jobs, og ting i teamet.\n\n' +
                            '**Formål med at åbne op igen.**\n' +
                            '> 2.0 har været i <@' + Config.odin_id + '> baghovedet længe. Han har længe gået og tænkt på at starte Sky Evolved op igen.\n' +
                            '> Han mener at det danske FiveM mangler nye servere, som ikke efterligner andre, og er unikke.\n' +
                            '> Han har dog taget sagen i sin egen hånd, og har fået penge til at betale det hele.\n\n' +
                            '**Fremtid for Sky Evolved**\n' +
                            '> Vi håber på at blive ved med at være på udviklingen, og bygge et af de bedste RP communities i Danmark.\n' +
                            '> Så vi en dag kan kaldes os nogle af de bedste i dag.'
                        )
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                    catch (error) {
                        return
                    }
                } else if (button.customId == '5') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription('Det er forskelligt fra område til område, da der er forskellige ansvarlige.')
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    }
                    catch (error) {
                        return
                    }
                } else if (button.customId == '6') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription('På Sky Evolved kører vi med realistisk roleplay.')
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    } catch (error) {
                        return
                    }
                } else if (button.customId == '7') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription('Vi har valgt, at man skal have 2 karaktere.')
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    } catch (error) {
                        return
                    }
                } else if (button.customId == '8') {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('__Sky EvolvedFAQ__')
                        .setDescription('Vi har valgt at køre med 64 slots.')
                        .setFooter({ text: 'Sky Evolved- FAQ', iconURL: logo })
                    try {
                        await button.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                    } catch (error) {
                        return
                    }
                }
            })
        }
    }

    if (commandName == 'ticketcreate') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            const channel = client.channels.cache.get(Config.ticket_channel);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(
                    '*Du kan vælge tickettens type nedenfor.*' +
                    '\n\n' +
                    '**✉️ Generel Ticket**\n' +
                    '> Hvis du har brug for hjælp, eller hvis du har et spørgsmål.\n\n' +
                    '**⚙️ Dev Ticket**\n' +
                    '> Hvis du har brug for en developers hjælp, eller du har fundet en fejl.\n\n' +
                    '**👤 Ledelse Ticket**\n' +
                    '> Hvis du har brug for at kontakte en fra ledelsen.'
                )
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })
            const row =  new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ticket_type')
                        .setPlaceholder('Vælg Ticket Type')
                        .addOptions([
                            {
                                label: '✉️ Generel Ticket',
                                description: 'Tryk for at oprette en generel ticket.',
                                value: 'generelticket'
                            },
                            {
                                label: '⚙️ Dev Ticket',
                                description: 'Tryk for at oprette en dev ticket.',
                                value: 'devticket'
                            },
                            {
                                label: '👤 Ledelse Ticket',
                                description: 'Tryk for at oprette en ledelse ticket.',
                                value: 'ledelseticket'
                            },
                        ])
                )

            channel.send({
                embeds: [embed],
                components: [row],
            })
        }
    }

    if (commandName == 'ticketadd') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            const channel = interaction.channel;
            if (channel.parentId == Config.ticket_category) {
                const targetUser = interaction.options.getUser('user');
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('__Sky EvolvedTickets__')
                    .setDescription('Du tilføjede <@' + targetUser + '> til denne ticket.')
                    .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                const ticketEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('__Sky EvolvedTickets__')
                    .setDescription('<@' + interaction.user + '> tilføjede <@' + targetUser + '> til denne ticket.')
                    .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })

                channel.send({
                    embeds: [ticketEmbed],
                })
                try {
                    channel.permissionOverwrites.create(interaction.guild.roles.everyone, {
                        VIEW_CHANNEL: false,
                        SEND_MESSAGES: false,
                    });

                    channel.permissionOverwrites.create(targetUser, {
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: true,
                        READ_MESSAGE_HISTORY: true,
                    }).catch(console.error);
                    log(`${interaction.user} tilføjede ${targetUser} til **${channel.name}**.`)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    if (commandName == 'ticketremove') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            const channel = interaction.channel;
            if (channel.parentId == Config.ticket_category) {
                const targetUser = interaction.options.getUser('user');
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('__Sky EvolvedTickets__')
                    .setDescription('Du fjernede <@' + targetUser + '> fra denne ticket.')
                    .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                const ticketEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('__Sky EvolvedTickets__')
                    .setDescription('<@' + interaction.user + '> fjernede <@' + targetUser + '> fra denne ticket.')
                    .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })

                channel.send({
                    embeds: [ticketEmbed],
                })
                try {
                    channel.permissionOverwrites.create(interaction.guild.roles.everyone, {
                        VIEW_CHANNEL: false,
                        SEND_MESSAGES: false,
                    });

                    channel.permissionOverwrites.create(targetUser, {
                        VIEW_CHANNEL: false,
                        SEND_MESSAGES: false,
                        READ_MESSAGE_HISTORY: false,
                    }).catch(console.error);

                    log(`${interaction.user} fjernede ${targetUser} fra **${channel.name}**.`)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    if (commandName == 'reglercreate') {
        if (interaction.member.roles.cache.has(StaffRole)) {
            log('<@' + interaction.user.id + '> brugte kommandoen **/reglercreate**.')
            const channel = client.channels.cache.get(Config.regler_channel);
            const embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription('*For at læse Sky Evolveds regler, skal du bruge knapperne nedenfor.*\n*Obs. Alle regler skal læses, men du kan selv vælge rækkefølgen.*\n\n' +
                    '**Generelt**\nGenerelle regler, der vedrører discorden.' +
                    '\n\n**Roleplay**\nRoleplay regler der vedrører, hvordan ens roleplay skal foregå.' +
                    '\n\n**Multikaraktere**\nRegler de vedrører ens karaktere.' +
                    '\n\n**OOC / Karakterbrud**\nRegler der vedrører OOC, og brud af karakter.' +
                    '\n\n**Kørsel**\nRegler der vedrører ens kørsel.' +
                    '\n\n**Arbejde**\nRegler der vedrører ens arbejde og, hvordan det skal fremføres.' +
                    '\n\n**Opkald & Kommunikation**\nRegler der vedrører opkald til alarmcentralen, og hvordan der skal kommunikeres.' +
                    '\n\n**Bugs, Snyd, Hacking & Exploiting**\nRegler der vedrører snyd, og andet i den form.' +
                    '\n\n**Gruppinger & Bander**\nRegler om gruppinger og bander der vedrører, hvordan det skal foregå.' +
                    '\n\n**Bandekrig**\nRegler for, hvordan en bandekrig skal foregå.' +
                    '\n\n**Røverier**\nRegler om, hvordan røverier af diverse ting skal foregå.' +
                    '\n\n**Karakterdrab (CK)**\nRegler der vedrører et karakterdrab og, hvordan det skal udføres.' +
                    '\n\n**Handlinger**\nRegler der vedrører hans handlinger i på FiveM serveren.' +
                    '\n\n**Køb & Salg (Real Money Trading)**\nRegler der involverer køb og salg af ingame ting, for rigtige penge.')
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            const row =  new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('regler_type')
                        .setPlaceholder('Vælg Her')
                        .addOptions([
                            {
                                label: 'Generelt',
                                description: 'Generelle regler, der vedrører discorden.',
                                value: 'generelt'
                            },
                            {
                                label: 'Roleplay',
                                description: 'Roleplay regler der vedrører, hvordan ens roleplay skal foregå.',
                                value: 'roleplay'
                            },
                            {
                                label: 'Multikaraktere',
                                description: 'Regler de vedrører ens karaktere.',
                                value: 'multikaraktere'
                            },
                            {
                                label: 'OOC / Karakterbrud',
                                description: 'Regler der vedrører OOC, og brud af karakter.',
                                value: 'ooc'
                            },
                            {
                                label: 'Kørsel',
                                description: 'Regler der vedrører ens kørsel.',
                                value: 'kørsel'
                            },
                            {
                                label: 'Arbejde',
                                description: 'Regler der vedrører ens arbejde og, hvordan det skal fremføres.',
                                value: 'arbejde'
                            },
                            {
                                label: 'Opkald & Kommunikation',
                                description: 'Regler der vedrører opkald til alarmcentralen.',
                                value: 'opkald'
                            },
                            {
                                label: 'Bugs, Snyd, Hacking & Exploiting',
                                description: 'Regler der vedrører snyd, og andet i den form.',
                                value: 'bugs'
                            },
                            {
                                label: 'Gruppinger & Bander',
                                description: 'Regler om gruppinger og bander.',
                                value: 'grupperinger'
                            },
                            {
                                label: 'Bandekrig',
                                description: 'Regler for, hvordan en bandekrig skal foregå.',
                                value: 'bandekrig'
                            },
                            {
                                label: 'Røverier',
                                description: 'Regler om, hvordan røverier af diverse ting skal foregå.',
                                value: 'røverier'
                            },
                            {
                                label: 'Karakterdrab (CK)',
                                description: 'Regler der vedrører et karakterdrab.',
                                value: 'karakterdrab'
                            },
                            {
                                label: 'Handlinger',
                                description: 'Regler der vedrører hans handlinger i på FiveM serveren.',
                                value: 'handlinger'
                            },
                            {
                                label: 'Køb & Salg (Real Money Trading)',
                                description: 'Regler der involverer køb og salg.',
                                value: 'køb'
                            },
                        ])
                )

            /*

            GENERELLE REGLER / OUTGAME REGLER
            ROLEPLAY REGLER
            FLERE KARAKTERERFLERE KARAKTERER
            Out Of Character (OOC) / Karakterbrud
            KØRSEL
            ARBEJDE
            OPKALD OG KOMMUNIKATION
            BUGS, SNYD, HACKING, EXPLOITING
            GRUPPERINGER / BANDER
            BANDEKRIG
            RØVERIER
            KARAKTERDRAB (CK)
            HANDLINGER
            KØB & SALG (REAL MONEY TRADING)

            */

            channel.send({
                embeds: [embed],
                components: [row]
            })

        }
    }
})

// Select Menuer \\
client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    const value = interaction.values;
    // Ansøgninger \\
    if (interaction.customId === 'ansøgning_type') {
        if (value == 'politi') {
            const modal =  new Modal()
                .setCustomId('politi_ansøgning')
                .setTitle('Politi Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('politi_navn')
                        .setLabel('Navn & Alder [IRL]')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('SHORT'),

                    new TextInputComponent()
                        .setCustomId('politi_hvorfor')
                        .setLabel('Hvorfor ansøger du?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('politi_vælgedig')
                        .setLabel('Hvorfor skal vi vælge dig?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('politi_erfaringer')
                        .setLabel('Hvad er dine erfaringer?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        } else if (value == 'ems') {
            const modal =  new Modal()
                .setCustomId('ems_ansøgning')
                .setTitle('EMS Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('ems_navn')
                        .setLabel('Navn & Alder [IRL]')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('SHORT'),

                    new TextInputComponent()
                        .setCustomId('ems_hvorfor')
                        .setLabel('Hvorfor ansøger du?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('ems_vælgedig')
                        .setLabel('Hvorfor skal vi vælge dig?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('ems_erfaringer')
                        .setLabel('Hvad er dine erfaringer?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        } else if (value == 'advokat') {
            const modal =  new Modal()
                .setCustomId('advokat_ansøgning')
                .setTitle('Advokat Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('advokat_navn')
                        .setLabel('Navn & Alder [IRL]')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true)
                        .setStyle('SHORT'),

                    new TextInputComponent()
                        .setCustomId('advokat_hvorfor')
                        .setLabel('Hvorfor ansøger du?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('advokat_vælgedig')
                        .setLabel('Hvorfor skal vi vælge dig?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('advokat_erfaringer')
                        .setLabel('Hvad er dine erfaringer?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        } else if (value == 'firma') {
            const modal =  new Modal()
                .setCustomId('firma_ansøgning')
                .setTitle('Firma Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('firma_navn')
                        .setLabel('Navn & Alder [IRL]')
                        .setStyle('SHORT')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('firma_om')
                        .setLabel('Hvad skal dit firma hedde?')
                        .setStyle('SHORT')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('firma_lave')
                        .setLabel('Hvad laver dit firma?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('firma_medarbejdere')
                        .setLabel('Liste af firmaets medarbejdere? [3+]')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('firma_rådighed')
                        .setLabel('Hvad skal vi stille dit firma til rådighed?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),
                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        } else if (value == 'staff') {
            const modal =  new Modal()
                .setCustomId('staff_ansøgning')
                .setTitle('Staff Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('staff_navn')
                        .setLabel('Navn & Alder [IRL]')
                        .setStyle('SHORT')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('staff_hvorfor')
                        .setLabel('Hvorfor ansøger du?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('staff_erfaringer')
                        .setLabel('Hvad er dine erfaringer?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('staff_vælgedig')
                        .setLabel('Hvorfor skal vi vælge dig?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),
                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        } else if (value == 'betatester') {
            const modal =  new Modal()
                .setCustomId('betatester_ansøgning')
                .setTitle('Beta Tester Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('beta_timer')
                        .setLabel('Timer i FiveM? [Inkl. bevis]')
                        .setStyle('SHORT')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('beta_tit')
                        .setLabel('Hvor tit kan du være aktiv, som beta tester?')
                        .setStyle('SHORT')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('beta_hvorfor')
                        .setLabel('Hvorfor vil du gerne være beta tester?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),
                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        } else if (value == 'whitelistmodtager') {
            const modal =  new Modal()
                .setCustomId('whitelistmodtager_ansøgning')
                .setTitle('Whitelist Modtager Ansøgning')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('whitelistmodtager_navn')
                        .setLabel('Navn & Alder [IRL]')
                        .setStyle('SHORT')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('whitelistmodtager_hvorfor')
                        .setLabel('Hvorfor ansøger du?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),

                    new TextInputComponent()
                        .setCustomId('whitelistmodtager_vælgedig')
                        .setLabel('Hvorfor skal vi vælge dig?')
                        .setStyle('LONG')
                        .setPlaceholder('Indtast dit svar.')
                        .setRequired(true),
                )
            discordModals.showModal(modal, {
                client: client,
                interaction: interaction,
            })
        }
    }
    // Ticket System \\
    if (interaction.customId === 'ticket_type') {
        if (value == 'generelticket') {
            log(`<@${interaction.user.id}> oprettede en generel ticket.`)
            const channel = client.channels.cache.get(Config.ticket_channel);
            const subChannel = await channel.guild.channels.create(`generel-${interaction.user.username}`);
            subChannel.setParent(Config.ticket_category);
            log(`Subchannel ${subChannel.name} oprettet.`)
            const user = interaction.user

            subChannel.permissionOverwrites.create(interaction.guild.roles.everyone, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
            });

            subChannel.permissionOverwrites.create(user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
            }).catch(console.error);

            const embed = new EmbedBuilder()
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(`Oprettede Generel Ticket <#${subChannel.id}>`)
                .setColor('#0099ff')
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            })

            const channelEmbed = new EmbedBuilder()
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(`Det her er din ticket. Hvis du ønsker at få tilføjet folk til ticketten, skal du bare skrive det her. Derefter vil en staff tilføje personen.`)
                .setColor('#0099ff')
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

            const row =  new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Luk')
                        .setStyle('Danger')
                        .setEmoji('✖️')
                )

            const subMessage = await subChannel.send({
                embeds: [channelEmbed],
                content: `${interaction.user}`,
                components: [row]
            })

            const filter = ( button ) => button.clicker;
            const collector = subMessage.createMessageComponentCollector(filter, { time: 120000 });

            collector.on('collect', async (button) => {
                if (button.customId == 'ticket_close') {
                    const embed = new EmbedBuilder()
                        .setTitle('__Sky EvolvedTickets__')
                        .setDescription(`Er du sikker på, du vil lukke ticketten?`)
                        .setColor('#0099ff')
                        .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                    const row =  new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ticket_close_yes')
                                .setLabel('Ja')
                                .setStyle('Success')
                                .setEmoji('✔️'),
                            new ButtonBuilder()
                                .setCustomId('ticket_close_no')
                                .setLabel('Nej')
                                .setStyle('Danger')
                                .setEmoji('✖️'),
                        )

                    const ticket_closeMessage = await subChannel.send({
                        embeds: [embed],
                        components: [row]
                    })

                    const filter = ( button ) => button.clicker;
                    const collector = ticket_closeMessage.createMessageComponentCollector(filter, { time: 120000 });
                    collector.on('collect', async (button) => {
                        if (button.customId == 'ticket_close_yes') {
                            const embed = new EmbedBuilder()
                                .setTitle('__Sky EvolvedTickets__')
                                .setDescription(`**Ticketten er nu lukket.**\n*Kanalen bliver slettet om 5 sekunder.*`)
                                .setColor('#0099ff')
                                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                            button.reply({
                                embeds: [embed],
                            })

                            setTimeout(() => {
                                log(`${button.user} lukkede en ticket (**${subChannel.name}**).`)
                                log(`Subchannel ${subChannel.name} slettet.`)
                                try {
                                    if (subChannel != null) {
                                        subChannel.delete().catch(console.error);
                                    } else {
                                        return
                                    }
                                } catch (error) {
                                    log(`Kunne ikke slette subchannel ${subChannel.name}.`)
                                }
                            }, 5000)
                        } else if (button.customId == 'ticket_close_no') {
                            const embed = new EmbedBuilder()
                                .setTitle('__Sky EvolvedTickets__')
                                .setDescription(`**Genåbner ticketten.**`)
                                .setColor('#0099ff')
                                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                            button.reply({
                                embeds: [embed],
                            })

                            setTimeout(() => {
                                ticket_closeMessage.delete();
                                log(`${button.user} genåbnede en ticket (**${subChannel.name}**).`)
                            }, 1000)
                        }
                    })
                }
            })

        } else if (value == 'devticket') {
            log(`<@${interaction.user.id}> oprettede en dev ticket.`)
            const channel = client.channels.cache.get(Config.ticket_channel);
            const subChannel = await channel.guild.channels.create(`dev-${interaction.user.username}`);
            subChannel.setParent(Config.ticket_category);
            log(`Subchannel ${subChannel.name} oprettet.`)
            const user = interaction.user

            subChannel.permissionOverwrites.create(interaction.guild.roles.everyone, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
            });

            subChannel.permissionOverwrites.create(user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
            }).catch(console.error);

            const embed = new EmbedBuilder()
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(`Oprettede Dev Ticket <#${subChannel.id}>`)
                .setColor('#0099ff')
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            })

            const channelEmbed = new EmbedBuilder()
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(`Det her er din ticket. Hvis du ønsker at få tilføjet folk til ticketten, skal du bare skrive det her. Derefter vil en staff tilføje personen.`)
                .setColor('#0099ff')
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

            const row =  new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Luk')
                        .setStyle('Danger')
                        .setEmoji('✖️')
                )

            const subMessage = await subChannel.send({
                embeds: [channelEmbed],
                content: `${interaction.user}`,
                components: [row]
            })

            const filter = ( button ) => button.clicker;
            const collector = subMessage.createMessageComponentCollector(filter, { time: 120000 });

            collector.on('collect', async (button) => {
                if (button.customId == 'ticket_close') {
                    const embed = new EmbedBuilder()
                        .setTitle('__Sky EvolvedTickets__')
                        .setDescription(`Er du sikker på, du vil lukke ticketten?`)
                        .setColor('#0099ff')
                        .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                    const row =  new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ticket_close_yes')
                                .setLabel('Ja')
                                .setStyle('Success')
                                .setEmoji('✔️'),
                            new ButtonBuilder()
                                .setCustomId('ticket_close_no')
                                .setLabel('Nej')
                                .setStyle('Danger')
                                .setEmoji('✖️'),
                        )

                    const ticket_closeMessage = await subChannel.send({
                        embeds: [embed],
                        components: [row]
                    })

                    const filter = ( button ) => button.clicker;
                    const collector = ticket_closeMessage.createMessageComponentCollector(filter, { time: 120000 });
                    collector.on('collect', async (button) => {
                        if (button.customId == 'ticket_close_yes') {
                            const embed = new EmbedBuilder()
                                .setTitle('__Sky EvolvedTickets__')
                                .setDescription(`**Ticketten er nu lukket.**\n*Kanalen bliver slettet om 5 sekunder.*`)
                                .setColor('#0099ff')
                                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                            button.reply({
                                embeds: [embed],
                            })

                            setTimeout(() => {
                                log(`${button.user} lukkede en ticket (**${subChannel.name}**).`)
                                log(`Subchannel ${subChannel.name} slettet.`)
                                try {
                                    if (subChannel != null) {
                                        subChannel.delete().catch(console.error);
                                    } else {
                                        return
                                    }
                                } catch (error) {
                                    log(`Kunne ikke slette subchannel ${subChannel.name}.`)
                                }
                            }, 5000)
                        } else if (button.customId == 'ticket_close_no') {
                            const embed = new EmbedBuilder()
                                .setTitle('__Sky EvolvedTickets__')
                                .setDescription(`**Genåbner ticketten.**`)
                                .setColor('#0099ff')
                                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                            button.reply({
                                embeds: [embed],
                            })

                            setTimeout(() => {
                                ticket_closeMessage.delete();
                                log(`${button.user} genåbnede en ticket (**${subChannel.name}**).`)
                            }, 1000)
                        }
                    })
                }
            })
        } else if (value == 'ledelseticket') {
            log(`<@${interaction.user.id}> oprettede en ledelse ticket.`)
            const channel = client.channels.cache.get(Config.ticket_channel);
            const subChannel = await channel.guild.channels.create(`ledelse-${interaction.user.username}`);
            subChannel.setParent(Config.ticket_category);
            log(`Subchannel ${subChannel.name} oprettet.`)
            const user = interaction.user

            subChannel.permissionOverwrites.create(interaction.guild.roles.everyone, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
            });

            subChannel.permissionOverwrites.create(user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
            }).catch(console.error);

            const embed = new EmbedBuilder()
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(`Oprettede Ledelse Ticket <#${subChannel.id}>`)
                .setColor('#0099ff')
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            })

            const channelEmbed = new EmbedBuilder()
                .setTitle('__Sky EvolvedTickets__')
                .setDescription(`Det her er din ticket. Hvis du ønsker at få tilføjet folk til ticketten, skal du bare skrive det her. Derefter vil en staff tilføje personen.`)
                .setColor('#0099ff')
                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

            const row =  new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Luk')
                        .setStyle('Danger')
                        .setEmoji('✖️')
                )

            const subMessage = await subChannel.send({
                embeds: [channelEmbed],
                content: `${interaction.user}`,
                components: [row]
            })

            const filter = ( button ) => button.clicker;
            const collector = subMessage.createMessageComponentCollector(filter, { time: 120000 });

            collector.on('collect', async (button) => {
                if (button.customId == 'ticket_close') {
                    const embed = new EmbedBuilder()
                        .setTitle('__Sky EvolvedTickets__')
                        .setDescription(`Er du sikker på, du vil lukke ticketten?`)
                        .setColor('#0099ff')
                        .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                    const row =  new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ticket_close_yes')
                                .setLabel('Ja')
                                .setStyle('Success')
                                .setEmoji('✔️'),
                            new ButtonBuilder()
                                .setCustomId('ticket_close_no')
                                .setLabel('Nej')
                                .setStyle('Danger')
                                .setEmoji('✖️'),
                        )

                    const ticket_closeMessage = await subChannel.send({
                        embeds: [embed],
                        components: [row]
                    })

                    const filter = ( button ) => button.clicker;
                    const collector = ticket_closeMessage.createMessageComponentCollector(filter, { time: 120000 });
                    collector.on('collect', async (button) => {
                        if (button.customId == 'ticket_close_yes') {
                            const embed = new EmbedBuilder()
                                .setTitle('__Sky EvolvedTickets__')
                                .setDescription(`**Ticketten er nu lukket.**\n*Kanalen bliver slettet om 5 sekunder.*`)
                                .setColor('#0099ff')
                                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                            button.reply({
                                embeds: [embed],
                            })

                            setTimeout(() => {
                                log(`${button.user} lukkede en ticket (**${subChannel.name}**).`)
                                log(`Subchannel ${subChannel.name} slettet.`)
                                try {
                                    if (subChannel != null) {
                                        subChannel.delete().catch(console.error);
                                    } else {
                                        return
                                    }
                                } catch (error) {
                                    log(`Kunne ikke slette subchannel ${subChannel.name}.`)
                                }
                            }, 5000)
                        } else if (button.customId == 'ticket_close_no') {
                            const embed = new EmbedBuilder()
                                .setTitle('__Sky EvolvedTickets__')
                                .setDescription(`**Genåbner ticketten.**`)
                                .setColor('#0099ff')
                                .setFooter({ text: 'Sky Evolved- Tickets', iconURL: logo })

                            button.reply({
                                embeds: [embed],
                            })

                            setTimeout(() => {
                                ticket_closeMessage.delete();
                                log(`${button.user} genåbnede en ticket (**${subChannel.name}**).`)
                            }, 1000)
                        }
                    })
                }
            })
        }
    }

    if (interaction.customId === 'regler_type') {
        if (value == 'generelt') {
            const generelt_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**GENERELLE REGLER / OUTGAME REGLER**' +
                    '\n\n**0.0** : Det er ikke tilladt at kontakte server personale i private beskeder uden forudgående accept. Brug vores support-kanaler på Discord.' +
                    '\n\n**0.1** : Reklame og/eller Links er ikke tilladt, dette indgår også ens discord status. (Discord-tag "Streamer / CC" er undtaget af denne regel, og må gerne have eget Twitch-Link i navn.)' +
                    '\n\n**0.2** : Sky Evolved tager stor afstand til udstilling/chikane/racisme/mobning generelt, og forbeholder sig retten til at sanktionere for dette for at opretholde et positivt fællesskab.' +
                    '\n\n**0.3** : Det er ikke tilladt at være saltet/toxic (overfor andre brugere) i communityet, og kan medfører ban. Vi ønsker en god tone og et voksent community.' +
                    '\n\n**0.4** : Du må ikke blande dig i andres admin/support sager, med mindre at du selv har været en del af RPen. (Grove overtrædelser såsom: RDM, VDM, Bugabuse etc. er undtaget)' +
                    '\n\n**0.5** : Din bruger samt dit whitelist hos Sky Evolved er personligt, og må ikke udleveres eller udlånes til anden part (eller tredje part).'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [generelt_embed],
                ephemeral: true
            })
        } else if (value == 'roleplay') {
            const roleplay_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**ROLEPLAY REGLER**' +
                    '\n\n**1.0** : Tænk realistisk - du skal opføre dig som du ville i virkeligheden.' +
                    '\n\n**1.1** : ("FearRP") Du skal frygte for dit liv. Det betyder f.eks. at du ikke må trække våben, hvis der peges våben mod dig.' +
                    '\n\n**1.2** : ("Meta-gaming") Du må ikke tage viden, som du har fået udenfor spillet, og bruge det ingame. Dette gælder f.eks. information fra en livestream eller via Discord. Det er heller ikke tilladt at dele din karakters tanker via /me eller /do command.' +
                    '\n\n**1.3** : ("RDM") Random DeathMatch, ("VDM") Vehicle DeathMatch eller metagaming vil der blive slået meget hårdt ned på, da dette anses som FailRP. Nul tolerance.' +
                    '\n\n**1.4** : Husk altid at have et bevis og karakter ID hvis du vil anklage en anden spiller for et regelbrud eller et tvivlsomt scenarie.' +
                    'Vi anbefaler eksempelvis at have Medal.tv kørende, så hvis du bliver udsat for noget har du altid et klip af situationen - dog ikke et krav.' +
                    '\n\n**1.5** : Powergaming er ikke tilladt.' +
                    '\n\n**1.6** : Det er max tilladt at være 8 kriminelle i et RP-scenarie med samme kriminelle formål - andet vil anses som powergaming.' +
                    '\n\n**1.7** : Spil realistisk omkring befærdede områder, politistationer, hospitaler, bandeområder og lignende.' +
                    '\n\n**1.8** : Det er ikke tilladt at ændre grundelementerne i din karakters udseende for at undgå at folk kan genkende din karakter.' +
                    '\n\n**1.9** : Det er ikke tilladt at logge ud hvis man er involveret i et igangværende scenarie.' +
                    '\n\n**1.10** : Du må ikke bruge server genstart/crashes som en mulighed til at flygte fra en RP situation. Du venter på personer involverede vender tilbage og fortsætter hvis scenariet ikke er afsluttet - evt. brug #hyggesnak til at høre om personen kommer tilbage.' +
                    '\n\n**1.11** : Det er ikke tilladt at bruge optagelser fra enten streams eller 3.-parts programmer i RP scenarier. Dog med disse undtagelser:' +
                    'Banker, politistationer, hospitaler, og andre steder som har godkendte overvågningskameraer. Disse kan bruges som dokumention i RP. (f.eks. politisag eller retssag)' +
                    '\n\n**1.12** : Voldtægts RP er ikke tilladt.')
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [roleplay_embed],
                ephemeral: true
            })
        } else if (value == 'multikaraktere') {
            const multikaraktere_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**MULTIKARAKTER REGLER**' +
                    '\n\n**2.0** : Du kan maxs have 2 karaktere.' +
                    '\n\n**2.1** : Har du flere whitelistede karakterer, så må dine karakterer ikke have relationer, eller kende til hinanden.'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [multikaraktere_embed],
                ephemeral: true
            })
        } else if (value == 'ooc') {
            const ooc_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**OUT OF CHARACTER (OOC) / KARAKTERBRUD REGLER**'+
                    '\n\n**3.0** : ("OOC") Det er ikke tilladt at bryde din karakter, altså at tale ude af karakter ("out of character"). Tag den på Discord eller kontakt en admin hvis nødvendigt.' +
                    '\n\n**3.1** : Alle support-sager skal tages på Discord i support-kanalerne.'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [ooc_embed],
                ephemeral: true
            })
        } else if (value == 'kørsel') {
            const kørsel_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**KØRSEL REGLER**' +
                    '\n\n**4.0** : Kør realistisk. Sportsvogne kan ikke køre i bjerge eller køre 400km/t i grus.' +
                    '\n\n**4.1** : Såfremt man er i en bil jagt/flugt, er det kun tilladt at benytte veje, stier, gyder eller lign. som er markeret på kortet.' +
                    '\n\n*Der er massere af sjove, alternative og "off-road" veje markeret på kortet.*' +
                    '\n*Mindre flyvehop er også OK, så længe man husker at spille på sine skader, og at det ikke er åbenlyst for at slippe væk fra modparten.*' +
                    '\n*Reglen er lavet med det formål at skabe nogle sjovere, længere og mere realistiske chases for alle.*' +
                    '\n\n**4.2** : Det er ikke tilladt at tiltrække Politiets opmærksomhed unødvendigt uden RP-grund (Copbait).'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [kørsel_embed],
                ephemeral: true
            })
        } else if (value == 'arbejde') {
            const arbejde_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**ARBEJDE REGLER**' +
                    '\n\n**5.0** : Er du på arbejde, så skal du passe dit job. Vil du lave noget andet, skal du gå af job og holde fri. ' +
                    '\n\n**5.1** : Husk at køre i dit rigtige arbejds- køretøj. Er du pengetransportør, så kører du ikke i sportsvogn, etc.'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [arbejde_embed],
                ephemeral: true
            })
        } else if (value == 'opkald') {
            const opkald_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**OPKALD OG KOMMUNIKATION REGLER**' +
                    '\n\n**6.0** : Ved tilkald af læge, politi, taxi, advokat osv. så skal du beskrive hvad der sker, og ikke bare: “Kom her”, “Skynd jer” osv. Tænk over din henvendelse, og brug lidt tid på den.' +
                    '\n\n**6.1** : Det er ikke tilladt at bruge andre kommunikationskanaler udenfor spillet til meta-gaming. Vi henviser til in-game værktøjer såsom telefon eller radio.' +
                    '\n\n**6.2** : Det er tilladt at sidde i vores hygge-kanaler når man er in-game, så længe at der ikke tales om ting på serveren / i spillet. Henviser til regel §1.3'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [opkald_embed],
                ephemeral: true
            })

        } else if (value == 'bugs') {
            const bugs_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**BUGS, SNYD, HACKING, EXPLOITING REGLER**' +
                    '\n\n**7.0** : Det er givetvis ikke tilladt at hacke, exploite, modde eller på anden måde snyde. Dette resulterer i permanent ban uden varsel.' +
                    '\n\n**7.1** : Finder man bugs skal disse indberettes det øjeblikkeligt via ticket system. Misbruger man dette resulterer det i permanent ban uden varsel.'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [bugs_embed],
                ephemeral: true
            })

        } else if (value == 'grupperinger') {
            const grupperinger_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**GRUPPERINGER / BANDER REGLER**' +
                    '\n\n**8.0** : Man må max være 10 medlemmer i en gruppering/bande.' +
                    '\n\n**8.1** : Det er ikke tilladt for banderne at have en decideret klike. Dog er det tilladt at have et samarbejde mod/omkring et kortsigtet fællesmål.' +
                    '\n\nHusk! Vi opfordrer til RP fremfor mord og hævntogter.'

                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [grupperinger_embed],
                ephemeral: true
            })
        } else if (value == 'bandekrig') {
            const bandekrig_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**BANDEKRIG REGLER**' +
                    '\n*Disse regler er kun relevante hvis man er med i en godkendt bandekrig*' +
                    '\n\n**9.0** : Såfremt en gruppering ønsker at indgå i en krig med en anden bande, skal der oprettes en ansøgning på følgende måde: Opret en ticket på vores discord, hvori det kort beskrives hensigten med den oprettede ticket. Vedhæft et udfærdiget skriftligt dokument, hvor i grundlaget for jeres ønske om en krig klarlægges.' +
                    '\n\n**9.1** : En bandekrig kan foregå mellem to ELLER flere godkendte grupperinger. Grupperinger må ikke kæmpe på samme side (samme modstander) i en bandekrig med flere deltagere.' +
                    '\n\n**Grundlæggende**' +
                    '\n**9.2** : Såfremt en krig bliver godkendt af Staff eller projekt leder skal alle de involverede grupperinger gøres bekendt med at en officiel krig vil starte. Krigen er først officielt startet, når alle involverede grupperinger er underrettet af Staff eller projekt leder.' +
                    '\n\n**9.3** : En gruppering kan maximalt have 10 medvirkende spillere i krigen. (jf. regel 8.0)' +
                    '\n\n**9.4** : Det er kun whitelistede spillere til deltagende grupperinger, som kan deltage i en bandekrig.' +
                    '\n\n**9.5** : Spillere som ikke er whitelisted til en deltagende gruppering ved bandekrigens godkendelse, kan ikke deltage i krigen.' +
                    '\n\n**9.6** : Det er yderligere tilladt at have 3 spottere i krigen. Disse må IKKE ikke hjælpe til med midler (våben, penge, etc.)' +
                    '\n\n**Igangværende krige**' +
                    '\n*Under en godkendt krig er ALLE medlemmer fra de involverede grupperinger, spottere samt evt. frivilligt deltagende underlagt de pågældende regler:*' +
                    '\n\n**9.7** : Når en spiller bliver nedkæmpet (ved brug af våben), skal han/hun tage sit bandetøj af, således andre deltagere tydeligt kan se, at vedkommende ikke deltager aktivt i krigen længere.' +
                    '\n\n*Alle nedkæmpelser skal dokumenteres på video.*' +
                    '\n*Ejere/Bande ansvarlige kan afvise nedkæmpelser, således spilleren kan fortsætte i krigen.*' +
                    '\n*Såfremt en spiller bliver nedkæmpet og ikke "genoplivet" inden for 10 min, vil spilleren være ude af krigen, uanset hvordan scenariet fortsætter.*' +
                    '\n*Det er ikke tilladt at bringe en nedkæmpet modstander som gidsel til sit eget eller andres tilholdssted.*' +
                    '\n\n**9.8** : Såfremt en deltager i krigen har 3 efterfølgende dages inaktivitet, kan Ejere/Bande ansvarlige udlukke deltageren fra krigen.' +
                    '\n\n**9.9** : Under krigen skal grupperingens deltagere iføre sig synligt tøj med logo/navn eller andet tøj genkendeligt fra grupperingen. Dette gælder ikke spottere.' +
                    '\n\n**Afslutning af en krig/konflikt**' +
                    '\n\n**9.10** : En bandekrig kan afsluttes med godkendelse af Ejere/Bande ansvarlige på følgende vis:' +
                    '\n\n*Alle deltagere i en deltagende gruppering er nedkæmpet.*' +
                    '\n*Et af de deltagende grupperinger "kaster håndklædet i ringen".*' +
                    '\n*Der aftales en gensidig våbenhvile blandt de deltagende grupperinger.*' +
                    '\n\n**9.11** : Ejere/Bande ansvarlige kan til enhver tid afbryde en krig.'

                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [bandekrig_embed],
                ephemeral: true
            })
        } else if (value == 'røverier') {
            const røveri_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**RØVERI REGLER**' +
                    '\n\n**Bank- og butiksrøverier**' +
                    '\n\n**10.0** : Der må maks. være 4 kriminelle til et butiksrøveri.' +
                    '\n\n**10.1** : Der må gerne tages gidsler så længe at antallet bliver holdt på et realistisk niveau og gidsel bliver inddraget i scenariet.' +
                    '\n\n**10.2** : Sørg for at holde eventuelle forhandlingskrav rimelige. (Ingen betjent kan skaffe 1.000.000 i kontanter)' +
                    '\n\n**10.3** : Der må ikke skydes før der har været et forsøg på forhandlinger.' +
                    '\n\n**10.4** : Et røveri skal planlægges. Dvs. man røver ikke butikker/banker flere gange dagligt (røveri-streaks) - eller smutter fra området efter et netop startet røveri uden at færdiggøre det.' +
                    '\n\n**Røveri af andre spillere**' +
                    '\n\n**10.5** : Det er tilladt at røve andre spillere for de værdier de har på sig. Dog er det ikke tilladt at tvinge en spiller til at overdrage en bil eller et hjem.' +
                    '\n\n**10.6** : Det er kun tilladt at tvinge sig til indholdet af andre spilleres køretøjer, såfremt der har været forudgående RP med spilleren, og hvis køretøjet i forvejen er en naturlig del af scenariet.' +
                    '\n\n**10.7** : Det er ikke tilladt, at tvinge folk til at tage et køretøj ud af garagen, med mindre køretøjet er blevet parkeret få sekunder inden, ligesom køretøjet skal have været en naturlig del af scenariet '
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [røveri_embed],
                ephemeral: true
            })
        } else if (value == 'karakterdrab') {
            const karakterdrab_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**KARAKTERDRAB (CK) REGLER**' +
                    '\n\n**11.0** : Ens karakter kan ikke blive ck medmindre at man selv er indforstået med dette, dog med disse undtagelser:' +
                    '\n\n*Hvis du nægter genoplivning fra Beredskabet  eller Politi, så er det ens betydende med at din karakter bliver dræbt.*' +
                    '\n*Begår du selvmord ingame kan en ansat hos Beredskabet erklære dig død, og dermed også et karakterdrab.*' +
                    '\n\n**11.1** : Det er ikke tilladt at give eller gamble sine værdier væk inden karakterdrab eller efterfølgende at modtage dem på sin nye karakter.' +
                    '\n\n**11.3** : Ønsker du en anden spiller dræbt/CKet skal der oprettes en ansøgning til CK ansvarlige på følgende vis:' +
                    '\n\n*Opret en ticket på vores discord, hvori der kort beskrives meningen med denne ticket. Ydermere skal der vedhæftes et udarbejdet tekstdokument, hvori grundlaget for det ønskede CK tydeligt oplyses.*' +
                    '\n*Herefter vil l CK ansvarlige tage stilling til, hvorvidt ansøgningen er godkendt eller ej.*' +
                    '\n*Såfremt ansøgningen bliver godkendt, kan der udføres et drab på den ansøgte person.*' +
                    '\n*Det er et krav, at der omkring drabsscenariet skal have foregået RP mellem den dræbte og ansøgeren. (Et driveby skyderi vil f.eks. ikke blive godkendt som et CK)*' +
                    '\n*Der skal herefter fremsendes en videofil fra scenariet, hvori drabet tydeligt klarlægges.*' +
                    '\n*projekt leder og ck ansværlige kan til enhver tid afvise et CK.*' +
                    '\n\n*Ønsker man at få sin egen karakter dræbt, kan du ansøge om det under Vis Karakterer.*' +
                    '\n*Får du en ny karakter ved du naturligvis intet om hvad der er foregået i dit tidligere liv.*'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [karakterdrab_embed],
                ephemeral: true
            })
        } else if (value == 'handlinger') {
            const handlinger_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**HANDLINGER REGLER**' +
                    '\n\n**12.0** : Du skal bruge handlinger som passer bedst til den situation som du står i.' +
                    '\n\n**EKSEMPELVIS**' +
                    '\nArgumenter når du forhandler med NPCer' +
                    '\nPlant / Farm handling ved høst (svampe, valmuer etc.) når man er kriminel.'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [handlinger_embed],
                ephemeral: true
            })
        } else if (value == 'køb') {
            const køb_embed = new EmbedBuilder()
                .setTitle('__Sky Evolved- Regler__')
                .setDescription(
                    '**KØB & SALG (REAL MONEY TRADING)**' +
                    '\n\n**13.0** : Det er på ingen måde tilladt at handle med rigtige penge (eller andre ting af værdi) om ting inde i spillet. Dette strider også imod FiveMs egne Terms of Service.' +
                    '\nOpdages dette vil det resultere i permanent ban uden varsel.' +
                    '\n\n**13.1** : Forsøg på salg med rigtige penge (eller andre ting af værdi) straffes på samme måde som beskrevet i 13.0'
                )
                .setFooter({ text: 'Sky Evolved- Regler', iconURL: logo })
                .setColor('#0099ff')

            interaction.reply({
                embeds: [køb_embed],
                ephemeral: true
            })

        }
    }
})

// Modal Submits \\
client.on('modalSubmit', async (modal) => {
    // Ansøgninger \\
    if(modal.customId === 'politi_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om politi.`)
        const politi_navn = modal.getTextInputValue('politi_navn');
        const politi_hvorfor = modal.getTextInputValue('politi_hvorfor');
        const politi_vælgedig = modal.getTextInputValue('politi_vælgedig');
        const politi_erfaringer = modal.getTextInputValue('politi_erfaringer');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('__Politi Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Navn & Alder:** \n' + politi_navn + '\n\n' +
                '> **Hvorfor ansøger du?:** \n' + politi_hvorfor + '\n\n' +
                '> **Hvorfor skal vi vælge dig?:** \n' + politi_vælgedig + '\n\n' +
                '> **Hvad er dine erfaringer?:** \n' + politi_erfaringer + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`politi-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din politi ansøgning er blevet accepteret.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> politi ansøgningen.`)
            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din politi ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> afviste <@${modal.user.id}> politi ansøgningen.`)
            }
        })
    } else if (modal.customId == 'ems_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om EMS.`)
        const politi_navn = modal.getTextInputValue('ems_navn');
        const politi_hvorfor = modal.getTextInputValue('ems_hvorfor');
        const politi_vælgedig = modal.getTextInputValue('ems_vælgedig');
        const politi_erfaringer = modal.getTextInputValue('ems_erfaringer');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('__EMS Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Navn & Alder:** \n' + politi_navn + '\n\n' +
                '> **Hvorfor ansøger du?:** \n' + politi_hvorfor + '\n\n' +
                '> **Hvorfor skal vi vælge dig?:** \n' + politi_vælgedig + '\n\n' +
                '> **Hvad er dine erfaringer?:** \n' + politi_erfaringer + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`ems-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din EMS ansøgning er blevet accepteret.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> EMS ansøgning.`)
            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din EMS ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${modal.user.id}> afviste EMS ansøgningen.`)
            }
        })
    } else if (modal.customId == 'advokat_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om advokat.`)
        const politi_navn = modal.getTextInputValue('advokat_navn');
        const politi_hvorfor = modal.getTextInputValue('advokat_hvorfor');
        const politi_vælgedig = modal.getTextInputValue('advokat_vælgedig');
        const politi_erfaringer = modal.getTextInputValue('advokat_erfaringer');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('__Advokat Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Navn & Alder:** \n' + politi_navn + '\n\n' +
                '> **Hvorfor ansøger du?:** \n' + politi_hvorfor + '\n\n' +
                '> **Hvorfor skal vi vælge dig?:** \n' + politi_vælgedig + '\n\n' +
                '> **Hvad er dine erfaringer?:** \n' + politi_erfaringer + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`advokat-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din advokat ansøgning er blevet accepteret.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> advokat ansøgningen.`)
            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din advokat ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> politi ansøgningen.`)
            }
        })
    } else if (modal.customId == 'firma_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om at oprette et firma.`)
        const politi_navn = modal.getTextInputValue('firma_navn');
        const politi_hvorfor = modal.getTextInputValue('firma_om');
        const politi_vælgedig = modal.getTextInputValue('firma_lave');
        const politi_erfaringer = modal.getTextInputValue('firma_medarbejdere');
        const firma_rådighed = modal.getTextInputValue('firma_rådighed');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('Firma Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Navn & Alder:** \n' + politi_navn + '\n\n' +
                '> **Hvad skal dit firma hedde?:** \n' + politi_hvorfor + '\n\n' +
                '> **Hvad laver dit firma?:** \n' + politi_vælgedig + '\n\n' +
                '> **Liste af firmaets medarbejdere? [3+]:** \n' + politi_erfaringer + '\n\n' +
                '> **Hvad skal vi stille dit firma til rådighed?:** \n' + firma_rådighed + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`firma-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din firma ansøgning er blevet accepteret.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> firma ansøgning.`)
            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din firma ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> afviste <@${modal.user.id}> firma ansøgning.`)
            }
        })
    } else if (modal.customId == 'staff_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om staff.`)
        const politi_navn = modal.getTextInputValue('staff_navn');
        const politi_hvorfor = modal.getTextInputValue('staff_hvorfor');
        const politi_vælgedig = modal.getTextInputValue('staff_vælgedig');
        const politi_erfaringer = modal.getTextInputValue('staff_erfaringer');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('__Staff Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Navn & Alder:** \n' + politi_navn + '\n\n' +
                '> **Hvorfor ansøger du?:** \n' + politi_hvorfor + '\n\n' +
                '> **Hvorfor skal vi vælge dig?:** \n' + politi_vælgedig + '\n\n' +
                '> **Hvad er dine erfaringer?:** \n' + politi_erfaringer + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`staff-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din staff ansøgning er blevet accepteret.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> staff ansøgning.`)
            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din staff ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> afviste <@${modal.user.id}> staff ansøgning.`)
            }
        })
    } else if (modal.customId == 'betatester_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om beta tester.`)
        const politi_timer = modal.getTextInputValue('beta_timer');
        const politi_tit = modal.getTextInputValue('beta_tit');
        const politi_hvorfor = modal.getTextInputValue('beta_hvorfor');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('__Beta Tester Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Timer i FiveM [Inkl. Bevis]:** \n' + politi_timer + '\n\n' +
                '> **Hvor tit kan du være aktiv, som beta tester?:** \n' + politi_tit + '\n\n' +
                '> **Hvorfor vil du gerne være beta tester?:** \n' + politi_hvorfor + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`beta-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din beta tester ansøgning er blevet accepteret.\nEn besked vil blive sendt til <@249894737870454784>, vedr. en tid til samtale.\nDerefter vil du få en besked af botten, om du kan på det tidspunkt eller ej.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> beta tester ansøgning.`)

                // Besked til Odin \\
                const odinEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription(`<@${modal.user.id}> beta tester ansøgning er blevet accepteret.\nKlik nedenfor for at aftale en tid.`)
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                    .setTimestamp()

                const odinRow =  new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("aftalTid")
                            .setEmoji("⏰")
                            .setStyle("Success")
                            .setLabel("Aftal Tid"),
                    )

                const odinDM = await client.users.cache.get(Config.odin_id).createDM();
                const odinMessage = await odinDM.send({
                    embeds: [odinEmbed],
                    components: [odinRow],
                })
                log(`DM sendt til <@${Config.odin_id}>`)
                const user = client.users.cache.get(modal.user.id);
                const odinFilter = ( button ) => button.clicker;
                const odinCollector = odinMessage.createMessageComponentCollector(odinFilter, { time: 120000 });
                odinCollector.on('collect', async (button) => {
                    if (button.customId == 'aftalTid') {
                        const odinModal =  new Modal()
                            .setCustomId('beta_aftale')
                            .setTitle('Beta Tester Ansøgning')
                            .addComponents(
                                new TextInputComponent()
                                    .setCustomId('beta_aftaltDato')
                                    .setLabel('Dato [DD/MM]')
                                    .setStyle('SHORT')
                                    .setPlaceholder('Indtast dit svar.')
                                    .setRequired(true),
                                new TextInputComponent()
                                    .setCustomId('beta_aftaltTid')
                                    .setLabel('Klokken [HH:MM]')
                                    .setStyle('SHORT')
                                    .setPlaceholder('Indtast dit svar.')
                                    .setRequired(true),
                            )

                        discordModals.showModal(odinModal, {
                            client: client,
                            interaction: button,
                        })
                    }
                })
                client.on('modalSubmit', async (modal) => {
                    if(modal.customId === 'beta_aftale') {
                        const targetDM = await client.users.cache.get(user.id).createDM();
                        const odinDM = await client.users.cache.get(Config.odin_id).createDM();
                        const targetDato = modal.getTextInputValue('beta_aftaltDato');
                        const targetTid = modal.getTextInputValue('beta_aftaltTid');
                        const targetEmbed = new EmbedBuilder()
                            .setTitle('Sky Evolved- Ansøgninger')
                            .setDescription(`<@${user.id}> har lavet en tid til dig.\n> **Dato:** ${targetTid}\n> **Tid:** ${targetDato}\n\nHar du tid til en samtale på dette tidspunkt?`)
                            .setColor('#0099ff')
                            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                            .setTimestamp()

                        const targetRow =  new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("accept")
                                    .setEmoji("✔️")
                                    .setStyle("Success")
                                    .setLabel("Ja"),
                                new ButtonBuilder()
                                    .setCustomId("decline")
                                    .setEmoji("✖️")
                                    .setStyle("Danger")
                                    .setLabel("Nej"),
                            )

                        const targetMessage = await targetDM.send({
                            embeds: [targetEmbed],
                            components: [targetRow],
                        })
                        log(`DM sendt til <@${user.id}>`)

                        const replyMessage = new EmbedBuilder()
                            .setTitle('Sky Evolved- Ansøgninger')
                            .setDescription(`Satte Tidspunkt.\n> **Dato:** ${targetTid}\n> **Tid:** ${targetDato}`)
                            .setColor('#0099ff')
                            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                            .setTimestamp()

                        odinDM.send({
                            embeds: [replyMessage],
                        })

                        const targetFilter = ( button ) => button.clicker;
                        const targetCollector = targetMessage.createMessageComponentCollector(targetFilter, { time: 120000 });
                        targetCollector.on('collect', async (button) => {
                            if (button.customId == 'accept') {
                                const targetEmbed = new EmbedBuilder()
                                    .setTitle('Sky Evolved- Ansøgninger')
                                    .setDescription(`<@${user.id}> har tid til en samtale på det bestemte tidspunket.\n> **Dato:** ${targetTid}\n> **Tid:** ${targetDato}`)
                                    .setColor('#0099ff')
                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                    .setTimestamp()

                                const embed = new EmbedBuilder()
                                    .setTitle('Sky Evolved- Ansøgninger')
                                    .setDescription(`Sender besked til <@${Config.odin_id}>`)
                                    .setColor('#0099ff')
                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                    .setTimestamp()

                                button.reply({
                                    embeds: [embed],
                                    ephemeral: true
                                })

                                odinDM.send({
                                    embeds: [targetEmbed],
                                })
                            } else if (button.customId == 'decline') {
                                const targetModal =  new Modal()
                                    .setCustomId('beta_decline')
                                    .setTitle('Forslå ny Tidspunkt')
                                    .addComponents(
                                        new TextInputComponent()
                                            .setCustomId('beta_aftaltDato')
                                            .setLabel('Dato [DD/MM]')
                                            .setStyle('SHORT')
                                            .setPlaceholder('Indtast dit svar.')
                                            .setRequired(true),
                                        new TextInputComponent()
                                            .setCustomId('beta_aftaltTid')
                                            .setLabel('Klokken [HH:MM]')
                                            .setStyle('SHORT')
                                            .setPlaceholder('Indtast dit svar.')
                                            .setRequired(true),
                                    )
                                discordModals.showModal(targetModal, {
                                    client: client,
                                    interaction: button,
                                })

                                client.on('modalSubmit', async (modal) => {
                                    if (modal.customId == 'beta_decline') {
                                        const targetInput = modal.getTextInputValue('beta_aftaltDato');
                                        const targetInput2 = modal.getTextInputValue('beta_aftaltTid');
                                        const odinEmbed = new EmbedBuilder()
                                            .setTitle('Sky Evolved- Ansøgninger')
                                            .setDescription(`<@${user.id}> har ikke tid til en samtale på det bestemte tidspunkt.\nPersonen har forslået et nyt tidspunkt.\n> **Dato:** ${targetInput}\n> **Tid:** ${targetInput2}\n\nHar du tid til en samtale på dette tidspunkt?`)
                                            .setColor('#0099ff')
                                            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                            .setTimestamp()
                                        const row =  new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId("accept")
                                                    .setEmoji("✔️")
                                                    .setStyle("Success")
                                                    .setLabel("Ja"),
                                                new ButtonBuilder()
                                                    .setCustomId("decline")
                                                    .setEmoji("✖️")
                                                    .setStyle("Danger")
                                                    .setLabel("Opret Ticket"),
                                            )
                                        const odinMessage = await odinDM.send({
                                            embeds: [odinEmbed],
                                            components: [row],
                                        })

                                        const embed = new EmbedBuilder()
                                            .setTitle('Sky Evolved- Ansøgninger')
                                            .setDescription(`Sender besked til <@${Config.odin_id}>`)
                                            .setColor('#0099ff')
                                            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                            .setTimestamp()

                                        targetDM.send({
                                            embeds: [embed],
                                            ephemeral: true
                                        })

                                        const odinFilter = ( button ) => button.clicker;
                                        const odinCollector = odinMessage.createMessageComponentCollector(odinFilter, { time: 120000 });
                                        odinCollector.on('collect', async (button) => {
                                            if (button.customId == 'accept') {
                                                const targetEmbed = new EmbedBuilder()
                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                    .setDescription(`<@${Config.odin_id}> har tid til en samtale på det bestemte tidspunket.`)
                                                    .setColor('#0099ff')
                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                    .setTimestamp()

                                                const odinEmbed = new EmbedBuilder()
                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                    .setDescription(`Sender besked til <@${user.id}>`)
                                                    .setColor('#0099ff')
                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                    .setTimestamp()

                                                targetDM.send({
                                                    embeds: [targetEmbed],
                                                })
                                                odinDM.send({
                                                    embeds: [odinEmbed],
                                                })
                                            } else if (button.customId == 'decline') {
                                                // make new channel in specific guild
                                                const guild = client.guilds.cache.get(Config.guild);
                                                const subchannel = await guild.channels.create(`${user.username}-aftaltid`);
                                                // get the subchannel
                                                const subchannel2 = guild.channels.cache.get(subchannel.id);
                                                const everyone = guild.roles.cache.find(role => role.name === '@everyone');

                                                const odinEmbed = new EmbedBuilder()
                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                    .setDescription(`Der er nu blevet opret en ticket (<#${subchannel.id}>), så i kan finde et tidspunkt, der passer jer bedst.`)
                                                    .setColor('#0099ff')
                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                    .setTimestamp()

                                                odinDM.send({
                                                    embeds: [odinEmbed],
                                                })

                                                targetDM.send({
                                                    embeds: [odinEmbed],
                                                })

                                                subchannel.permissionOverwrites.create(everyone, {
                                                    VIEW_CHANNEL: false,
                                                    SEND_MESSAGES: false,
                                                });

                                                subchannel.permissionOverwrites.create(user, { // Rettigheder for alle.
                                                    VIEW_CHANNEL: true,
                                                    SEND_MESSAGES: true,
                                                });

                                                const channelEmbed = new EmbedBuilder()
                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                    .setDescription('Her kan i beslutte, hvad for et tidspunkt der passer jer begge bedst.\nNår i er færdige, skal der bare trykkes på knappen nedenfor, og skrive tidspunket.')
                                                    .setColor('#0099ff')
                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                    .setTimestamp()

                                                const subChannelRow =  new ActionRowBuilder()
                                                    .addComponents(
                                                        new ButtonBuilder()
                                                            .setCustomId("færdig")
                                                            .setEmoji("✔️")
                                                            .setStyle("Success")
                                                            .setLabel("Færdig"),
                                                    )

                                                const subChannelMessage = await subchannel2.send({
                                                    embeds: [channelEmbed],
                                                    components: [subChannelRow],
                                                    content: `> **__<@${user.id}> • <@${Config.odin_id}>__**`
                                                })

                                                const subChannelFilter = ( button ) => button.clicker;
                                                const subChannelCollector = subChannelMessage.createMessageComponentCollector(subChannelFilter, { time: 120000 });
                                                subChannelCollector.on('collect', async (button) => {
                                                    if (button.customId == 'færdig') {
                                                        const subChannelModal =  new Modal()
                                                            .setCustomId('beta_færdig')
                                                            .setTitle('Forslå ny Tidspunkt')
                                                            .addComponents(
                                                                new TextInputComponent()
                                                                    .setCustomId('beta_aftaltDato')
                                                                    .setLabel('Dato [DD/MM]')
                                                                    .setStyle('SHORT')
                                                                    .setPlaceholder('Indtast dit svar.')
                                                                    .setRequired(true),
                                                                new TextInputComponent()
                                                                    .setCustomId('beta_aftaltTid')
                                                                    .setLabel('Klokken [HH:MM]')
                                                                    .setStyle('SHORT')
                                                                    .setPlaceholder('Indtast dit svar.')
                                                                    .setRequired(true),
                                                            )

                                                        discordModals.showModal(subChannelModal, {
                                                            client: client,
                                                            interaction: button,
                                                        })

                                                        client.on('modalSubmit', async (modal) => {
                                                            if (modal.customId == 'beta_færdig') {
                                                                const targetDato = modal.getTextInputValue('beta_aftaltDato');
                                                                const targetTid = modal.getTextInputValue('beta_aftaltTid');
                                                                const targetEmbed = new EmbedBuilder()
                                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                                    .setDescription(`Der er nu blevet aftalt et tidspunkt.\n> **Dato**: ${targetDato}\n> **Tid:** ${targetTid}`)
                                                                    .setColor('#0099ff')
                                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                                    .setTimestamp()

                                                                const odinEmbed = new EmbedBuilder()
                                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                                    .setDescription(`Du har nu aftalt en tid med <@${user.id}>.\n> **Dato:** ${targetDato}\n> **Tid:** ${targetTid}`)
                                                                    .setColor('#0099ff')
                                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                                    .setTimestamp()

                                                                const embed = new EmbedBuilder()
                                                                    .setTitle('Sky Evolved- Ansøgninger')
                                                                    .setDescription(`Der er nu blevet aftalt et tidspunkt.\n> **Dato:** ${targetDato}\n> **Tid:** ${targetTid}\n\n*Kanalen vil blive slettet om 5 sekunder.*`)
                                                                    .setColor('#0099ff')
                                                                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })
                                                                    .setTimestamp()

                                                                subchannel2.send({
                                                                    embeds: [embed],
                                                                })
                                                                targetDM.send({
                                                                    embeds: [targetEmbed],
                                                                })
                                                                odinDM.send({
                                                                    embeds: [odinEmbed],
                                                                })

                                                                setTimeout(() => {
                                                                    subchannel2.delete();
                                                                }, 5000)
                                                            }
                                                        })

                                                    }
                                                })
                                            }
                                        })

                                    }
                                })

                            }
                        })
                    }
                })

            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din beta tester ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> afviste <@${modal.user.id}> beta tester ansøgning.`)
            }
        })
    } else if (modal.customId == 'whitelistmodtager_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om at blive whitelist modtager.`)
        const politi_navn = modal.getTextInputValue('whitelistmodtager_navn');
        const politi_hvorfor = modal.getTextInputValue('whitelistmodtager_hvorfor');
        const politi_vælgedig = modal.getTextInputValue('whitelistmodtager_vælgedig');
        const channel = client.channels.cache.get(Config.ansøgning_channel);

        const embed = new EmbedBuilder()
            .setTitle('__Whitelist Modtager Ansøgning__')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor*\n\n' +
                '> **Indsendt af:** \n<@' + modal.user.id  +'>\n\n' +
                '> **Navn & Alder:** \n' + politi_navn + '\n\n' +
                '> **Hvorfor ansøger du?:** \n' + politi_hvorfor + '\n\n' +
                '> **Hvorfor skal vi vælge dig?:** \n' + politi_vælgedig + '\n\n'
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Ansøgninger')
            .setDescription('Din ansøgning er nu blevet sendt, til de ansvarlige for ansøgningerne.\nDen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        const subChannel = await channel.guild.channels.create(`wm-${modal.user.username}`);
        subChannel.setParent(Config.ansøgning_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        modal.reply({
            embeds: [replyEmbed],
            ephemeral: true,
        })

        const message = await subChannel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din whitelist modtager ansøgning er blevet accepteret.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> whitelist modtager ansøgning.`)
            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Ansøgninger')
                    .setDescription('Din whitelist modtager ansøgning er blevet afvist.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Ansøgninger', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> afviste <@${modal.user.id}> whitelist modtager ansøgning.`)
            }
        })
    } else if (modal.customId == 'whitelist_ansøgning') {
        log(`<@${modal.user.id}> har ansøgt om whitelist.`)
        const channel = client.channels.cache.get(Config.whitelist_channel);
        const whitelist_karakter = modal.getTextInputValue('whitelist_karakter');
        const whitelist_hvorfor = modal.getTextInputValue('whitelist_hvorfor');
        const whitelist_lave = modal.getTextInputValue('whitelist_lave');
        const whitelist_steam = modal.getTextInputValue('whitelist_steam');
        const embed = new EmbedBuilder()
            .setTitle('Sky Evolved- Whitelist')
            .setDescription('Din whitelist ansøgning er nu blevet sendt til whitelist modtager teamet.\nWhitelist ansøgningen vil blive svaret på snarest.')
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

        const infoEmbed = new EmbedBuilder()
            .setTitle('Sky Evolved- Whitelist')
            .setDescription(
                '*Denne ansøgning kan besvares nedenfor.*\n\n' +
                '> **Indsendt af**\n' + `<@${modal.user.id}>\n\n` +
                '> **Information om karakter [Navn, Baggrund, etc]**\n' + `${whitelist_karakter}\n\n` +
                '> **Hvorfor vil du gerne spille på Sky Evolved?**\n' + `${whitelist_hvorfor}\n\n` +
                '> **Hvad regner du med at lave på Sky Evolved?**\n' + `${whitelist_lave}\n\n` +
                '> **Link til din steam profil?**\n' + `${whitelist_steam}`
            )
            .setColor('#0099ff')
            .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

        const row =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("✔️")
                    .setStyle("Success")
                    .setLabel("Accepter"),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setEmoji("✖️")
                    .setStyle("Danger")
                    .setLabel("Afvis")
            );

        modal.reply({
            embeds: [embed],
            ephemeral: true,
        })

        const subChannel = await channel.guild.channels.create(`${modal.user.username}`);
        subChannel.setParent(Config.whitelist_category);
        log(`Subchannel ${subChannel.name} oprettet.`)

        const message = await subChannel.send({
            embeds: [infoEmbed],
            components: [row]
        })

        const filter = ( button ) => button.clicker;
        const collector = message.createMessageComponentCollector(filter, { time: 120000 });

        collector.on('collect', async (button) => {
            if (button.customId == 'accept') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Whitelist')
                    .setDescription('Accepterede ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Whitelist')
                    .setDescription('Din whitelist ansøgning er blevet accepteret.\nLæs <#998663798242152538> for yderligere information.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                var guild = client.guilds.cache.get(Config.guild)
                const member = await guild.members.fetch(modal.user.id)
                const role = await guild.roles.fetch(Config.whitelist_afventerRole)
                member.roles.add(role)
                log(`<@${modal.user.id}> fik rollen <@&${role.id}>`)

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> accepterede <@${modal.user.id}> whitelist ansøgning.`)

            } else if (button.customId == 'decline') {
                const embed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Whitelist')
                    .setDescription('Afviste ansøgningen, og sender DM til ansøgeren.\nKanalen vil blive slettet om 5 sekunder.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })
                const dmEmbed = new EmbedBuilder()
                    .setTitle('Sky Evolved- Whitelist')
                    .setDescription('Din whitelist ansøgning er blevet afvist.\nLæs <#998663798242152538> for yderligere information.')
                    .setColor('#0099ff')
                    .setFooter({ text: 'Sky Evolved- Whitelist', iconURL: logo })

                subChannel.send({
                    embeds: [embed],
                })

                if (Config.dms == true) {
                    const dm = await modal.user.createDM();
                    dm.send({
                        embeds: [dmEmbed],
                    })
                    log(`DM sendt til <@${modal.user.id}>`)
                }

                setTimeout(() => {
                    subChannel.delete();
                    log(`Subchannel ${subChannel.name} slettet.`)
                }, 5000)
                log(`<@${button.user.id}> afviste <@${modal.user.id}> whitelist ansøgning.`)
            }
        })
    }
});
// Youtube Ready \\
youtube.on("ready", (ready) => {
    youtube.subscribe(Config.youtube_id);
    console.log("Youtube connected at: ", ready);
});

// Error Handler \\
client.on("error", (error) => {
    try {
        log(`**ERROR RECIEVED**\n\n**${err.name}**: ${err.message}`, 'error');
        console.log(error);
    } catch (err) {
        console.log(err);
        log(`**ERROR RECIEVED**\n\n**${err.name}**: ${err.message}`, 'error');
    }
})

// Startup \\
client.on('ready', () => {
    console.log(`Logget ind som ${client.user.tag}`)
    autoStatus();
    log(`Logget ind som ${client.user.tag}`)

    const guild = client.guilds.cache.get(Config.guildID);
    let commands

    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    // Commands \\
    commands?.create({
        name: 'ping',
        description: 'Ping Command ⚙️.',
    })

    commands?.create({
        name: 'faq',
        description: 'Opretter FAQ system. DEV ONLY.',
    })

    commands?.create({
        name: 'pingcreate',
        description: 'Opretter valgfri ping rolle. DEV ONLY.',
    })

    commands?.create({
        name: 'ticketcreate',
        description: 'Opretter ticket system. DEV ONLY.',
    })

    commands?.create({
        name: 'ticketadd',
        description: 'Tilføjer en bruger til en ticket. STAFF ONLY.',
        options: [
            {
                name: 'user',
                description: 'Brugeren',
                type: 6,
                required: true,
            }
        ]
    })

    commands?.create({
        name: 'ticketremove',
        description: 'Fjerner en bruger fra en ticket. STAFF ONLY.',
        options: [
            {
                name: 'user',
                description: 'Brugeren',
                type: 6,
                required: true,
            }
        ]
    })

    commands?.create({
        name: 'ansøgcreate',
        description: 'Opretter ansøgningerne. DEV ONLY.',
    })

    commands?.create({
        name: 'whitelistcreate',
        description: 'Opretter whitelist ansøgningerne. DEV ONLY.',
    })

    commands?.create({
        name: 'ansøg',
        description: 'Ansøg om whitelist.',
    })

    commands?.create({
        name: 'test',
        description: 'Test Command ⚙️.',
    })

    commands?.create({
        name: 'clear',
        description: 'Sletter et bestemt antal beskeder. STAFF ONLY.',
        options: [
            {
                name: 'amount',
                description: 'Antal beskeder der skal fjernes.',
                type: 4,
                required: true,
            },
        ]
    })

    commands?.create({
        name: 'whitelistadd',
        description: 'Tilføjer whitelist til en bruger. STAFF ONLY.',
        options: [
            {
                name: 'user',
                description: 'Brugeren',
                type: 6,
                required: true,
            }
        ]
    })

    commands?.create({
        name: 'whitelistremove',
        description: 'Fjerner whitelist fra en bruger. STAFF ONLY.',
        options: [
            {
                name: 'user',
                description: 'Brugeren',
                type: 6,
                required: true,
            }
        ]
    })

    commands?.create({
        name: 'serverdrift',
        description: 'Tjekker serverens drift. DEV ONLY.',
    })

    commands?.create({
        name: 'reglercreate',
        description: 'Opretter reglerne. DEV ONLY.',
    })

    log('Loadede alle kommandoer.')
    kontrolPanel()
    log('Loading kontrolpanel...')
    startSystems()
    log('Starter systemer...')
})

// Login \\
client.login(Keys.token);