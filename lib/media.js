import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import ytDlp from 'yt-dlp-exec';

ffmpeg.setFfmpegPath(ffmpegPath.path);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmp = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

const rand = () => Math.floor(Math.random() * 1000000);

export const toSticker = async (buffer, packname = 'BoDENOO', author = 'XMD') => {
  const input = path.join(tmp, `${rand()}.png`);
  const output = path.join(tmp, `${rand()}.webp`);
  
  await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile(input);
  
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        '-vcodec', 'libwebp',
        '-vf', "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000,setsar=1",
        '-lossless', '1',
        '-compression_level', '6',
        '-qscale', '1',
        '-metadata', `title=${packname}`,
        '-metadata', `author=${author}`
      ])
      .save(output)
      .on('end', () => {
        const buff = fs.readFileSync(output);
        fs.unlinkSync(input);
        fs.unlinkSync(output);
        resolve(buff);
      })
      .on('error', reject);
  });
};

export const toImage = async (webpBuffer) => {
  const input = path.join(tmp, `${rand()}.webp`);
  const output = path.join(tmp, `${rand()}.png`);
  fs.writeFileSync(input, webpBuffer);
  
  return new Promise((resolve, reject) => {
    ffmpeg(input).toFormat('png').save(output)
      .on('end', () => {
        const buff = fs.readFileSync(output);
        fs.unlinkSync(input);
        fs.unlinkSync(output);
        resolve(buff);
      })
      .on('error', reject);
  });
};

export const ytmp3 = async (url) => {
  const out = path.join(tmp, `${rand()}.mp3`);
  await ytDlp(url, { extractAudio: true, audioFormat: 'mp3', audioQuality: 0, output: out });
  const buff = fs.readFileSync(out);
  fs.unlinkSync(out);
  return buff;
};

export const ytmp4 = async (url, quality = '720') => {
  const out = path.join(tmp, `${rand()}.mp4`);
  await ytDlp(url, { format: `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`, mergeOutputFormat: 'mp4', output: out });
  const buff = fs.readFileSync(out);
  fs.unlinkSync(out);
  return buff;
};

export const toMp4 = async (gifBuffer) => {
  const input = path.join(tmp, `${rand()}.gif`);
  const output = path.join(tmp, `${rand()}.mp4`);
  fs.writeFileSync(input, gifBuffer);
  
  return new Promise((resolve, reject) => {
    ffmpeg(input).outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2']).save(output)
      .on('end', () => {
        const buff = fs.readFileSync(output);
        fs.unlinkSync(input);
        fs.unlinkSync(output);
        resolve(buff);
      })
      .on('error', reject);
  });
};
