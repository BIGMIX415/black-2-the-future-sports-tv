import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { channels, getUploadsUrl } from '../src/channels.js'

const outputDirectory = resolve('public/catalog')
const concurrency = 3

await mkdir(outputDirectory, { recursive: true })

function scrapeChannel(channel) {
  return new Promise((resolveChannel, rejectChannel) => {
    const process = spawn(
      'uvx',
      ['yt-dlp', '--flat-playlist', '--dump-json', getUploadsUrl(channel)],
      { shell: true, windowsHide: true },
    )

    let stdout = ''
    let stderr = ''
    process.stdout.setEncoding('utf8')
    process.stderr.setEncoding('utf8')
    process.stdout.on('data', (chunk) => { stdout += chunk })
    process.stderr.on('data', (chunk) => { stderr += chunk })
    process.on('error', rejectChannel)
    process.on('close', (code) => {
      if (code !== 0) {
        rejectChannel(new Error(`${channel.name}: ${stderr.trim() || `yt-dlp exited with ${code}`}`))
        return
      }

      const videos = stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .filter((video) => /^[\w-]{11}$/.test(video.id || ''))
        .map((video) => ({
          id: video.id,
          title: video.title || 'Untitled archive video',
          duration: Number.isFinite(video.duration) ? video.duration : null,
          published: video.upload_date || video.release_date || null,
        }))

      resolveChannel({ channel, videos })
    })
  })
}

async function worker(queue, results) {
  while (queue.length) {
    const channel = queue.shift()
    const result = await scrapeChannel(channel)
    await writeFile(
      resolve(outputDirectory, `${channel.id}.json`),
      JSON.stringify({
        channelId: channel.channelId,
        channelName: channel.fullName || channel.name,
        uploadsPlaylist: `UU${channel.channelId.slice(2)}`,
        count: result.videos.length,
        videos: result.videos,
      }),
    )
    results.push({ id: channel.id, name: channel.name, count: result.videos.length })
    console.log(`${channel.number} ${channel.name}: ${result.videos.length} videos`)
  }
}

const queue = [...channels]
const results = []
await Promise.all(Array.from({ length: concurrency }, () => worker(queue, results)))
results.sort((a, b) => channels.findIndex((channel) => channel.id === a.id) - channels.findIndex((channel) => channel.id === b.id))

await writeFile(
  resolve(outputDirectory, 'index.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), channels: results }),
)

console.log(`Catalog complete: ${results.reduce((total, channel) => total + channel.count, 0)} videos across ${results.length} channels.`)
