require("dotenv").config();
const sessionName = "session";
const express = require("express");
const moment = require("moment-timezone");
const path = require('path');
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
          fs.rmdirSync(`./${sessionName ? sessionName : "session"}`, {
            recursive: true,
          });
          console.log("Device Logged Out, Please Scan Again And Run.");
          startHisoka()
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

// app.get("/", async (req, res) => {
//   res.setHeader("content-type", "image/png");
//   // res.send(await qrcode.toBuffer(QR_GENERATE));
//   if (typeof QR_GENERATE === "string") {
//     // res.send(
//     //   await qrcode.toBuffer(QR_GENERATE, {
//     //     scale: 8,
//     //   })
//     // );
//     setTimeout( async() => {
//       res.send(
//         await qrcode.toBuffer(QR_GENERATE, {
//           scale: 8,
//         })
//       );
//     }, 3000)
//   } else {
//     setTimeout( async() => {
//       res.sendFile("./media/image/qr.jpg", { root: __dirname });
//     }, 3000)
//   }
// });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

app.get("/qr", async (req, res) => {
  try {
    if (typeof QR_GENERATE === "string") {
      const qrBuffer = await qrcode.toBuffer(QR_GENERATE, { scale: 8 });
      res.type("png");
      res.send(qrBuffer);
    } else {
      res.sendFile("./media/image/qr.jpg", { root: __dirname });
    }
  } catch (err) {
    res.status(500).send("QR generation error");
  }
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




























// require("dotenv").config();
// const express = require("express");
// const moment = require("moment-timezone");
// const app = express();
// const port = 3000;
// const owner = [255778760701];

// const {
//   default: goutamConnect,
//   useMultiFileAuthState,
//   Browsers,
//   DisconnectReason,
//   fetchLatestBaileysVersion,
//   makeInMemoryStore,
//   jidDecode,
//   downloadMediaMessage,
//   proto,
//   getContentType,
// } = require("@whiskeysockets/baileys");
// const pino = require("pino");
// const { Boom } = require("@hapi/boom");
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");
// const qrcode = require("qrcode");
// const chalk = require("chalk");
// const chalkAnimation = require("chalk-animation");
// const gradient = require("gradient-string");
// const figlet = require("figlet");
// const _ = require("lodash");
// const PhoneNumber = require("awesome-phonenumber");

// const color = (text, color) => {
//   return !color ? chalk.green(text) : chalk.keyword(color)(text);
// };

// async function Welcome(sessionName) {
//   let load = `Generating QR Code for ${sessionName} Please Wait...`;
//   let title = chalkAnimation.rainbow(load);
//   setInterval(() => {
//     title.replace((load += "."));
//   }, 1000);
//   await new Promise((resolve) => {
//     setTimeout(resolve, 5000);
//   });

//   title.stop();
// }

// function typeWriter(text, speed) {
//   return new Promise((resolve) => {
//     let i = 0;

//     function type() {
//       if (i < text.length) {
//         process.stdout.write(text.charAt(i));
//         i++;
//         setTimeout(type, speed);
//       } else {
//         console.log(); // To add a newline after typing
//         resolve(); // Resolve the promise when typing is done
//       }
//     }

//     type();
//   });
// }

// function smsg(conn, m, store) {
//   if (!m) return m;
//   let M = proto.WebMessageInfo;
//   if (m.key) {
//     m.id = m.key.id;
//     m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
//     m.chat = m.key.remoteJid;
//     m.fromMe = m.key.fromMe;
//     m.isGroup = m.chat.endsWith("@g.us");
//     m.sender = conn.decodeJid(
//       (m.fromMe && conn.user.id) ||
//         m.participant ||
//         m.key.participant ||
//         m.chat ||
//         ""
//     );
//     if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || "";
//   }
//   if (m.message) {
//     m.mtype = getContentType(m.message);
//     m.msg =
//       m.mtype == "viewOnceMessage"
//         ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
//         : m.message[m.mtype];
//     m.body =
//       m.message.conversation ||
//       m.msg.caption ||
//       m.msg.text ||
//       (m.mtype == "listResponseMessage" &&
//         m.msg.singleSelectReply.selectedRowId) ||
//       (m.mtype == "buttonsResponseMessage" && m.msg.selectedButtonId) ||
//       (m.mtype == "viewOnceMessage" && m.msg.caption) ||
//       m.text;
//     let quoted = (m.quoted = m.msg.contextInfo
//       ? m.msg.contextInfo.quotedMessage
//       : null);
//     m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
//     if (m.quoted) {
//       let type = getContentType(quoted);
//       m.quoted = m.quoted[type];
//       if (["productMessage"].includes(type)) {
//         type = getContentType(m.quoted);
//         m.quoted = m.quoted[type];
//       }
//       if (typeof m.quoted === "string")
//         m.quoted = {
//           text: m.quoted,
//         };
//       m.quoted.mtype = type;
//       m.quoted.id = m.msg.contextInfo.stanzaId;
//       m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
//       m.quoted.isBaileys = m.quoted.id
//         ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
//         : false;
//       m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
//       m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
//       m.quoted.text =
//         m.quoted.text ||
//         m.quoted.caption ||
//         m.quoted.conversation ||
//         m.quoted.contentText ||
//         m.quoted.selectedDisplayText ||
//         m.quoted.title ||
//         "";
//       m.quoted.mentionedJid = m.msg.contextInfo
//         ? m.msg.contextInfo.mentionedJid
//         : [];
//       m.getQuotedObj = m.getQuotedMessage = async () => {
//         if (!m.quoted.id) return false;
//         let q = await store.loadMessage(m.chat, m.quoted.id, conn);
//         return exports.smsg(conn, q, store);
//       };
//       let vM = (m.quoted.fakeObj = M.fromObject({
//         key: {
//           remoteJid: m.quoted.chat,
//           fromMe: m.quoted.fromMe,
//           id: m.quoted.id,
//         },
//         message: quoted,
//         ...(m.isGroup ? { participant: m.quoted.sender } : {}),
//       }));

//       m.quoted.delete = () =>
//         conn.sendMessage(m.quoted.chat, { delete: vM.key });

//       m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
//         conn.copyNForward(jid, vM, forceForward, options);

//       m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
//     }
//   }
//   if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
//   m.text =
//     m.msg.text ||
//     m.msg.caption ||
//     m.message.conversation ||
//     m.msg.contentText ||
//     m.msg.selectedDisplayText ||
//     m.msg.title ||
//     "";

//   m.reply = (text, chatId = m.chat, options = {}) =>
//     Buffer.isBuffer(text)
//       ? conn.sendMedia(chatId, text, "file", "", m, { ...options })
//       : conn.sendText(chatId, text, m, { ...options });

//   m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));

//   m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
//     conn.copyNForward(jid, m, forceForward, options);

//   return m;
// }

// class AutoSessionManager {
//   constructor() {
//     this.sessions = new Map();
//     this.sessionConfig = {
//       autoCreateNew: process.env.AUTO_CREATE_NEW_SESSIONS === "true",
//       maxSessions: parseInt(process.env.MAX_SESSIONS) || 5,
//       sessionScanInterval: parseInt(process.env.SESSION_SCAN_INTERVAL) || 30000,
//       defaultSessionName: "main"
//     };
//   }

//   // Scan sessions directory for existing sessions
//   async scanExistingSessions() {
//     const sessionsDir = './sessions';
//     if (!fs.existsSync(sessionsDir)) {
//       fs.mkdirSync(sessionsDir, { recursive: true });
//       return [];
//     }

//     try {
//       const items = fs.readdirSync(sessionsDir, { withFileTypes: true });
//       const sessionFolders = items
//         .filter(item => item.isDirectory())
//         .map(item => item.name)
//         .filter(name => !name.startsWith('.')); // Skip hidden folders

//       console.log(color(`Found ${sessionFolders.length} existing sessions: ${sessionFolders.join(', ')}`, "cyan"));
//       return sessionFolders;
//     } catch (error) {
//       console.log(color('Error scanning sessions directory:', "red"), error);
//       return [];
//     }
//   }

//   // Create new session name automatically
//   generateNewSessionName() {
//     const sessionsDir = './sessions';
//     if (!fs.existsSync(sessionsDir)) {
//       return this.sessionConfig.defaultSessionName;
//     }

//     const existingSessions = fs.readdirSync(sessionsDir, { withFileTypes: true })
//       .filter(item => item.isDirectory())
//       .map(item => item.name);

//     // Check if default session exists
//     if (!existingSessions.includes(this.sessionConfig.defaultSessionName)) {
//       return this.sessionConfig.defaultSessionName;
//     }

//     // Find next available session number
//     let sessionNumber = 1;
//     while (sessionNumber <= this.sessionConfig.maxSessions) {
//       const sessionName = `session${sessionNumber}`;
//       if (!existingSessions.includes(sessionName)) {
//         return sessionName;
//       }
//       sessionNumber++;
//     }

//     // If all slots are full, use timestamp
//     return `session_${Date.now()}`;
//   }

//   async createSession(sessionName) {
//     if (this.sessions.has(sessionName)) {
//       console.log(color(`Session ${sessionName} already exists`, "yellow"));
//       return this.sessions.get(sessionName);
//     }

//     const sessionPath = `./sessions/${sessionName}`;
    
//     try {
//       const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
//       const { version, isLatest } = await fetchLatestBaileysVersion();
      
//       const store = makeInMemoryStore({
//         logger: pino().child({ level: "silent", stream: "store" }),
//       });

//       const sessionData = {
//         name: sessionName,
//         state,
//         saveCreds,
//         store,
//         client: null,
//         qr: null,
//         status: 'initializing',
//         version,
//         isLatest,
//         lastActivity: Date.now(),
//         user: null
//       };

//       this.sessions.set(sessionName, sessionData);
//       console.log(color(`Created new session: ${sessionName}`, "green"));
//       return sessionData;
//     } catch (error) {
//       console.log(color(`Error creating session ${sessionName}:`, "red"), error);
//       throw error;
//     }
//   }

//   async startSession(sessionName) {
//     let sessionData = this.sessions.get(sessionName);
    
//     if (!sessionData) {
//       sessionData = await this.createSession(sessionName);
//     }

//     if (sessionData.client && sessionData.status === 'connected') {
//       console.log(color(`Session ${sessionName} is already connected`, "yellow"));
//       return sessionData;
//     }

//     // Clear previous client if exists
//     if (sessionData.client) {
//       try {
//         sessionData.client.ws.close();
//       } catch (e) {}
//     }

//     await typeWriter(color(`Starting session: ${sessionName}`, "cyan"), 50);
    
//     if (sessionName === this.sessionConfig.defaultSessionName) {
//       await typeWriter(gradient.rainbow(figlet.textSync("Kibalanga-Bot")), 50);
//     }

//     await Welcome(sessionName);

//     const client = goutamConnect({
//       logger: pino({ level: "silent" }),
//       printQRInTerminal: this.sessions.size === 1, // Only show QR in terminal for first session
//       browser: Browsers.macOS("Desktop"),
//       syncFullHistory: true,
//       auth: sessionData.state,
//     });

//     sessionData.store.bind(client.ev);
//     sessionData.client = client;
//     sessionData.status = 'connecting';

//     // Enhanced message handling with session context
//     client.ev.on("messages.upsert", async (chatUpdate) => {
//       try {
//         const mek = chatUpdate.messages[0];
//         if (!mek.message) return;
//         mek.message =
//           Object.keys(mek.message)[0] === "ephemeralMessage"
//             ? mek.message.ephemeralMessage.message
//             : mek.message;
//         if (mek.key && mek.key.remoteJid === "status@broadcast") return;
//         if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify")
//           return;
//         if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
        
//         const m = smsg(client, mek, sessionData.store);
        
//         // Add session context to message object
//         m.sessionName = sessionName;
//         m.sessionManager = this;
        
//         require("./bot")(client, m, chatUpdate, sessionData.store, sessionName);
//       } catch (err) {
//         console.log(color(`[${sessionName}] Message handling error:`, "red"), err);
//       }
//     });

//     // Enhanced connection handling
//     client.ev.on("connection.update", async (update) => {
//       const { connection, lastDisconnect, qr } = update;
      
//       if (qr) {
//         sessionData.qr = qr;
//         sessionData.status = 'qr_waiting';
//         console.log(color(`[${sessionName}] QR Code generated - Scan to connect`, "yellow"));
        
//         // Generate QR image file for web interface
//         try {
//           const qrBuffer = await qrcode.toBuffer(qr, { scale: 5 });
//           const qrPath = `./sessions/${sessionName}_qr.png`;
//           fs.writeFileSync(qrPath, qrBuffer);
//         } catch (error) {
//           console.log(color(`[${sessionName}] Error generating QR file:`, "red"), error);
//         }
//       }

//       if (connection === "close") {
//         sessionData.status = 'disconnected';
//         const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        
//         const restartSession = () => {
//           console.log(color(`[${sessionName}] Auto-reconnecting...`, "yellow"));
//           setTimeout(() => this.startSession(sessionName), 5000);
//         };

//         switch (reason) {
//           case DisconnectReason.badSession:
//             console.log(color(`[${sessionName}] Bad session - removing...`, "red"));
//             this.removeSession(sessionName);
//             break;
//           case DisconnectReason.connectionClosed:
//           case DisconnectReason.connectionLost:
//           case DisconnectReason.timedOut:
//             restartSession();
//             break;
//           case DisconnectReason.connectionReplaced:
//             console.log(color(`[${sessionName}] Connection replaced elsewhere`, "red"));
//             break;
//           case DisconnectReason.loggedOut:
//             console.log(color(`[${sessionName}] Logged out - removing session`, "red"));
//             this.removeSession(sessionName);
//             break;
//           case DisconnectReason.restartRequired:
//             console.log(color(`[${sessionName}] Restart required`, "yellow"));
//             restartSession();
//             break;
//           default:
//             console.log(color(`[${sessionName}] Unknown disconnect: ${reason}`, "red"));
//             restartSession();
//         }
//       }

//       if (connection === "open") {
//         sessionData.status = 'connected';
//         sessionData.user = client.user;
//         sessionData.lastActivity = Date.now();
        
//         console.log(color(`[${sessionName}] ✅ Connected successfully!`, "green"));
//         console.log(color(`[${sessionName}] 👤 User: ${client.user?.id || 'Unknown'}`, "cyan"));
//         console.log(color(`[${sessionName}] 🌐 Total sessions: ${this.sessions.size}`, "blue"));

//         // Auto bio update for connected sessions
//         if (process.env.AUTO_ABOUT === "true") {
//           const setBio = () => {
//             const status =
//               `📆 ${moment.tz("Africa/Dar_es_Salaam").format("DD/MM/YYYY")} ` +
//               `⌚ ${moment.tz("Africa/Dar_es_Salaam").format("HH:mm:ss")} ` +
//               `SAM-OCHU | ${sessionName} ` +
//               `Runtime: ${Math.floor(process.uptime() / 3600)}h ` +
//               `${Math.floor((process.uptime() % 3600) / 60)}m ` +
//               `${Math.floor(process.uptime() % 60)}s`;

//             client.updateProfileStatus(status).catch(() => {});
//           };

//           setBio();
//           setInterval(setBio, 10000);
//         }

//         // Send connection success message
//         client.sendMessage(client.user.id, {
//           text: `*[${sessionName}] Bot Successfully Connected to Server*\n` +
//                 `Active Sessions: ${this.sessions.size}\n` +
//                 `User: ${client.user?.id || 'Unknown'}`
//         }).catch(() => {});
//       }
//     });

//     client.ev.on("creds.update", sessionData.saveCreds);

//     // Add utility methods to client
//     this.addClientUtilities(client, sessionName);

//     return sessionData;
//   }

//   addClientUtilities(client, sessionName) {
//     const getBuffer = async (url, options) => {
//       try {
//         options = options || {};
//         const res = await axios({
//           method: "get",
//           url,
//           headers: {
//             DNT: 1,
//             "Upgrade-Insecure-Request": 1,
//           },
//           ...options,
//           responseType: "arraybuffer",
//         });
//         return res.data;
//       } catch (err) {
//         return err;
//       }
//     };

//     client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
//       let buffer = Buffer.isBuffer(path)
//         ? path
//         : /^data:.*?\/.*?;base64,/i.test(path)
//         ? Buffer.from(path.split`,`[1], "base64")
//         : /^https?:\/\//.test(path)
//         ? await getBuffer(path)
//         : fs.existsSync(path)
//         ? fs.readFileSync(path)
//         : Buffer.alloc(0);
//       return await client.sendMessage(
//         jid,
//         { image: buffer, caption: caption, ...options },
//         { quoted }
//       );
//     };

//     client.sendText = (jid, text, quoted = "", options) =>
//       client.sendMessage(jid, { text: text, ...options }, { quoted });

//     // Add session info to client
//     client.sessionName = sessionName;
//   }

//   // Remove session completely
//   async removeSession(sessionName) {
//     const session = this.sessions.get(sessionName);
//     if (session) {
//       if (session.client) {
//         try {
//           session.client.ws.close();
//         } catch (e) {}
//       }
//       this.sessions.delete(sessionName);
//       console.log(color(`Session ${sessionName} removed`, "red"));
//     }
//   }

//   getSession(sessionName) {
//     return this.sessions.get(sessionName);
//   }

//   getAllSessions() {
//     return Array.from(this.sessions.values());
//   }

//   getConnectedSessions() {
//     return Array.from(this.sessions.values()).filter(s => s.status === 'connected');
//   }

//   // Auto-manage sessions
//   async autoManageSessions() {
//     console.log(color("Starting auto session management...", "cyan"));
    
//     // Scan for existing sessions
//     const existingSessions = await this.scanExistingSessions();
    
//     // Start all existing sessions
//     for (const sessionName of existingSessions) {
//       if (this.sessions.size < this.sessionConfig.maxSessions) {
//         try {
//           await this.startSession(sessionName);
//           // Add delay between session starts to avoid rate limiting
//           await new Promise(resolve => setTimeout(resolve, 2000));
//         } catch (error) {
//           console.log(color(`Failed to start session ${sessionName}:`, "red"), error);
//         }
//       }
//     }

//     // If no sessions exist, create and start default session
//     if (this.sessions.size === 0) {
//       const defaultSession = this.generateNewSessionName();
//       await this.startSession(defaultSession);
//     }

//     console.log(color(`Auto-management started: ${this.sessions.size} sessions loaded`, "green"));
    
//     // Periodic session health check
//     setInterval(() => {
//       this.healthCheck();
//     }, this.sessionConfig.sessionScanInterval);
//   }

//   // Health check for all sessions
//   async healthCheck() {
//     const connectedCount = this.getConnectedSessions().length;
//     const totalCount = this.sessions.size;
    
//     console.log(color(`Session Health: ${connectedCount}/${totalCount} connected`, "blue"));
    
//     // Restart disconnected sessions
//     for (const [sessionName, session] of this.sessions) {
//       if (session.status === 'disconnected') {
//         console.log(color(`Restarting disconnected session: ${sessionName}`, "yellow"));
//         await this.startSession(sessionName);
//       }
//     }
//   }

//   // Create new session on demand
//   async createNewSession() {
//     if (this.sessions.size >= this.sessionConfig.maxSessions) {
//       throw new Error(`Maximum sessions limit (${this.sessionConfig.maxSessions}) reached`);
//     }
    
//     const newSessionName = this.generateNewSessionName();
//     return await this.startSession(newSessionName);
//   }
// }

// // Initialize auto session manager
// const sessionManager = new AutoSessionManager();

// // Initialize all sessions automatically
// async function initializeSessions() {
//   try {
//     await sessionManager.autoManageSessions();
    
//     // Auto-create new sessions if enabled
//     if (sessionManager.sessionConfig.autoCreateNew && sessionManager.sessions.size < sessionManager.sessionConfig.maxSessions) {
//       const sessionsToCreate = sessionManager.sessionConfig.maxSessions - sessionManager.sessions.size;
//       for (let i = 0; i < sessionsToCreate; i++) {
//         setTimeout(async () => {
//           try {
//             await sessionManager.createNewSession();
//           } catch (error) {
//             console.log(color('Auto session creation failed:', 'red'), error);
//           }
//         }, i * 5000); // Stagger session creation
//       }
//     }
//   } catch (error) {
//     console.log(color('Session initialization failed:', 'red'), error);
//   }
// }

// // Enhanced Express routes
// app.get("/", async (req, res) => {
//   const sessions = sessionManager.getAllSessions();
//   const connected = sessionManager.getConnectedSessions();
  
//   let html = `
//     <html>
//     <head>
//         <title>Multi-Session Bot Manager</title>
//         <style>
//             body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
//             .session { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
//             .connected { border-left: 4px solid #4CAF50; }
//             .disconnected { border-left: 4px solid #f44336; }
//             .connecting { border-left: 4px solid #FFC107; }
//             .btn { display: inline-block; padding: 8px 16px; margin: 5px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
//             .btn-danger { background: #dc3545; }
//             .stats { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
//         </style>
//     </head>
//     <body>
//         <h1>🤖 Multi-Session Bot Manager</h1>
//         <div class="stats">
//             <h3>📊 Statistics</h3>
//             <p>Total Sessions: ${sessions.length} | Connected: ${connected.length} | Disconnected: ${sessions.length - connected.length}</p>
//             <a href="/create-session" class="btn">➕ Create New Session</a>
//             <a href="/health" class="btn">❤️ Health Check</a>
//             <a href="/sessions" class="btn">📋 JSON API</a>
//         </div>
//   `;
  
//   sessions.forEach(session => {
//     const statusClass = session.status === 'connected' ? 'connected' : 
//                        session.status === 'connecting' ? 'connecting' : 'disconnected';
    
//     html += `
//         <div class="session ${statusClass}">
//             <h3>🔐 Session: ${session.name}</h3>
//             <p><strong>Status:</strong> <span style="color: ${
//               session.status === 'connected' ? '#4CAF50' : 
//               session.status === 'connecting' ? '#FFC107' : '#f44336'
//             }">${session.status.toUpperCase()}</span></p>
//             <p><strong>User:</strong> ${session.user?.id || 'Not connected'}</p>
//             <p><strong>Last Activity:</strong> ${new Date(session.lastActivity).toLocaleString()}</p>
//             <div>
//                 <a href="/qr/${session.name}" class="btn">📱 QR Code</a>
//                 <a href="/restart/${session.name}" class="btn">🔄 Restart</a>
//                 ${session.status === 'connected' ? 
//                   `<a href="/broadcast/${session.name}" class="btn">📢 Broadcast Test</a>` : ''}
//                 <a href="/remove/${session.name}" class="btn btn-danger">🗑️ Remove</a>
//             </div>
//         </div>
//     `;
//   });

//   html += `</body></html>`;
//   res.send(html);
// });

// app.get("/qr/:sessionName", async (req, res) => {
//   const { sessionName } = req.params;
//   const session = sessionManager.getSession(sessionName);
  
//   if (!session) {
//     return res.status(404).send("Session not found");
//   }

//   if (session.qr) {
//     res.setHeader("content-type", "image/png");
//     res.send(await qrcode.toBuffer(session.qr, { scale: 8 }));
//   } else if (session.status === 'connected') {
//     res.send(`
//       <html><body style="text-align: center; padding: 50px;">
//         <h2>Session ${sessionName} is already connected</h2>
//         <p>User: ${session.user?.id || 'Unknown'}</p>
//         <a href="/">← Back to Sessions</a>
//       </body></html>
//     `);
//   } else {
//     res.send("No QR code available - session is initializing");
//   }
// });

// app.get("/restart/:sessionName", async (req, res) => {
//   const { sessionName } = req.params;
//   try {
//     await sessionManager.startSession(sessionName);
//     res.redirect("/");
//   } catch (error) {
//     res.status(500).send(`Error restarting session: ${error.message}`);
//   }
// });

// app.get("/remove/:sessionName", async (req, res) => {
//   const { sessionName } = req.params;
//   await sessionManager.removeSession(sessionName);
//   res.redirect("/");
// });

// app.get("/create-session", async (req, res) => {
//   try {
//     const newSession = await sessionManager.createNewSession();
//     res.redirect("/");
//   } catch (error) {
//     res.status(400).send(`Cannot create new session: ${error.message}`);
//   }
// });

// app.get("/health", async (req, res) => {
//   await sessionManager.healthCheck();
//   res.redirect("/");
// });

// app.get("/sessions", (req, res) => {
//   const sessions = sessionManager.getAllSessions();
//   res.json({
//     total: sessions.length,
//     connected: sessionManager.getConnectedSessions().length,
//     sessions: sessions.map(session => ({
//       name: session.name,
//       status: session.status,
//       user: session.user?.id || 'Not connected',
//       lastActivity: session.lastActivity,
//       version: session.version?.join('.') || 'unknown'
//     }))
//   });
// });

// app.get("/broadcast/:sessionName", async (req, res) => {
//   const { sessionName } = req.params;
//   const session = sessionManager.getSession(sessionName);
  
//   if (!session || session.status !== 'connected') {
//     return res.status(400).send("Session not connected");
//   }

//   try {
//     await session.client.sendMessage(session.user.id, {
//       text: `📢 Broadcast test from session ${sessionName}\n` +
//             `This is a test message to verify the session is working properly.\n` +
//             `Time: ${new Date().toLocaleString()}`
//     });
//     res.send("Broadcast test sent successfully!");
//   } catch (error) {
//     res.status(500).send(`Broadcast failed: ${error.message}`);
//   }
// });

// app.listen(port, () => {
//   console.log(color(`🤖 Multi-session bot manager running on port ${port}`, "green"));
//   console.log(color(`🌐 Web interface: http://localhost:${port}`, "cyan"));
// });

// // Initialize sessions
// initializeSessions();

// // Enhanced file watch for development
// let file = require.resolve(__filename);
// fs.watchFile(file, () => {
//   fs.unwatchFile(file);
//   console.log(chalk.redBright(`🔄 File updated: ${__filename}`));
//   delete require.cache[file];
//   require(file);
// });