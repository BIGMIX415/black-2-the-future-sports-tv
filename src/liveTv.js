export const LIVE_CHANNEL_COUNT = 1500
export const LIVE_SLOT_MS = 3 * 60 * 60 * 1000

const channelFamilies = [
  { sport: 'Football', name: 'Gridiron Vault', pattern: /nfl|football|bowl|ncaa|super bowl|afc|nfc/i },
  { sport: 'Basketball', name: 'Hardwood Classics', pattern: /nba|basketball|hoops|final four/i },
  { sport: 'Baseball', name: 'Diamond Replay', pattern: /mlb|baseball|world series|nlcs|alcs/i },
  { sport: 'Hockey', name: 'Frozen Classics', pattern: /nhl|hockey|stanley cup|frozen four|shl/i },
  { sport: 'Boxing', name: 'Ringside 24/7', pattern: /boxing|fight|heavyweight|middleweight|welterweight|lightweight|featherweight|knockout|ringside/i },
  { sport: 'College', name: 'Campus Sports Network', pattern: /ncaa|college|bowl|tournament/i },
  { sport: 'Championships', name: 'Title Game TV', pattern: /final|championship|playoff|world series|super bowl|stanley cup/i },
  { sport: 'All Sports', name: 'Sports Time Machine', pattern: null },
]

const eventSportPatterns = [
  ['Boxing', /boxing|fight|heavyweight|middleweight|welterweight|lightweight|featherweight|knockout|ringside/i],
  ['Hockey', /nhl|hockey|stanley cup|frozen four|shl/i],
  ['Baseball', /mlb|baseball|world series|nlcs|alcs|mets|yankees|braves|dodgers|cardinals|cubs|red sox/i],
  ['Basketball', /nba|basketball|hoops|final four|bulls|lakers|celtics|knicks|rockets/i],
  ['Football', /nfl|football|bowl|super bowl|afc|nfc|touchdown/i],
]

export function inferEventSport(title, sourceSport = 'All Sports') {
  const detected = eventSportPatterns.find(([, pattern]) => pattern.test(title || ''))
  if (detected) return detected[0]
  return sourceSport === 'All Sports' ? 'All Sports' : sourceSport
}

function hashNumber(value) {
  let hash = 2166136261
  const input = String(value)
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function matchesFamily(station, family) {
  if (!family.pattern) return true
  const searchable = `${station.title} ${station.source.name} ${station.source.sport}`
  return family.pattern.test(searchable)
}

export function buildLiveChannels(catalog) {
  if (!catalog.length) return []

  const pools = channelFamilies.map((family) => {
    const matches = catalog.filter((station) => matchesFamily(station, family))
    return matches.length ? matches : catalog
  })

  return Array.from({ length: LIVE_CHANNEL_COUNT }, (_, index) => {
    const number = index + 1
    const familyIndex = index % channelFamilies.length
    const family = channelFamilies[familyIndex]
    const edition = Math.floor(index / channelFamilies.length) + 1
    return {
      id: `live-${String(number).padStart(4, '0')}`,
      number,
      name: `${family.name} ${String(edition).padStart(3, '0')}`,
      sport: family.sport,
      pool: pools[familyIndex],
      seed: hashNumber(`${number}:${family.name}`),
    }
  })
}

export function getLiveProgram(channel, timestamp = Date.now()) {
  if (!channel?.pool?.length) return null
  const slot = Math.floor(timestamp / LIVE_SLOT_MS)
  const slotStart = slot * LIVE_SLOT_MS
  const currentIndex = (channel.seed + slot) % channel.pool.length
  const nextIndex = (currentIndex + 1 + (channel.number % 7)) % channel.pool.length
  const current = channel.pool[currentIndex]
  const next = channel.pool[nextIndex]
  const elapsedSeconds = Math.max(0, Math.floor((timestamp - slotStart) / 1000))
  const safeDuration = Number.isFinite(current.duration) && current.duration > 120 ? current.duration : LIVE_SLOT_MS / 1000

  return {
    key: `${channel.id}:${slot}`,
    channel,
    current,
    next,
    slot,
    slotStart,
    slotEnd: slotStart + LIVE_SLOT_MS,
    startSeconds: elapsedSeconds % Math.max(60, Math.floor(safeDuration - 30)),
  }
}

export function formatGuideTime(timestamp) {
  return new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(timestamp)
}

export function formatGuideClock(timestamp) {
  return new Intl.DateTimeFormat([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp)
}
