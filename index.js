const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");

const plugins = new Map();

// Load plugins
const pluginDir = path.join(__dirname, "plugins");

if (fs.existsSync(pluginDir)) {
    fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith(".js")) {
            const plugin = require(path.join(pluginDir, file));
            plugins.set(plugin.name, plugin);

            if (plugin.aliases) {
                plugin.aliases.forEach(alias => plugins.set(alias, plugin));
            }
        }
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message || msg.key.fromMe) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        const prefix = "/";
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        const plugin = plugins.get(command);

        if (plugin) {
            try {
                await plugin.execute(sock, msg, args);
            } catch (err) {
                console.error(err);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "❌ Error executing command."
                });
            }
        }
    });

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                startBot();
            } else {
                console.log("Logged out.");
            }
        } else if (connection === "open") {
            console.log("✅ DENOO XMD connected successfully.");
        }
    });
}

startBot();