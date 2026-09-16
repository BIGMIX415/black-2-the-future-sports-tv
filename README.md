# BLACK 2 THE FUTURE SPORTS TV

A responsive retro-sports streaming interface built with React and Vite. Its Superbox-style digital guide turns 21,499 public videos into individually numbered DTV channels, organized under 23 YouTube source banks. Playback is embedded from each creator's official YouTube uploads; videos are never copied or rehosted.

Every catalog entry receives a stable number in the current lineup (`DTV 00001`–`DTV 21499`). Viewers can choose a creator from the Source Directory, enter an exact number in Quick Tune, search by channel number, title, team, sport, era, or creator, then surf with the TV's physical DTV channel buttons.

The live experience turns that library into 1,500 continuously scheduled sports channels. Each station has a deterministic three-hour now/next lineup, a live local clock, direct channel tuning, join-in-progress playback, and muted autoplay with an optional sound control. Sports On Demand keeps all 21,499 events individually searchable and playable at any time.

The 1,500-channel guide is a programmed streaming lineup built from the embedded YouTube archive, not a claim of 1,500 third-party broadcast feeds. Availability remains subject to each video's YouTube embed settings and rights holder.

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
