require("dotenv").config();

//import fetch from "node-fetch";
const moment = require("moment-timezone");
//const fetch = require("node-fetch");
const axios = require("axios");
const {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
  downloadMediaMessage,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const os = require("os");
const util = require("util");
const chalk = require("chalk");
const googleTTS = require("google-tts-api");
const yts = require("youtube-yts");
const ytdl = require("@distube/ytdl-core");
const igs = require("api-dylux");
const { pipeline } = require('stream');
const { promisify } = require('util'); 
const streamPipeline = promisify(pipeline);
const { Configuration, OpenAIApi } = require("openai");
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

// Load chat history from file
const chatHistory = readChatHistoryFromFile();

// Utility function to read chat history from file
function readChatHistoryFromFile() {
  try {
    const data = fs.readFileSync("chat_history.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

/*function ffmpeg(Buffer, args = [], ext = '', ext2 = ''){

}*/

// Utility function to write chat history to file
function writeChatHistoryToFile(chatHistory) {
  fs.writeFileSync("chat_history.json", JSON.stringify(chatHistory));
}

// Utility function to update chat history
function updateChatHistory(sender, message) {
  // If this is the first message from the sender, create a new array for the sender
  if (!chatHistory[sender]) {
    chatHistory[sender] = [];
  }
  // Add the message to the sender's chat history
  chatHistory[sender].push(message);
  // If the chat history exceeds the maximum length of 20 messages, remove the oldest message
  if (chatHistory[sender].length > 20) {
    chatHistory[sender].shift();
  }
}

module.exports = client = async (client, m, chatUpdate, store) => {
  try {
    // If the sender has no chat history, create a new array for the sender
    if (!chatHistory[m.sender]) chatHistory[m.sender] = [];
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype === "messageContextInfo"
        ? m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";

    //=================================================//
    const isCmd = body.startsWith(prefix);
    const command = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase(); //If you want a single prefix, you replace it with this = const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "Sam Software";
    const botNumber = await client.decodeJid(client.user.id);

    //const isCreator = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const text = (q = args.join(" "));
    const { type, quotedMsg, mentioned, now, fromMe } = m;
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const from = mek.key.remoteJid;
    //const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(e => {}) : ''
    //const sender = m.isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid
    //const groupName = m.isGroup ? groupMetadata.subject : ''
    //const participants = m.isGroup ? await groupMetadata.participants : ''
    //const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
    //const isBotAdmins = m.isGroup ? groupAdmins.includes(owner) : false
    //const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    //const welcm = m.isGroup ? wlcm.includes(from) : false
    //const welcmm = m.isGroup ? wlcmm.includes(from) : false
    //const AntiLink = m.isGroup ? ntilink.includes(from) : false
    //const isBan = banned.includes(m.sender)
    const content = JSON.stringify(m.message);
    const numberQuery =
      text.replace(new RegExp("[()+-/ +/]", "gi"), "") + "@s.whatsapp.net";
    const mentionByTag =
      m.mtype == "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : [];
    const Input = mentionByTag[0] ? mentionByTag[0] : q ? numberQuery : false;
    const qtod = m.quoted ? "true" : "false";
    const owner = ["255778760701"];

    //const thinking = await client.sendMessage(m.chat, { text: 'Thinking...' });
    const botname = process.env.BOT_NAME || "Kibalanga-Bot";
    const owner_name = "SAM-OCHU";
    const mentionUser = [
      ...new Set([
        ...(m.mentionedJid || []),
        ...(m.quoted ? [m.quoted.sender] : []),
      ]),
    ];

    const mentionByReply =
      type == "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.participant || ""
        : "";
    const usernya = mentionByReply ? mentionByReply : mentionByTag[0];
    const isEval = body.startsWith("=>");

    //=================================================//}
    //  Bot Prosess Time
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    //Uptime
    const uptimeMessage = `*hi there! Kibalanga is alive now since ${hours}h ${minutes}m ${seconds}s*`;

    //TIME Wisher
    const xtime = moment.tz("Afrika/Dodoma").format("HH:mm:ss");
    const xdate = moment.tz("Afrika/Dodoma").format("DD/MM/YYYY");
    const time2 = moment().tz("Afrika/Dodoma").format("HH:mm:ss");
    if (time2 < "23:59:00") {
      var pushwish = `Good Night 🌌`;
    }
    if (time2 < "19:00:00") {
      var pushwish = `Good Evening 🌃`;
    }
    if (time2 < "18:00:00") {
      var pushwish = `Good Evening 🌃`;
    }
    if (time2 < "15:00:00") {
      var pushwish = `Good Afternoon 🌅`;
    }
    if (time2 < "11:00:00") {
      var pushwish = `Good Morning 🌄`;
    }
    if (time2 < "05:00:00") {
      var pushwish = `Good Morning 🌄`;
    }

    //const sendMsg = await sock.sendMessage(id, reactionMessage)
    //  const from = m.chat;
    const reply = m.reply;
    //const sender = m.sender;
    // const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    function pickRandom(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    async function loading() {
      var goutamload = [
        `ㅤʟᴏᴀᴅɪɴɢ
《 █▒▒▒▒▒▒▒▒▒▒▒》10%`,
        `ㅤʟᴏᴀᴅɪɴɢ
《 ████▒▒▒▒▒▒▒▒》30%`,
        `ㅤʟᴏᴀᴅɪɴɢ
《 ███████▒▒▒▒▒》50%`,
        `ㅤʟᴏᴀᴅɪɴɢ
《 ██████████▒▒》80%`,
        `ㅤʟᴏᴀᴅɪɴɢ
《 ████████████》100%`,
        "ʟᴏᴀᴅɪɴɢ ᴄᴏᴍᴘʟᴇᴛᴇ",
      ];
      let { key } = await client.sendMessage(from, { text: "ʟᴏᴀᴅɪɴɢ..." }); //Pengalih isu

      for (let i = 0; i < goutamload.length; i++) {
        //await delay(10)

        await client.relayMessage(
          m.chat,
          {
            protocolMessage: {
              key: key,
              type: 14,
              editedMessage: {
                conversation: goutamload[i],
              },
            },
          },
          {}
        );
      }
    }

    if (process.env.REACODING || ("true" === "true" && command)) {
      // client.sendPresenceUpdate("recording", from);
      console.log("sam")
    }
    if (process.env.AUTO_READ || ("true" === "true" && command)) {
      client.readMessages([m.key]);
    }
    if (process.env.ALWAYS_ONLINE || "true" === "true") {
      // client.sendPresenceUpdate("available", m.chat);
      client.sendPresenceUpdate("unavailable", m.chat);
    } else {
      client.sendPresenceUpdate("unavailable", m.chat);
    }

    // Group
    const groupMetadata = m.isGroup
      ? await client.groupMetadata(m.chat).catch((e) => {})
      : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (!m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`)
      );
    } else if (m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (isCmd) {
      switch (command) {
        case "help":
        case "menu":
          const reactionMessage = {
            react: {
              text: "💖", // use an empty string to remove the reaction
              key: m.key,
            },
          };
          await client.sendMessage(m.chat, reactionMessage);
          // let thumb = "./me.jpg";
          let me = m.sender;

          // await loading();
          await m.reply(` 
╭––『 *${botname}* 』 
┆ Hi 👋  
╰–❖  *${pushname}* 
╭–––––––––––––––༓ 
┆✑  *${pushwish}* 😄 
╰–––––––––––––––༓ 
╭–– 『 *Bot Info* 』      
┆ *Bot Name* : *${botname}*
┆ *Owner Name* : *${owner_name}*
┆ *Prefix* :  *${prefix}*
┆ *Uptime* : *${hours}h ${minutes}m ${seconds}s*
┆ *Mode* : *Public*
╰–––––––––––––––༓ 
╭––『 *User Info* 』 
┆𝗡𝗮𝗺𝗲 : *${pushname}*
┆𝗡𝘂𝗺𝗯𝗲𝗿 : @${me.split("@")[0]} 
┆𝗣𝗿𝗲𝗺𝗶𝘂𝗺 : ✅ 
╰–––––––––––––––༓ 
╭––『 *Time Info* 』 
┆𝗧𝗶m 𝗲 : *${xtime}*
┆𝗗𝗮𝘁𝗲 : *${xdate}*
╰–––––––––––––––༓ 
╭––『 *Help* 』 
┆✑  Please Type The */help* 
╰–––––––––––––––༓ﾠ 
╭––『 *ChatGPT* 』ﾠ 
┆❏.gpt 🅕 
┆❏.img 🅕 
┆❏.dall 🅕 
╰–––––––––––––––༓ 
╭––『 *Bard* 』 
┆❏.bard 🅕 
╰–––––––––––––––༓
╭––『 *Bot* 』ﾠ 
┆❏.script 🅕 
┆❏.ping 🅕 
┆❏.alive 🅕 
┆❏.bug 🅕 
╰–––––––––––––––༓
╭––『 *Owner* 』
┆❏.setbio 🅕 
┆❏.setname 🅕 
╰–––––––––––––––༓ 
╭––『 *Group* 』 
┆❏.Join 🅕 
|❏.Kick 🅕
|❏.ban 🅕
|❏.promote 🅕
|❏.tagall 🅕
|❏.demote 🅕
|❏.mute 🅕
╰–––––––––––––––༓
╭––『 *Sticker menu* 』 
┆❏.sticker🅕 
╰–––––––––––––––༓
╭––『 *Search menu* 』ﾠ 
┆❏.google 🅕 
┆❏.insta 🅕 
┆❏.apk 🅕 
┆❏.yts
╰–––––––––––––––༓ 
╭––『 *Tools* 』ﾠ 
┆❏.tts 🅕 
┆❏.short 🅕 
╰–––––––––––––––༓ 
╭––『 *Downloader* 』 
┆❏.fb 🅕 
┆❏.song 🅕 
┆❏.video 🅕
|❏.Tiktok 🅕 
|❏.Apk 🅕
╰–––––––––––––––༓
╭––『 *Anime (18+)* 』
┆❏.hentai 🅕
┆❏.neko 🅕
┆❏.trap 🅕
┆❏.gasm 🅕
┆❏.ahegao 🅕
┆❏.ass 🅕
┆❏.bdsm 🅕
┆❏.blowjob 🅕
┆❏.cuckold 🅕
┆❏.cum 🅕
┆❏.milf 🅕
┆❏.eba 🅕
┆❏.ero 🅕
┆❏.femdom 🅕
┆❏.foot 🅕
┆❏.gangbang 🅕
┆❏.glasses 🅕
┆❏.jahy 🅕
┆❏.masturbation 🅕
┆❏.manga 🅕
┆❏.neko-hentai 🅕
┆❏.neko-hentai2 🅕
┆❏.nsfwloli 🅕
┆❏.orgy 🅕
┆❏.panties 🅕 
┆❏.pussy 🅕
┆❏.tentacles 🅕
┆❏.thighs 🅕
┆❏.yuri 🅕
┆❏.zettai 🅕
╰–––––––––––––––༓
          `);

          break;

        /*case "mp3":
        *  {
        *    return ffmpeg(Buffer, [
        *      '-vn',
        *      '-c:a',
        *      'libopus',
        *      '-b:a',
        *      'on',
        *      '-compression_level', '10'
        *    ])
        *  };
          brake; */

        case "delete":
        case "futa":
        {  
            async: async (m, {
              client,
              isBotAdmin
           }) => {
              if (!m.quoted) return
              client.sendMessage(m.chat, {
                 delete: {
                    remoteJid: m.chat,
                    fromMe: isBotAdmin ? false : true,
                    id: m.quoted.id,
                    participant: m.quoted.sender
                 }
              })
           };
         };
        break;

        case "promote":
        {
          
          async: async (m, {
             client,
             text,
             isPrefix,
             command,
             participants
          }) => {
             try {
                return client.groupParticipantsUpdate(m.chat, [m.sender], 'promote').then(res => client.reply(m.chat, Func.jsonFormat(res), m))
             } catch (e) {
                console.log(e)
                client.reply(m.chat, global.status.error, m)
             }
          }
       };
       break;

      case "kick":
        {
          async: async (m, {
            client,
            text,
            isPrefix,
            command,
            participants
         }) => {
            let number = m.quoted ? m.quoted.sender : m.mentionedJid.length != 0 ? m.mentionedJid[0] : isNaN(text) ? text.replace(/[()+\s-]/g, '') + '@s.whatsapp.net' : text
            if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Mention or reply target`), m)
            if (await client.onWhatsApp(number).length == 0) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Number not registered on WhatsApp.`), m)
            try {
               let mention = number.replace(/@.+/g, '')
               let users = m.isGroup ? participants.find(u => u.id == number) : {}
               if (!users) return client.reply(m.chat, Func.texted('bold', `🇹🇿 @${mention} already logged out or does not exist in this group.`), m)
               if (number  == client.decodeJid(client.user.id))return client.reply(m.chat, Func.texted('bold', `??`), m)
               if (command == 'kick') return client.groupParticipantsUpdate(m.chat, [number], 'remove')
            } catch (e) {
              console.log(e)
              client.reply(m.chat, global.status.error, m)
            }
         }
         group: true
         admin: true
         botAdmin: true
      }
      break;

      case "demote":
        {
          async: async (m, {
            client,
            text,
            isPrefix,
            command,
            participants
         }) => {
            let number = m.quoted ? m.quoted.sender : m.mentionedJid.length != 0 ? m.mentionedJid[0] : isNaN(text) ? text.replace(/[()+\s-]/g, '') + '@s.whatsapp.net' : text
            if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Mention or reply target`), m)
            if (await client.onWhatsApp(number).length == 0) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Number not registered on WhatsApp.`), m)
            try {
               let mention = number.replace(/@.+/g, '')
               let users = m.isGroup ? participants.find(u => u.id == number) : {}
               if (!users) return client.reply(m.chat, Func.texted('bold', `🇹🇿 @${mention} already logged out or does not exist in this group.`), m)
               if (number  == client.decodeJid(client.user.id))return client.reply(m.chat, Func.texted('bold', `??`), m)
               if (command == 'demote') return client.groupParticipantsUpdate(m.chat, [number], 'demote')
            } catch (e) {
              console.log(e)
              client.reply(m.chat, global.status.error, m)
            }
         }
         group: true
         admin: true
         botAdmin: true
      }
      break;

      case "ban":
        {
          async: async (m, {
            client,
            text,
            command,
            participants
         }) => {
            let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
            if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Mention or Reply chat target.`), m)
            if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Invalid number.`), m)
            if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Invalid format.`), m)
            try {
               if (text) {
                  var user = number + '@s.whatsapp.net'
               } else if (m.quoted.sender) {
                  var user = m.quoted.sender
               } else if (m.mentionedJid) {
                  var user = number + '@s.whatsapp.net'
               }
            } catch (e) {} finally {
               let is_user = global.db.users
               let is_owner = [global.client.user.id.split`@` [0], global.owner, ...global.db.setting.owners].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(user)
               if (!is_user.some(v => v.jid == user)) return client.reply(m.chat, Func.texted('bold', `🇹🇿 User data not found.`), m)
               if (command == 'ban') {
                  if (is_owner) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Can't banned owner number.`), m)
                  if (user == client.user.id) return client.reply(m.chat, Func.texted('bold', `🇹🇿 ??`), m)
                  if (is_user.find(v => v.jid == user).banned) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Target already banned.`), m)
                  is_user.find(v => v.jid == user).banned = true
                  let banned = is_user.filter(v => v.banned).length
                  client.reply(m.chat, `乂  *B A N N E D*\n\n*“Successfully added @${user.split`@`[0]} into banned list.”*\n\n*Total : ${banned}*`, m)
               } else if (command == 'unban') {
                  if (!is_user.find(v => v.jid == user).banned) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Target not banned.`), m)
                  is_user.find(v => v.jid == user).banned = false
                  let banned = is_user.filter(v => v.banned).length
                  client.reply(m.chat, `🇹🇿  *U N B A N N E D*\n\n*“Succesfully removing @${user.split`@`[0]} from banned list.”*\n\n*Total : ${banned}*`, m)
               }
            }
         }
         owner: true
         cache: true
         location: __filename
      }
      break;

      case "restart":
      case "upya":
      case "anza":
        {
          async: async (m, {
            client
         }) => {
            await client.reply(m.chat, Func.texted('bold', 'Tafadhali subiri Restarting . . .'), m).then(async () => {
               await props.save()
               process.send('reset')
            })
         }
      };
      break;
        
      case "Block":
      case "zuia":
       {
        async: async (m, {
             client,
             text,
             isPrefix,
             command,
             participants
          }) => {
             let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
             if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Mention or Reply chat target.`), m)
             if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Invalid number.`), m)
             if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Invalid format.`), m)
             try {
                if (text) {
                   var user = number + '@s.whatsapp.net'
                } else if (m.quoted.sender) {
                   var user = m.quoted.sender
                } else if (m.mentionedJid) {
                   var user = number + '@s.whatsapp.net'
                }
             } catch (e) {} finally {
                // let ownerF = [global.client.user.id.split`@` [0], global.owner, ...global.db.setting.owners].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(user)
                // if (ownerF) return client.reply(m.chat, Func.texted('bold', `You can't block owner number.`), m)
                if (user == client.user.id.split(':')[0] + 's.whatsapp.net') return client.reply(m.chat, Func.texted('bold', `🤔 ??`), m)
                if (command == 'block') return client.updateBlockStatus(user, 'block')
                if (command == 'unblock') return client.updateBlockStatus(user, 'unblock')
             }
          }
          owner: true
       }
       break;

       case "mute":
        {
          let gc = global.db.groups.find(v => v.jid == m.chat)
          let opt = [0, 1]
          let rows = [{
             title: 'True',
             rowId: `${isPrefix + command} 1`,
             description: ``
          }, {
             title: 'False',
             rowId: `${isPrefix + command} 0`,
             description: ``
          }]
          if (!args || !args[0] || !opt.includes(parseInt(args[0]))) return client.sendList(m.chat, '', `🇹🇿 *Current status* : [ ${gc.mute ? 'True' : 'False'} ]`, '', 'Tap!', [{ rows }], m)
          if (parseInt(args[0]) == 1) {
             if (gc.mute) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Previously muted.`), m)
             gc.mute = true
             client.reply(m.chat, Func.texted('bold', `🇹🇿 Successfully muted.`), m)
          } else if (parseInt(args[0]) == 0) {
             if (!gc.mute) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Previously unmuted.`), m)
             gc.mute = false
             client.reply(m.chat, Func.texted('bold', `🇹🇿 Successfully unmuted.`), m)
          }
       
       admin: true;
       group: true;
       cache: true;
       location: __filename
    }
    break;

    case "tagall":
      {
        async: async (m, {
          client,
          text,
          participants
       }) => {
          try {
             let member = participants.map(v => v.id)
             let readmore = String.fromCharCode(8206).repeat(4001)
             let message = (!text) ? 'Hello everyone🖐️, admin mention you in ' + await (await client.groupMetadata(m.chat)).subject + ' group.' : text
             client.reply(m.chat, `🇹🇿  *E V E R Y O N E*\n\n*“${message}”*\n${readmore}\n${member.map(v => '◦  @' + v.replace(/@.+/, '')).join('\n')}`, m)
          } catch (e) {
             console.log(e)
             return client.reply(m.chat, global.status.error, m)
          }
       }
       admin: true;
       group: true;
    }
        

      case "ping":
        {
            const reactionMessage = {
              react: {
                text: "📍", // use an empty string to remove the reaction
                key: m.key,
              },
            };
            await client.sendMessage(m.chat, reactionMessage);

            // await loading()
            const startTime = new Date();
            const pingMsg = await client.sendMessage(m.chat, {
              text: "Pinging...",
            });

            await client.relayMessage(
              m.chat,
              {
                protocolMessage: {
                  key: pingMsg.key,
                  type: 14,
                  editedMessage: {
                    conversation: `*Respond Speed: ${
                      new Date() - startTime
                    } ms*`,
                  },
                },
              },
              {}
            );
          }
          break;

        case "runtime":
        case "alive":
          {
            const reactionMessage = {
              react: {
                text: "🤨", // use an empty string to remove the reaction
                key: m.key,
              },
            };
            await client.sendMessage(m.chat, reactionMessage);
            await loading();
            await m.reply(uptimeMessage);
          }
          break;

        case "bard":
          if (!text)
            throw `*Chat With Bard AI*\n\n*𝙴xample usage*\n*◉ ${
              prefix + command
            } Hello*\n*◉ ${
              prefix + command
            } write a hello world program in python*`;
          const thinking = await client.sendMessage(m.chat, {
            text: "Thinking...",
          });
          const MODEL_NAME = "models/chat-bison-001";
          const API_KEY = process.env.PALM_API_KEY;

          const clint = new DiscussServiceClient({
            authClient: new GoogleAuth().fromAPIKey(API_KEY),
          });

          async function main() {
            const result = await clint.generateMessage({
              model: MODEL_NAME, // Required. The model to use to generate the result.
              temperature: 0.5, // Optional. Value `0.0` always uses the highest-probability result.
              candidateCount: 1, // Optional. The number of candidate results to generate.
              prompt: {
                // optional, preamble context to prime responses
                context: "You will respond as Kibalanga and Respond to all the question in good manner.",
                // Optional. Examples for further fine-tuning of responses.

                // Required. Alternating prompt/response messages.
                messages: [{ content: text }],
              },
            });

            // await m.reply(`${result[0].candidates[0].content}`);
            await client.relayMessage(
              m.chat,
              {
                protocolMessage: {
                  key: thinking.key,
                  type: 14,
                  editedMessage: {
                    conversation: result[0].candidates[0].content,
                  },
                },
              },
              {}
            );
          }

          main();
          break;

        case "setbio":
          {
            if (!text)
              return m.reply(`Example: ${prefix + command} Enjoy the digital world with kibalanga.`);
            await client.updateProfileStatus(text);
            m.reply(`Bio Sucsessfully changed to ${text}`);
            owner: true
          }
          break;

        case "setname":
          {
            if (!text)
              return m.reply(
                `Where is the name?\nExample: ${prefix + command} SAM-OCHU`
              );
            await client.updateProfileName(text);
            m.reply(`Bot Name Sucsessfully changed  to ${text}`);
            owner:true
          }
          break;
function isUrl(str) { 
 } 

case 'git':
case 'gitclone':
  if (!args[0]) return reply(`give me the link?\nExample :\n${prefix}${command} https://github.com/SamSpeedX/Kibalanga-Bot`);
  if (!isUrl(args[0]) && !args[0].includes('github.com')) return m.reply(`Link invalid!!`);
  let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
  let [, user, repo] = args[0].match(regex1) || [];
  repo = repo.replace(/.git$/, '');
  let gitUrl = `https://api.github.com/repos/${user}/${repo}/zipball`;

  // Use Axios to send a HEAD request and get the content-disposition header
  axios.head(gitUrl)
    .then(response => {
      let filename = response.headers['content-disposition'].match(/attachment; filename=(.*)/)[1];
      
      // Send the document using Axios
      axios({
        method: 'get',
        url: gitUrl,
        responseType: 'stream', // Set the response type to stream
      })
      .then(response => {
        // Handle the response data and send it as a document
        client.sendMessage(m.chat, {
          document: { url: gitUrl, data: response.data }, // Use response.data as the document data
          fileName: filename + '.zip',
          mimetype: 'application/zip'
        }, { quoted: m });
      })
      .catch(err => {
        console.error(err);
        reply(mess.error);
      });
    })
    .catch(err => {
      console.error(err);
      reply(mess.error);
    });
  break;

  
        case "apk":
        {
          async: async (m, {
            client,
            text,
            args,
            isPrefix,
            command
         }) => {
            try {
               if (command == 'apk') {
                  if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'fb lite'), m)
                  client.sendReact(m.chat, '📱', m.key)
                  let json = await Api.apk(text)
                  if (!json.status) return client.reply(m.chat, global.status.fail, m)
                  let rows = []
                  json.data.map(async (v, i) => {
                     rows.push({
                        title: v.name,
                        rowId: `${isPrefix}getapk ${text}—${v.no}`,
                        description: `[ ${v.size} | ${v.version} ]`
                     })
                  })
                  client.sendList(m.chat, '', `Showing search results for : “${text}”, select below the application you want to download. 🍟`, '', 'Tap!', [{
                     rows
                  }], m)
               } else if (command == 'getapk') {
                  if (!text) return client.reply(m.chat, global.status.invalid, m)
                  let [query, no] = text.split`—`
                  client.sendReact(m.chat, '🔎', m.key)
                  let json = await Api.apk(query, no)  
                  let teks = `乂  *P L A Y S T O R E*\n\n`
                  teks += '	◦  *Name* : ' + json.data.name + '\n'
                  teks += '	◦  *Version* : ' + json.data.version + '\n'
                  teks += '	◦  *Size* : ' + json.file.size + '\n'
                  teks += '	◦  *Category* : ' + json.data.category + '\n'
                  teks += '	◦  *Developer* : ' + json.data.developer + '\n'
                  teks += '	◦  *Requirement* : ' + json.data.requirement + '\n'
                  teks += '	◦  *Publish* : ' + json.data.publish + '\n'
                  teks += '	◦  *Link* : ' + json.data.playstore + '\n\n'
                  teks += global.footer
                  let chSize = Func.sizeLimit(json.file.size, global.max_upload)
                  if (chSize.oversize) return client.reply(m.chat, `❌ File size (${json.file.size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Func.shorten(json.file.url)).data.url}`, m)
                  client.sendFile(m.chat, json.data.thumbnail, '', teks, m).then(() => {
                     client.sendFile(m.chat, json.file.url, json.file.filename, '', m)
                  })
               }
            } catch (e) {
               console.log(e)
               return client.reply(m.chat, global.status.error, m)
            }
         }
        //  error: false,
        //  limit: true,
        //  restrict: true
      };
      break;

      case "jion":
      case "jiunge":
        {
          async: async (m, {
            client,
            args,
            isPrefix,
            command
         }) => {
            try {
               if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://chat.whatsapp.com/codeInvite'), m)
               let link = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
               let [_, code] = args[0].match(link) || []
               if (!code) return client.reply(m.chat, global.status.invalid, m)
               let id = await client.groupAcceptInvite(code)
               if (!id.endsWith('g.us')) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Sorry i can't join to this group :(`), m)
               let member = await (await client.groupMetadata(id)).participants.map(v => v.id)
               return client.reply(m.chat, `🇹🇿 Joined!`, m)
            } catch {
               return client.reply(m.chat, Func.texted('bold', `🇹🇿 Sorry i can't join to this group :(`), m)
            }
         }
         owner: true
      };
      break;
        

      case "tiktok":
        {
          async: async (m, {
            client,
            args,
            isPrefix,
            command
         }) => {
            try {
               if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m)
               if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m)
               client.sendReact(m.chat, '📺', m.key)
               let old = new Date()
               let json = await Api.tiktok(Func.ttFixed(args[0]))
               if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
               if (command == 'tiktok' || command == 'tt') return client.sendButton(m.chat, json.data.video, `If you want to get the *original sound* press the button below.\n🍟 *Fetching* : ${((new Date - old) * 1)} ms`, ``, m, [{
                  buttonId: `${isPrefix}tikmp3 ${args[0]}`,
                  buttonText: {
                     displayText: 'Backsound'
                  },
                  type: 1
               }])
               if (command == 'tikwm') return client.sendButton(m.chat, json.data.videoWM, `If you want to get the *original sound* press the button below.\n🍟 *Fetching* : ${((new Date - old) * 1)} ms`, ``, m, [{
                  buttonId: `${isPrefix}tikmp3 ${args[0]}`,
                  buttonText: {
                     displayText: 'Backsound'
                  },
                  type: 1
               }])
               if (command == 'tikmp3') return !json.data.audio ? client.reply(m.chat, global.status.fail, m) : client.sendFile(m.chat, json.data.audio, 'audio.mp3', '', m)
            } catch (e) {
               console.log(e)
               return client.reply(m.chat, global.status.error, m)
            }
         }
      };
      break;

      case "antlink":
        {
        exports.run = {
          async: async (m, {
             client,
             body,
             groupSet,
             isAdmin
          }) => {
             try {
                if (groupSet.antilink && !isAdmin && body) {
                   if (body.match(/(chat.whatsapp.com)/gi) && !body.includes(await client.groupInviteCode(m.chat)) || Func.isUrl(body) && !Func.socmed(body)) return client.sendMessage(m.chat, {
                      delete: {
                         remoteJid: m.chat,
                         fromMe: false,
                         id: m.key.id,
                         participant: m.sender
                      }
                   }).then(() => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
                }
             } catch (e) {
                return client.reply(m.chat, Func.jsonFormat(e), m)
             }
          },
          error: false,
          group: true,
          botAdmin: true,
          cache: true,
          location: __filename
        }
       };
        break;

      case "wroning":
        {
          exports.run = {
            async: async (m, {
               client,
               body,
               users,
               groupSet,
               setting,
               isAdmin,
               isBotAdmin
            }) => {
               try {
                  if (groupSet.filter && !isAdmin && isBotAdmin && !m.fromMe) {
                     let toxic = setting.toxic
                     if (body && (new RegExp('\\b' + toxic.join('\\b|\\b') + '\\b')).test(body.toLowerCase())) {
                        groupSet.member[m.sender].warning += 1
                        let warning = groupSet.member[m.sender].warning
                        if (warning > 4) return client.reply(m.chat, Func.texted('bold', `🇹🇿 Warning : [ 5 / 5 ], good bye ~~`), m).then(() => {
                           client.groupParticipantsUpdate(m.chat, [m.sender], 'remove').then(async () => {
                              groupSet.member[m.sender].warning = 0
                              client.sendMessage(m.chat, {
                                 delete: {
                                    remoteJid: m.chat,
                                    fromMe: isBotAdmin ? false : true,
                                    id: m.key.id,
                                    participant: m.sender
                                 }
                              })
                           })
                        })
                        return client.reply(m.chat, `🇹🇿  *W A R N I N G* \n\nYou got warning : [ ${warning} / 5 ]\n\If you get 5 warnings you will be kicked automatically from the group.`, m).then(() => client.sendMessage(m.chat, {
                           delete: {
                              remoteJid: m.chat,
                              fromMe: isBotAdmin ? false : true,
                              id: m.key.id,
                              participant: m.sender
                           }
                        }))
                     }
                  }
               } catch (e) {
                  return client.reply(m.chat, Func.jsonFormat(e), m)
               }
            },
            group: true
         }         
        };
        break;

      case "mediafire":
        {
          async: async (m, {
            client,
            args,
            isPrefix,
            command
         }) => {
            try {
               if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file'), m)
               if (!args[0].match(/(https:\/\/www.mediafire.com\/)/gi)) return client.reply(m.chat, global.status.invalid, m)
               client.sendReact(m.chat, '📥', m.key)
               let json = await Api.mediafire(args[0])
               if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
               let text = `🇹🇿  *M E D I A F I R E*\n\n`
               text += '	◦  *Name* : ' + unescape(decode(json.data.filename)) + '\n'
               text += '	◦  *Size* : ' + json.data.size + '\n'
               text += '	◦  *Extension* : ' + json.data.extension + '\n'
               text += '	◦  *Mime* : ' + json.data.mime + '\n'
               text += '	◦  *Uploaded* : ' + json.data.uploaded + '\n\n'
               text += global.footer
               let chSize = Func.sizeLimit(json.data.size, global.max_upload)
               if (chSize.oversize) return client.reply(m.chat, `🇹🇿 File size (${json.data.size}) exceeds the maximum limit❌, download it by yourself via this link : ${await (await scrap.shorten(json.data.link)).data.url}`, m)
               client.sendMessageModify(m.chat, text, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer('https://telegra.ph/file/fcf56d646aa059af84126.jpg')
               }).then(async () => {
                  client.sendFile(m.chat, json.data.link, unescape(decode(json.data.filename)), '', m)
               })
            } catch {
               return client.reply(m.chat, global.status.error, m)
            }
         }
        //  error: false,
        //  limit: true,
        //  cache: true,
        //  location: __filename
      }
      brake;

        case "sticker":
          m.reply("Am so sorry to tell you This feature is not available now but  is Comming Soon as possible please hold on....");
          break;

        case "say":
        case "tts":
        case "gtts":
        case "tamka":
        case "sema":
          {
            if (!text) return m.reply("give me the text please.");
            let texttts = text;
            const xeonrl = googleTTS.getAudioUrl(texttts, {
              lang: "en",
              slow: false,
              host: "https://translate.google.com",
            });
            return client.sendMessage(
              m.chat,
              {
                audio: {
                  url: xeonrl,
                },
                mimetype: "audio/mp4",
                ptt: true,
                fileName: `${text}.mp3`,
              },
              {
                quoted: m,
              }
            );
          }
          break;

        case "insta":
        case "ig":
          {
            if (!args[0])
              return m.reply(
                `Enter Instagram Username\n\nExample: ${
                  prefix + command
                } world_reacode_egg`
              );

            
            try {
              let res = await igs.igStalk(args[0]);
              let te = `
┌──「 *Information* 
▢ *🔖Name:* ${res.name} 
▢ *🔖Username:* ${res.username}
▢ *👥Follower:* ${res.followersH}
▢ *🫂Following:* ${res.followingH}
▢ *📌Bio:* ${res.description}
▢ *🏝️Posts:* ${res.postsH}
▢ *🔗 Link* : https://instagram.com/${res.username.replace(/^@/, "")}

*Power by SAM TECHNOLOGY*
└────────────`;
              await client.sendMessage(
                m.chat,
                { image: { url: res.profilePic }, caption: te },
                { quoted: m }
              );
            } catch {
              m.reply(`Make sure the username comes from *Instagram*`);
            }
          }
          break;

        case "google":
          {
            if (!q) return m.reply(`Example : ${prefix + command} ${botname}`);

            let google = require("google-it");
            google({ query: text }).then((res) => {
              let teks = `Google Search From : ${text}\n\n`;
              for (let g of res) {
                teks += `⭔ *Title* : ${g.title}\n`;
                teks += `⭔ *Description* : ${g.snippet}\n`;
                teks += `⭔ *Link* : ${g.link}\n\n────────────────────────\n\n`;
              }
              m.reply(teks);
            });
          }
          break;

case 'yts':
case 'ytsearch': {
    if (!args.join(" ")) {
        return client.sendMessage(from, `Example: -yts Heat waves`, m.id); // Fix message sending
    }

    

    try {
        const search = await yts(args.join(" "));
        const text = args.join(" ");
        let teks = `**YouTube Search Results for: ${text}**\n\n`;

        if (search.all.length === 0) {
            teks += "No results found for the given search query.";
        } else {
            search.all.forEach((result, index) => {
                teks += `**Result No: ${index + 1}**\n\n` +
                    `**Title:** ${result.title}\n` +
                    `**Views:** ${result.views}\n` +
                    `**Duration:** ${result.timestamp}\n` +
                    `**Uploaded:** ${result.ago}\n` +
                    `**Author:** ${result.author.name}\n` +
                    `**URL:** ${result.url}\n\n` +
                    `*Power by SAM TECHNOLOGY*`;
            });
        }

        // Send the results in a more readable format
        client.sendMessage(from, { image: { url: search.all[0].thumbnail }, caption: teks }, m);
    } catch (error) {
        console.error("Error searching YouTube:", error);
        client.sendMessage(from, "An error occurred while searching YouTube.");
    }}
    break;

        case "fb":
        case "facebook": {
          if (!args[0]) {
            throw ` Please send the link of a Facebook video\n\n📌 EXAMPLE :\n*${
              prefix + command
            } * https://www.facebook.com/Ankursajiyaan/videos/981948876160874/?mibextid=rS40aB7S9Ucbxw6v`;
          }

          const urlRegex =
            /^(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch)\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
          if (!urlRegex.test(args[0])) {
            throw "⚠️ PLEASE GIVE A VALID URL.";
          }

          try {
            const result = await igs.fbdl(args[0]);
            const tex = ` 
 🌟 *Video Details* 🌟 
 📽️ *Title*: ${result.title} 
 👍 *Likes*: ${result.likes} 
 👎 *Dislikes*: ${result.dislikes} 
 👁️ *Views*: ${result.views} 
 📥 [Download](result.videoUrl) 
 \n\n *Power by SAM TECHNOLOGY*`;

            const response = await fetch(result.videoUrl);
            const arrayBuffer = await response.arrayBuffer();
            const videoBuffer = Buffer.from(arrayBuffer);

            // Save the videoBuffer to a temporary file
            const randomName = `temp_${Math.floor(Math.random() * 10000)}.mp4`;
            fs.writeFileSync(`./${randomName}`, videoBuffer);

            // Send the video using client.sendMessage
            await client.sendMessage(
              m.chat,
              {
                video: fs.readFileSync(`./${randomName}`),
                caption: tex,
              },
              { quoted: m }
            );

            // Delete the temporary file
            fs.unlinkSync(`./${randomName}`);
          } catch (error) {
            console.log(error);
            m.reply(
              "⚠️ An error occurred while processing the request. Please try again later."
            );
          }

          break;
        }
        case "song":
        case "wimbo":
        case "cheza":
        case "play":
          if (!text) throw `Use example ${prefix + command} malkia karen washa`;

          let search = await yts(text);
          if (!search.videos || search.videos.length === 0) {
            throw "No videos found for the given search query";
          }

          let vid =
            search.videos[Math.floor(Math.random() * search.videos.length)];
          if (!vid) throw "Video Not Found, Try Another Title";
          let { title, thumbnail, timestamp, views, ago, url } = vid;
          let wm = "Downloading audio please wait";

          let captvid = `✼ ••๑⋯ ❀ Y O U T U B E ❀ ⋯⋅๑•• ✼ 
     ❏ Title: ${title} 
     ❐ Duration: ${timestamp} 
     ❑ Views: ${views} 
     ❒ Upload: ${ago} 
     ❒ Link: ${url} 
     \n\n
     *Power by SAM TECHNOLOGY*
     ⊱─━━━━⊱༻●༺⊰━━━━─⊰`;

          client.sendMessage(
            m.chat,
            { image: { url: thumbnail }, caption: captvid },
            { quoted: m }
          );

          const audioStream = ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
          });

          const tmpDir = os.tmpdir();
          const writableStream = fs.createWriteStream(`${tmpDir}/${title}.mp3`);

          await streamPipeline(audioStream, writableStream);

          let thumbnailData;
          try {
            const thumbnailResponse = await client.getFile(thumbnail);
            thumbnailData = thumbnailResponse.data;
          } catch (error) {
            console.error("Error fetching thumbnail:", error);
            thumbnailData = ""; // Set a default or empty value for thumbnailData
          }

          const doc = {
            audio: {
              url: `${tmpDir}/${title}.mp3`,
            },
            mimetype: "audio/mp4",
            fileName: `${title}`,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                mediaType: 2,
                mediaUrl: url,
                title: title,
                body: wm,
                sourceUrl: url,
                thumbnail: thumbnailData, // Use the fetched thumbnail data
              },
            },
          };

          await client.sendMessage(m.chat, doc, { quoted: m });

          fs.unlink(`${tmpDir}/${title}.mp3`, (err) => {
            if (err) {
              console.error(`Failed to delete audio file: ${err}`);
            } else {
              console.log(`Deleted audio file: ${tmpDir}/${title}.mp3`);
            }
          });
          break;

        case "weather":
        case "utabiri":
          client.sendMessage(from, { react: { text: "🌏", key: m.key } });
          if (!args[0]) return reply("Enter your location to search weather.");
          myweather = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${args.join(
              " "
            )}&units=metric&appid=e409825a497a0c894d2dd975542234b0&language=tr`
          );

          const weathertext = `           🌤 *Weather Report* 🌤  \n\n🔎 *Search Location:* ${myweather.data.name}\n*💮 Country:* ${myweather.data.sys.country}\n🌈 *Weather:* ${myweather.data.weather[0].description}\n🌡️ *Temperature:* ${myweather.data.main.temp}°C\n❄️ *Minimum Temperature:* ${myweather.data.main.temp_min}°C\n📛 *Maximum Temperature:* ${myweather.data.main.temp_max}°C\n💦 *Humidity:* ${myweather.data.main.humidity}%\n🎐 *Wind:* ${myweather.data.wind.speed} km/h\n`;
          client.sendMessage(
            from,
            {
              video: {
                url: "https://media.tenor.com/bC57J4v11UcAAAPo/weather-sunny.mp4",
              },
              gifPlayback: true,
              caption: weathertext,
            },
            { quoted: m }
          );

          break;

        case "short":
          if (!text) m.reply("*Please provide a URL or link to shorten.*");
          axios
            .get(`https://tinyurl.com/api-create.php?url=${text}`)
            .then(function (response) {
              const deta = `*SHORT URL CREATED!!*\n\n*Original Link:*\n${text}\n*Shortened URL:*\n${response.data}`;
              m.reply(deta);
            });

          break;

        case "s":
        case "sticker":
        case "stiker":
        case "stk":
        case "st":
          {
            if (!quoted)
              return m.reply(
                `Send/Reply Images/Videos/Gifs With Captions ${
                  prefix + command
                }\nVideo Duration 1-9 Seconds`
              );

            if (/image/.test(mime)) {
              let media = await quoted.download();
              let encmedia = await client.sendImageAsSticker(m.chat, media, m, {
                packname: global.packname,
                author: global.author,
              });
            } else if (/video/.test(mime)) {
              if ((quoted.msg || quoted).seconds > 11)
                return m.reply(
                  "Send/Reply Images/Videos/Gifs With Captions ${prefix+command}\nVideo Duration 1-9 Seconds"
                );
              let media = await quoted.download();
              let encmedia = await client.sendVideoAsSticker(m.chat, media, m, {
                packname: "GSS",
                author: "Goutam",
              });
            } else {
              m.reply(
                `Send/Reply Images/Videos/Gifs With Captions ${
                  prefix + command
                }\nVideo Duration 1-9 Seconds`
              );
            }
          }
          break;

        case "bug":
        case "request":
        case "report":
        case "taarifa":
        case "ombi":
          {
            if (!text)
              return m.reply(
                `Example : ${
                  prefix + command
                } hi developer play command is not working`
              );
            textt = `*| REQUEST/BUG |*`;
            teks1 = `\n\n*User* : @${
              m.sender.split("@")[0]
            }\n*Request/Bug* : ${text}`;
            teks2 = `\n\n*Hii ${pushname},You request has been forwarded to my Owners*.\n*Please wait...*`;
            for (let i of owner) {
              client.sendMessage(
                i + "@s.whatsapp.net",
                {
                  text: textt + teks1,
                  mentions: [m.sender],
                },
                {
                  quoted: m,
                }
              );
            }
            client.sendMessage(
              m.chat,
              {
                text: textt + teks2 + teks1,
                mentions: [m.sender],
              },
              {
                quoted: m,
              }
            );
          }
          break;

        case "ai":
        case "gpt":
          const think = await client.sendMessage(m.chat, {
            text: "Thinking...",
          });

          try {
            if (!process.env.OPENAI_API_KEY)
              return reply("Aabe Api key to dal de");
            if (!text)
              return reply(
                `*Chat With ChatGPT*\n\n*𝙴xample usage*\n*◉ ${
                  prefix + command
                } Hello*\n*◉ ${
                  prefix + command
                } write a hello world program in python*`
              );

            const configuration = new Configuration({
              apiKey: process.env.OPENAI_API_KEY,
            });
            const openai = new OpenAIApi(configuration);

            const response = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: text }],
            });
            // m.reply(`${response.data.choices[0].message.content}`);
            await client.relayMessage(
              m.chat,
              {
                protocolMessage: {
                  key: think.key,
                  type: 14,
                  editedMessage: {
                    conversation: response.data.choices[0].message.content,
                  },
                },
              },
              {}
            );
          } catch (error) {
            if (error.response) {
              console.log(error.response.status);
              console.log(error.response.data);
              console.log(`${error.response.status}\n\n${error.response.data}`);
            } else {
              console.log(error);
              m.reply("Erroring :" + error.message);
            }
          }
          break;

        case "dall":
        case "img":
        case "image":
        case "dalle":
        case "pic":
        case "picha":
          if (!text)
            throw `*This command generates image with Dall-E*\n\n*𝙴xample usage*\n*◉ ${
              prefix + command
            } Beautiful animegirl*\n*◉ ${
              prefix + command
            } diamond platnum in pink output*`;

          try {
            m.reply("*Please hold, generating images...*");
            const configuration = new Configuration({
              apiKey: process.env.OPENAI_API_KEY,
            });
            const openai = new OpenAIApi(configuration);
            const response = await openai.createImage({
              prompt: text,
              n: 1,
              size: "512x512",
            });
            //console.log(response.data.data[0].url)
            client.sendImage(from, response.data.data[0].url, text, mek);
          } catch (error) {
            if (error.response) {
              console.log(error.response.status);
              console.log(error.response.data);
              console.log(`${error.response.status}\n\n${error.response.data}`);
            } else {
              console.log(error);
              m.reply("Erroring :" + error.message);
            }
          }
          break;
        case "sc":
        case "script":
        case "scbot":
        case "rep":
        case "repository":
          // m.reply("https://github.com/MatrixCoder0101/GSS-Botwa");
          let api = "https://api.github.com/repos/SAM-OCHU/Kibalanga-Bot";
          axios.get(api).then(function (response) {
            github = response.data;
            let txt = `                                                           *K I B A L A N G A  -  S C R I P T*\n\n`;
            txt += `◦  *Name* : *${github.name}*\n`;
            txt += `◦  *Visitor* : ${github.watchers_count}\n`;
            txt += `◦  *Size* : ${(github.size / 1024).toFixed(2)} MB\n`;
            txt += `◦  *Updated* : ${moment(github.updated_at).format(
              "DD/MM/YY"
            )}\n`;
            txt += `◦  *Url* : ${github.html_url}\n\n`;
            txt += `${github.forks_count} Forks · ${github.stargazers_count} Stars · ${github.open_issues_count} Issues\n\n`;
            txt += "*SAM-OCHU*";
            client.relayMessage(
              m.chat,
              {
                requestPaymentMessage: {
                  currencyCodeIso4217: "INR",
                  amount1000: "9999999999",
                  requestFrom: "0@s.whatsapp.net",
                  noteMessage: {
                    extendedTextMessage: {
                      text: txt,
                      contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                          showAdAttribution: true,
                        },
                      },
                    },
                  },
                },
              },
              {}
            );
          });
          break;
        case "ahegao":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/ahegao.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "ass":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/ass.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "bdsm":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/bdsm.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "milf":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/milf.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "blowjob":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/blowjob.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "cuckold":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/cuckold.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "cum":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/cum.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "eba":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/eba.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "ero":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/pussy.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "femdom":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/femdom.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "foot":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/foot.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "gangbang":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/gangbang.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "glasses":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/glasses.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "hentai":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/hentai.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "jahy":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/jahy.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "manga":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/manga.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "masturbation":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/masturbation.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "neko-hentai":
        case "neko":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/neko.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "neko-hentai2":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/neko2.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "nsfwloli":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/nsfwloli.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "orgy":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/orgy.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "panties":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/panties.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "pussy":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/pussy.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "tentacles":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/tentacles.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "thighs":
        case "trap":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/thighs.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "yuri":
          loading();
          var botwansfw = JSON.parse(fs.readFileSync("./media/nsfw/yuri.json"));
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;
        case "zettai":
          loading();
          var botwansfw = JSON.parse(
            fs.readFileSync("./media/nsfw/zattai.json")
          );
          var nsfwresult = pickRandom(botwansfw);
          client.sendImage(from, nsfwresult, pushname, mek);
          break;

        case "gifblowjob":
          //if (!m.isGroup) return m.reply("only work in group");
          //if xufufzitx
          loading();
          let assss = await axios.get("https://api.waifu.pics/nsfw/blowjob");
          var bobuff = await fetchBuffer(assss.data.url);
          var bogif = await buffergif(bobuff);
          await client
            .sendMessage(
              m.chat,
              { video: bogif, gifPlayback: true },
              { quoted: m }
            )
            .catch((err) => {});
          break;

        default: {
          if (isCmd && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(
                chalk.black(chalk.bgRed("[ ERROR ]")),
                color("command", "turquoise"),
                color(`${prefix}${command}`, "turquoise"),
                color("tidak tersedia", "turquoise")
              );
            } else if (argsLog || (isCmd && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(
                chalk.black(chalk.bgRed("[ ERROR ]")),
                color("command", "turquoise"),
                color(`${prefix}${command}`, "turquoise"),
                color("tidak tersedia", "turquoise")
              );
            }
          }
        }
      }
    } else {
      if (process.env.CHAT_BOT || "true" === "false") {
        // Load custom prompt from file
        const customPrompt = fs.readFileSync("custom_prompt.txt", "utf-8");
        //if (!isCmd) return;
        // Create OpenAI API client

        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        // Create chat completion request using previous messages from chat history
        const messages = [
          { role: "system", content: customPrompt },
          ...(chatHistory[m.sender]?.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })) || []),
          { role: "user", content: text },
        ];

        // Use OpenAI to generate response based on chat history and incoming message
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages,
        });

        // Update chat history with incoming message and OpenAI-generated response
        updateChatHistory(m.sender, { role: "user", content: text });
        updateChatHistory(m.sender, {
          role: "assistant",
          content: response.data.choices[0].message.content,
        });

        // Reply to the incoming message with OpenAI-generated response
        m.reply(`${response.data.choices[0].message.content}`);
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
