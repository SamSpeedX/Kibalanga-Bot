require("dotenv").config();
const sessionName = "session";
const express = require("express");
const moment = require("moment-timezone");
const app = express();
const port = 3000;
const owner = [255778760701];

const {
  default: goutamConnect,
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  downloadMediaMessage,
  proto,
  getContentType,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const axios = require("axios");
const qrcode = require("qrcode");
const chalk = require("chalk");
const chalkAnimation = require("chalk-animation");
const gradient = require("gradient-string");
const figlet = require("figlet");
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};
async function Welcome() {
  let load = "Generating QR Code Please Wait...";
  let title = chalkAnimation.rainbow(load);
  setInterval(() => {
    title.replace((load += "."));
  }, 1000);
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

  title.stop();
}

function typeWriter(text, speed) {
  return new Promise((resolve) => {
    let i = 0;

    function type() {
      if (i < text.length) {
        process.stdout.write(text.charAt(i));
        i++;
        setTimeout(type, speed);
      } else {
        console.log(); // To add a newline after typing
        resolve(); // Resolve the promise when typing is done
      }
    }

    type();
  });
}
function smsg(conn, m, store) {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = conn.decodeJid(
      (m.fromMe && conn.user.id) ||
        m.participant ||
        m.key.participant ||
        m.chat ||
        ""
    );
    if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || "";
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg =
      m.mtype == "viewOnceMessage"
        ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
        : m.message[m.mtype];
    m.body =
      m.message.conversation ||
      m.msg.caption ||
      m.msg.text ||
      (m.mtype == "listResponseMessage" &&
        m.msg.singleSelectReply.selectedRowId) ||
      (m.mtype == "buttonsResponseMessage" && m.msg.selectedButtonId) ||
      (m.mtype == "viewOnceMessage" && m.msg.caption) ||
      m.text;
    let quoted = (m.quoted = m.msg.contextInfo
      ? m.msg.contextInfo.quotedMessage
      : null);
    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
    if (m.quoted) {
      let type = getContentType(quoted);
      m.quoted = m.quoted[type];
      if (["productMessage"].includes(type)) {
        type = getContentType(m.quoted);
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === "string")
        m.quoted = {
          text: m.quoted,
        };
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id
        ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
        : false;
      m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
      m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        m.quoted.selectedDisplayText ||
        m.quoted.title ||
        "";
      m.quoted.mentionedJid = m.msg.contextInfo
        ? m.msg.contextInfo.mentionedJid
        : [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        let q = await store.loadMessage(m.chat, m.quoted.id, conn);
        return exports.smsg(conn, q, store);
      };
      let vM = (m.quoted.fakeObj = M.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
        },
        message: quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {}),
      }));

      /**
       *
       * @returns
       */
      m.quoted.delete = () =>
        conn.sendMessage(m.quoted.chat, { delete: vM.key });

      /**
       *
       * @param {*} jid
       * @param {*} forceForward
       * @param {*} options
       * @returns
       */
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
        conn.copyNForward(jid, vM, forceForward, options);

      /**
       *
       * @returns
       */
      m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
    }
  }
  if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
  m.text =
    m.msg.text ||
    m.msg.caption ||
    m.message.conversation ||
    m.msg.contentText ||
    m.msg.selectedDisplayText ||
    m.msg.title ||
    "";
  /**
   * Reply to this message
   * @param {String|Object} text
   * @param {String|false} chatId
   * @param {Object} options
   */
  m.reply = (text, chatId = m.chat, options = {}) =>
    Buffer.isBuffer(text)
      ? conn.sendMedia(chatId, text, "file", "", m, { ...options })
      : conn.sendText(chatId, text, m, { ...options });
  /**
   * Copy this message
   */
  m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));

  /**
   *
   * @param {*} jid
   * @param {*} forceForward
   * @param {*} options
   * @returns
   */
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
    conn.copyNForward(jid, m, forceForward, options);

  return m;
}

async function startHisoka() {
  const { state, saveCreds } = await useMultiFileAuthState(
    `./${sessionName ? sessionName : "session"}`
  );
  const { version, isLatest } = await fetchLatestBaileysVersion();
  (async () => {
    await typeWriter(color("CODED BY SAM-OCHU", "hotpink"), 100);
    await typeWriter(
      color(`using WA v${version.join(".")}, isLatest: ${isLatest}`, "lime"),
      100
    );
    await typeWriter(gradient.rainbow(figlet.textSync("Kibalanga-Bot"), 100));
    await Welcome();
    const client = goutamConnect({
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      // can use Windows, Ubuntu here too
      browser: Browsers.macOS("Desktop"),
      syncFullHistory: true,
      auth: state,
    });

    store.bind(client.ev);

    client.ev.on("messages.upsert", async (chatUpdate) => {
      //console.log(JSON.stringify(chatUpdate, undefined, 2))
      try {
        mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message =
          Object.keys(mek.message)[0] === "ephemeralMessage"
            ? mek.message.ephemeralMessage.message
            : mek.message;
        if (mek.key && mek.key.remoteJid === "status@broadcast") return;
        if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify")
          return;
        if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
        m = smsg(client, mek, store);
        require("./bot")(client, m, chatUpdate, store);
      } catch (err) {
        console.log(err);
      }
    });

    // Handle error
    const unhandledRejections = new Map();
    process.on("unhandledRejection", (reason, promise) => {
      unhandledRejections.set(promise, reason);
      console.log("Unhandled Rejection at:", promise, "reason:", reason);
    });
    process.on("rejectionHandled", (promise) => {
      unhandledRejections.delete(promise);
    });
    process.on("Something went wrong", function (err) {
      console.log("Caught exception: ", err);
    });

    // Setting
    client.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (
          (decode.user && decode.server && decode.user + "@" + decode.server) ||
          jid
        );
      } else return jid;
    };

    client.ev.on("contacts.update", (update) => {
      for (let contact of update) {
        let id = client.decodeJid(contact.id);
        if (store && store.contacts)
          store.contacts[id] = { id, name: contact.notify };
      }
    });

    client.getName = (jid, withoutContact = false) => {
      id = client.decodeJid(jid);
      withoutContact = client.withoutContact || withoutContact;
      let v;
      if (id.endsWith("@g.us"))
        return new Promise(async (resolve) => {
          v = store.contacts[id] || {};
          if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
          resolve(
            v.name ||
              v.subject ||
              PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
                "international"
              )
          );
        });
      else
        v =
          id === "0@s.whatsapp.net"
            ? {
                id,
                name: "WhatsApp",
              }
            : id === client.decodeJid(client.user.id)
            ? client.user
            : store.contacts[id] || {};
      return (
        (withoutContact ? "" : v.name) ||
        v.subject ||
        v.verifiedName ||
        PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
          "international"
        )
      );
    };

    client.setStatus = (status) => {
      client.query({
        tag: "iq",
        attrs: {
          to: "@s.whatsapp.net",
          type: "set",
          xmlns: "status",
        },
        content: [
          {
            tag: "status",
            attrs: {},
            content: Buffer.from(status, "utf-8"),
          },
        ],
      });
      return status;
    };

    client.public = true;

    client.serializeM = (m) => smsg(client, m, store);
    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`);
          process.exit();
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Connection closed, reconnecting....");
          startHisoka();
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost from Server, reconnecting...");
          startHisoka();
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log(
            "Connection Replaced, Another New Session Opened, Please Restart Bot"
          );
          process.exit();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(
            `Device Logged Out, Please Delete Folder Session and Scan Again.`
          );
          process.exit();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Restart Required, Restarting...");
          startHisoka();
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...");
          startHisoka();
        } else {
          console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
          startHisoka();
        }
      }
      if (qr) {
        QR_GENERATE = qr;
      } else if (connection === "open") {
        console.log(color("Bot success conneted to server", "green"));
        console.log(color("Follow: on GitHub: @SAM-OCHU", "yellow"));
        console.log(color("Type /menu to see menu"));

        async function setBio() {
          let status =
            "📆 " +
            moment.tz("Afrika/Dodoma").format("DD/MM/YYYY") +
            " ⌚ " +
            moment.tz("Afrika/Dodoma").format("HH:mm:ss") +
            " SAM-OCHU " +
            " Runtime: " +
            Math.floor(process.uptime() / 3600) +
            "h " +
            Math.floor((process.uptime() % 3600) / 60) +
            "m " +
            Math.floor(process.uptime() % 60) +
            "s ";

          if (process.env.AUTO_ABOUT || "true" === "true") {
            await client.updateProfileStatus(status);
            return "Done";
          }
        }

        await client.sendMessage(client.user.id, {
          text: `*Bot Secsessfully Connected to Server*`,
        });
        setInterval(setBio, 10000);
      }
      // console.log('Connected...', update)
    });

    client.ev.on("creds.update", saveCreds);

    const getBuffer = async (url, options) => {
      try {
        options ? options : {};
        const res = await axios({
          method: "get",
          url,
          headers: {
            DNT: 1,
            "Upgrade-Insecure-Request": 1,
          },
          ...options,
          responseType: "arraybuffer",
        });
        return res.data;
      } catch (err) {
        return err;
      }
    };
     
    client.ev.on('contacts.update', update => {
      for (let contact of update) {
         let id = client.decodeJid(contact.id)
         if (store && store.contacts) store.contacts[id] = {
            id,
            name: contact.notify
         }
      }
   })

   client.ev.on('group-participants.update', async (room) => {
      let meta = await (await client.groupMetadata(room.id))
      let member = room.participants[0]
      let text_welcome = `Thanks +tag for joining into +grup group.\n`   
      let text_left = `+tag left from this group for no apparent reason.`
      let groupSet = global.db.groups.find(v => v.jid == room.id)
      try {
         pic = await Func.fetchBuffer(await client.profilePictureUrl(member, 'image'))
      } catch {
         pic = await Func.fetchBuffer(await client.profilePictureUrl(room.id, 'image'))
      }
      if (room.action == 'add') {
         if (groupSet.localonly) {
            if (global.db.users.some(v => v.jid == member) && !global.db.users.find(v => v.jid == member).whitelist && !member.startsWith('255') || !member.startsWith('91')) {
               client.reply(room.id, Func.texted('bold', `Sorry @${member.split`@`[0]}, this group is only for TANZANIA and INDIANI people and you will removed automatically.`))
               client.updateBlockStatus(member, 'block')
               return await Func.delay(2000).then(() => client.groupParticipantsUpdate(room.id, [member], 'remove'))
            }
         }
         let txt = (groupSet.text_welcome != '' ? groupSet.text_welcome : text_welcome).replace('+tag', `@${member.split`@`[0]}`).replace('+grup', `${meta.subject}`)
         if (groupSet.welcome) client.sendMessageModify(room.id, txt, null, {
            largeThumb: true,
            thumbnail: pic,
            url: global.db.setting.link
         })
         return driphunny = fs.readFileSync('./media/audio/welcome.mp3')
      } else if (room.action == 'remove') {
         let txt = (groupSet.text_left != '' ? groupSet.text_left : text_left).replace('+tag', `@${member.split`@`[0]}`).replace('+grup', `${meta.subject}`)
         return driphunny = fs.readFileSync('./media/audio/leave.mp3')
         if (groupSet.left) client.sendMessageModify(room.id, txt, null, {
            largeThumb: true,
            thumbnail: pic,
            url: global.db.setting.link
         })
      }
   })
    
    client.sendImage = async (
      jid,
      path,
      caption = "",
      quoted = "",
      options
    ) => {
      let buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
        ? await await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);
      return await client.sendMessage(
        jid,
        { image: buffer, caption: caption, ...options },
        { quoted }
      );
    };

    client.sendText = (jid, text, quoted = "", options) =>
      client.sendMessage(jid, { text: text, ...options }, { quoted });

    client.cMod = (
      jid,
      copy,
      text = "",
      sender = client.user.id,
      options = {}
    ) => {
      //let copy = message.toJSON()
      let mtype = Object.keys(copy.message)[0];
      let isEphemeral = mtype === "ephemeralMessage";
      if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
      }
      let msg = isEphemeral
        ? copy.message.ephemeralMessage.message
        : copy.message;
      let content = msg[mtype];
      if (typeof content === "string") msg[mtype] = text || content;
      else if (content.caption) content.caption = text || content.caption;
      else if (content.text) content.text = text || content.text;
      if (typeof content !== "string")
        msg[mtype] = {
          ...content,
          ...options,
        };
      if (copy.key.participant)
        sender = copy.key.participant = sender || copy.key.participant;
      else if (copy.key.participant)
        sender = copy.key.participant = sender || copy.key.participant;
      if (copy.key.remoteJid.includes("@s.whatsapp.net"))
        sender = sender || copy.key.remoteJid;
      else if (copy.key.remoteJid.includes("@broadcast"))
        sender = sender || copy.key.remoteJid;
      copy.key.remoteJid = jid;
      copy.key.fromMe = sender === client.user.id;

      return proto.WebMessageInfo.fromObject(copy);
    };

    return client;
  })();
}

startHisoka();

app.get("/", async (req, res) => {
  res.setHeader("content-type", "image/png");
  res.send(await qrcode.toBuffer(QR_GENERATE));
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
