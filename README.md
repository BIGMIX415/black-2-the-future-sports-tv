# BLACK 2 THE FUTURE SPORTS TV

A responsive retro-sports streaming interface built with React and Vite. It tunes the 19 supplied YouTube channels through their official uploads playlists. The searchable local catalog currently indexes 15,774 public videos; playback is embedded from YouTube and videos are never copied or rehosted.

Live site: <https://bigmix415.github.io/black-2-the-future-sports-tv/>

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Refresh the complete video catalog

The generated metadata lives in `public/catalog`. Refresh it from every official uploads playlist with `uv`/`uvx` installed:

```bash
npm run update:catalog
```

Channel metadata lives in `src/channels.js`. Add or replace a station with its YouTube channel ID and a representative public video ID, then regenerate the catalog.
