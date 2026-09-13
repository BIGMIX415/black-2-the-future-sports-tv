# BLACK 2 THE FUTURE SPORTS TV

A responsive retro-sports streaming interface built with React and Vite. Its Superbox-style digital guide turns 17,206 public videos into individually numbered DTV channels, organized under 20 YouTube source banks. Playback is embedded from each creator's official YouTube uploads; videos are never copied or rehosted.

Every catalog entry receives a stable number in the current lineup (`DTV 00001`–`DTV 17206`). Viewers can search by channel number, title, team, sport, era, or creator, then tune directly from the guide or surf with the TV's physical DTV channel buttons.

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
