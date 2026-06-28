import chalk from 'chalk';
import axios from 'axios';

export const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export const isUrl = (url) => {
  return /^https?:\/\/(www\.)?.+/.test(url);
};

export const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' + sizes[i];
};

export const reply = async (sock, m, text) => {
  return await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
};

export const sendImage = async (sock, jid, url, caption = '', quoted) => {
  return await sock.sendMessage(jid, { image: { url }, caption }, { quoted });
};

export const sendVideo = async (sock, jid, url, caption = '', quoted) => {
  return await sock.sendMessage(jid, { video: { url }, caption }, { quoted });
};

export const sendAudio = async (sock, jid, url, quoted) => {
  return await sock.sendMessage(jid, { audio: { url }, mimetype: 'audio/mpeg', ptt: false }, { quoted });
};

export const sendSticker = async (sock, jid, buffer, quoted) => {
  return await sock.sendMessage(jid, { sticker: buffer }, { quoted });
};

export const downloadMedia = async (message) => {
  const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
  const type = Object.keys(message)[0];
  const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
};

export const log = (text, color = 'green') => {
  console.log(chalk[color](`[BoDENOO] ${text}`));
};

// Fonts generator for /fonts commands
export const fonts = {
  bold: (text) => text.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 120211)).join(''),
  italic: (text) => text.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 120201)).join(''),
  mono: (text) => text.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 120734)).join(''),
  script: (text) => text.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 120167)).join('')
};
