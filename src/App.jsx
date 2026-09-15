import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Clapperboard,
  Clock,
  ExternalLink,
  Heart,
  ListVideo,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tv,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { categories, channels, eras, getChannelUrl, getThumb } from './channels.js'
import { buildLiveChannels, formatGuideClock, formatGuideTime, getLiveProgram, inferEventSport, LIVE_CHANNEL_COUNT, LIVE_SLOT_MS } from './liveTv.js'
import YouTubePlaylistPlayer from './YouTubePlaylistPlayer.jsx'

function FootballIcon({ size = 24, strokeWidth = 2, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19.4 4.6C15.7.9 8.2 3.1 4.6 6.7S.9 15.7 4.6 19.4s9 .1 12.7-3.5 5.8-7.6 2.1-11.3Z" />
      <path d="m8.2 15.8 7.6-7.6M9.6 10.4l4 4M11.4 8.6l4 4" />
    </svg>
  )
}

function BaseballIcon({ size = 24, strokeWidth = 2, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.2 4.4c1.3 1.8 1.8 3.7 1.6 5.7M4.4 7.2l2.3 1M16.8 19.6c-1.3-1.8-1.8-3.7-1.6-5.7M19.6 16.8l-2.3-1" />
    </svg>
  )
}

const sportIcons = {
  Basketball: CirclePlay,
  Football: FootballIcon,
  Baseball: BaseballIcon,
  Boxing: Sparkles,
  'All Sports': Radio,
}

function Brand() {
  return (
    <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to the player">
      <span className="brand-main">BLACK <b>2</b> THE FUTURE</span>
      <span className="brand-sub">SPORTS TV</span>
    </button>
  )
}

function Navigation({ activeNav, onNavigate, className = '' }) {
  return (
    <nav className={`primary-nav ${className}`} aria-label={className === 'mobile-nav' ? 'Mobile navigation' : 'Primary navigation'}>
      {[
        ['Watch', Tv],
        ['Live TV', Radio],
        ['On Demand', Archive],
        ['My List', Heart],
      ].map(([label, Icon]) => (
        <button key={label} className={activeNav === label ? 'active' : ''} onClick={() => onNavigate(label)}>
          <Icon size={18} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function AppHeader({ activeNav, onNavigate, searching, setSearching, query, setQuery }) {
  return (
    <header className="app-header">
      <Brand />
      <Navigation activeNav={activeNav} onNavigate={onNavigate} className="desktop-nav" />
      <div className={`header-search ${searching ? 'open' : ''}`}>
        {searching && (
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all digital channels…"
            aria-label="Search digital channels"
          />
        )}
        <button
          className="icon-button"
          onClick={() => {
            setSearching((value) => !value)
            if (searching) setQuery('')
          }}
          aria-label={searching ? 'Close search' : 'Search'}
        >
          {searching ? <X size={21} /> : <Search size={21} />}
        </button>
      </div>
    </header>
  )
}

function Antennas() {
  return (
    <div className="antennas" aria-hidden="true">
      <span className="antenna antenna-left" />
      <span className="antenna antenna-right" />
      <span className="antenna-base" />
    </div>
  )
}

function TunerDial({ label, angle = -35, large = false }) {
  return (
    <div className={`tuner-unit ${large ? 'large' : ''}`} aria-hidden="true">
      <span>{label}</span>
      <div className="dial" style={{ '--dial-angle': `${angle}deg` }}>
        <i />
      </div>
    </div>
  )
}

function ChannelDial({ channel, digitalNumber, digitalTotal, onTune, onStepSource, onStepDigital }) {
  const selectedIndex = channels.findIndex((item) => item.id === channel.id)
  const pointerAngle = -150 + (selectedIndex / (channels.length - 1)) * 300

  const handleDialKey = (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault()
      onStepSource(1)
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault()
      onStepSource(-1)
    }
  }

  return (
    <div className="channel-tuner">
      <div className="channel-readout" aria-live="polite">
        <span>DTV</span>
        <strong className="digital-number">{digitalNumber ? String(digitalNumber).padStart(5, '0') : '-----'}</strong>
        <small>SRC {channel.number} · {digitalTotal ? digitalTotal.toLocaleString() : 'SCANNING'}</small>
      </div>
      <div className="source-bank-label">SOURCE BANK</div>
      <div className="channel-selector">
        {channels.map((station, index) => {
          const angle = -150 + (index / (channels.length - 1)) * 300
          return (
            <button
              key={station.id}
              className={`dial-number ${station.id === channel.id ? 'active' : ''}`}
              style={{ '--slot-angle': `${angle}deg`, '--counter-angle': `${-angle}deg` }}
              onClick={() => onTune(station)}
              aria-label={`Tune to channel ${station.number}, ${station.name}`}
            >
              <span>{station.number}</span>
            </button>
          )
        })}
        <button
          className="channel-knob"
          style={{ '--channel-angle': `${pointerAngle}deg` }}
          onClick={() => onStepSource(1)}
          onKeyDown={handleDialKey}
          onWheel={(event) => {
            event.preventDefault()
            onStepSource(event.deltaY > 0 ? 1 : -1)
          }}
          role="slider"
          aria-label="Rotary channel dial"
          aria-valuemin={channels[0].number}
          aria-valuemax={channels.at(-1).number}
          aria-valuenow={channel.number}
          aria-valuetext={`${channel.number}, ${channel.name}`}
          title="Click, scroll, or use arrow keys to change channels"
        >
          <i />
        </button>
      </div>
      <div className="physical-channel-buttons">
        <button onClick={() => onStepDigital(1)} aria-label="Digital channel up"><span>DTV CHANNEL UP</span><ChevronUp size={17} /></button>
        <button onClick={() => onStepDigital(-1)} aria-label="Digital channel down"><span>DTV CHANNEL DOWN</span><ChevronDown size={17} /></button>
      </div>
    </div>
  )
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'ARCHIVE'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = Math.floor(seconds % 60)
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`
}

const liveSports = ['All', 'Football', 'Basketball', 'Baseball', 'Hockey', 'Boxing', 'College', 'Championships']

function LiveChannelRow({ program, selected, onSelect }) {
  const { channel, current, next, slotEnd } = program
  const Icon = sportIcons[channel.sport] || Radio
  return (
    <button className={`live-channel-row ${selected ? 'selected' : ''}`} onClick={() => onSelect(channel)}>
      <span className="live-channel-number">{String(channel.number).padStart(4, '0')}</span>
      <span className="live-channel-mark"><Icon size={16} strokeWidth={1.5} /></span>
      <span className="live-channel-copy">
        <strong>{channel.name}</strong>
        <small><b>NOW</b> {current.title}</small>
      </span>
      <span className="live-next-program">
        <small>{formatGuideTime(slotEnd)}</small>
        <strong>{next.title}</strong>
      </span>
    </button>
  )
}

function LiveTVGuide({ programs, selectedNumber, now, onSelect, liveGuideRef }) {
  const [sport, setSport] = useState('All')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(80)
  const [quickNumber, setQuickNumber] = useState('')

  const filteredPrograms = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return programs.filter((program) => {
      const sportMatch = sport === 'All' || program.channel.sport === sport
      const searchMatch = !needle || `${program.channel.number} ${program.channel.name} ${program.current.title} ${program.next.title}`.toLowerCase().includes(needle)
      return sportMatch && searchMatch
    })
  }, [programs, query, sport])

  useEffect(() => setVisibleCount(80), [sport, query])

  const quickTune = (event) => {
    event.preventDefault()
    const channelNumber = Number.parseInt(quickNumber, 10)
    const program = programs[channelNumber - 1]
    if (!program) return
    onSelect(program.channel)
    setQuickNumber(String(channelNumber).padStart(4, '0'))
  }

  return (
    <aside className="guide-panel live-guide-panel" id="live-tv" ref={liveGuideRef}>
      <div className="guide-heading live-guide-heading">
        <div>
          <h2>LIVE TV GUIDE</h2>
          <p>1,500 programmed sports channels · always on</p>
        </div>
        <div className="guide-clock" aria-label="Current local time"><Clock size={16} /><strong>{formatGuideClock(now)}</strong></div>
      </div>
      <div className="sport-tabs live-sport-tabs" role="tablist" aria-label="Filter live channels by sport">
        {liveSports.map((item) => (
          <button key={item} role="tab" aria-selected={sport === item} className={sport === item ? 'active' : ''} onClick={() => setSport(item)}>{item}</button>
        ))}
      </div>
      <div className="digital-guide-band live-band">
        <span><i /> LIVE SIGNAL</span>
        <strong>{LIVE_CHANNEL_COUNT.toLocaleString()} CHANNELS ON AIR</strong>
      </div>
      <div className="live-guide-tools">
        <label className="guide-search live-search">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Channel, event, team…" aria-label="Search live TV guide" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear live TV search"><X size={14} /></button>}
        </label>
        <form className="live-quick-tune" onSubmit={quickTune}>
          <label htmlFor="live-channel-number">LIVE QUICK TUNE</label>
          <div><input id="live-channel-number" value={quickNumber} onChange={(event) => setQuickNumber(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0001" inputMode="numeric" aria-label="Enter a live channel number" /><button>TUNE</button></div>
        </form>
      </div>
      <div className="live-grid-labels"><span>CHANNEL / NOW</span><span>NEXT</span></div>
      <div className="channel-list live-channel-list">
        {filteredPrograms.slice(0, visibleCount).map((program) => <LiveChannelRow key={program.channel.id} program={program} selected={program.channel.number === selectedNumber} onSelect={onSelect} />)}
        {visibleCount < filteredPrograms.length && <button className="guide-load-more" onClick={() => setVisibleCount((count) => count + 80)}>SHOW 80 MORE · {(filteredPrograms.length - visibleCount).toLocaleString()} CHANNELS REMAINING</button>}
      </div>
      <div className="guide-footer live-guide-footer">
        <div><small>ON AIR</small><span>LIVE {String(selectedNumber).padStart(4, '0')}</span></div>
        <div><small>LOCAL TIME</small><span>{formatGuideClock(now)}</span></div>
      </div>
    </aside>
  )
}

function TVPlayer({ channel, digitalNumber, digitalTotal, requestedStation, tuning, onStepSource, onStepDigital, onTune, onVideoChange, onProgramEnded }) {
  const playerApiRef = useRef(null)
  const [soundOn, setSoundOn] = useState(false)
  const requestedVideoId = requestedStation?.sourceId === channel.id
    ? requestedStation.videoId
    : channel.videoId
  const [videoMeta, setVideoMeta] = useState({
    ready: false,
    error: '',
    index: 0,
    total: 0,
    title: channel.title,
    videoId: channel.videoId,
  })

  useEffect(() => {
    if (!videoMeta.videoId) return
    onVideoChange(channel.id, videoMeta.videoId)
  }, [channel.id, videoMeta.videoId, onVideoChange])

  return (
    <section className="tv-column" id="watch" aria-label="Now playing">
      <div className="tv-wrap">
        <Antennas />
        <div className="tv-cabinet">
          <div className="tv-screen-frame">
            <div className="crt-glass">
              <YouTubePlaylistPlayer
                key={`${channel.id}:${requestedVideoId}:${requestedStation?.scheduleKey || 'ondemand'}`}
                channel={channel}
                initialVideoId={requestedVideoId}
                startSeconds={requestedStation?.startSeconds || 0}
                autoPlay
                muted={!soundOn}
                playerApiRef={playerApiRef}
                onMetaChange={setVideoMeta}
                onEnded={onProgramEnded}
              />
              <div className="scanlines" aria-hidden="true" />
              <div className={`tuning-static ${tuning ? 'active' : ''}`} aria-hidden="true" />
            </div>
          </div>
          <aside className="tv-controls" aria-label="Old-school channel tuner">
            <div className="control-label">VHF · UHF</div>
            <ChannelDial
              channel={channel}
              digitalNumber={digitalNumber}
              digitalTotal={digitalTotal}
              onTune={onTune}
              onStepSource={onStepSource}
              onStepDigital={onStepDigital}
            />
            <TunerDial label="FINE TUNING" angle={channel.number * -7} />
            <div className="speaker-slats">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div>
            <div className="cabinet-badge">B2TF<br /><small>SPORTS TV</small></div>
          </aside>
        </div>
        <div className="autoplay-strip">
          <span><i /> LIVE AUTOPLAY</span>
          <span>Joined in progress · 24/7 programmed stream</span>
          <button onClick={() => {
            const nextSound = !soundOn
            setSoundOn(nextSound)
            playerApiRef.current?.setMuted?.(!nextSound)
            playerApiRef.current?.play?.()
          }}>{soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}{soundOn ? 'SOUND ON' : 'AUTOPLAY MUTED · ENABLE SOUND'}</button>
        </div>
      </div>
    </section>
  )
}

function EraTuner({ era, setEra }) {
  return (
    <div className="era-tuner" aria-label="Choose an era">
      <div className="era-title"><SlidersHorizontal size={16} /><span>ERA TUNER</span></div>
      <div className="era-dial" style={{ '--era-index': eras.indexOf(era) }} aria-hidden="true"><i /></div>
      <div className="era-options">
        {eras.map((item) => (
          <button key={item} className={era === item ? 'active' : ''} onClick={() => setEra(item)}>{item}</button>
        ))}
      </div>
      <button className="era-clear" onClick={() => setEra('')} disabled={!era}>{era ? 'Clear' : 'Any era'}</button>
    </div>
  )
}

function DigitalChannelRow({ station, selected, isFavorite, onSelect, onFavorite }) {
  const stationSport = station.sport || station.source.sport
  const Icon = sportIcons[stationSport] || Radio
  return (
    <div className={`channel-row ${selected ? 'selected' : ''}`}>
      <button className="channel-main digital-channel-main" onClick={() => onSelect(station)}>
        <span className="channel-number digital-guide-number">{String(station.digitalNumber).padStart(5, '0')}</span>
        <span className="sport-mark"><Icon size={17} strokeWidth={1.5} /></span>
        <span className="channel-copy">
          <strong>{station.title}</strong>
          <small>{selected ? 'NOW PLAYING' : `${station.source.name} · ${station.source.era} · ${stationSport}`}</small>
        </span>
        <span className="air-time digital-runtime">{formatDuration(station.duration)}</span>
      </button>
      <button
        className={`row-favorite ${isFavorite ? 'active' : ''}`}
        onClick={() => onFavorite(station.source.id)}
        aria-label={`${isFavorite ? 'Remove' : 'Add'} ${station.source.name} ${isFavorite ? 'from' : 'to'} My List`}
      >
        <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}

function ChannelGuide({ category, setCategory, query, setQuery, sourceDirectory, sourceFilter, onSourceFilter, onQuickTune, digitalChannels, digitalStatus, totalDigital, selectedKey, selectedDigitalNumber, favorites, onSelect, onFavorite, favoritesOnly }) {
  const [visibleCount, setVisibleCount] = useState(80)
  const [quickNumber, setQuickNumber] = useState('')
  const [quickError, setQuickError] = useState('')

  useEffect(() => setVisibleCount(80), [digitalChannels])

  const submitQuickTune = (event) => {
    event.preventDefault()
    const stationNumber = Number.parseInt(quickNumber, 10)
    if (!Number.isInteger(stationNumber) || !onQuickTune(stationNumber)) {
      setQuickError(`Enter 1–${totalDigital.toLocaleString()}`)
      return
    }
    setQuickNumber(String(stationNumber).padStart(5, '0'))
    setQuickError('Tuning now')
  }

  return (
    <aside className="guide-panel on-demand-guide" id="on-demand-guide">
      <div className="guide-heading">
        <div>
          <h2>{favoritesOnly ? 'MY SPORTS LIST' : 'SPORTS ON DEMAND'}</h2>
          <p>{digitalStatus === 'loading' ? 'Scanning every source bank…' : `Pick any event anytime · ${digitalChannels.length.toLocaleString()} of ${totalDigital.toLocaleString()} events`}</p>
        </div>
        <SlidersHorizontal size={20} />
      </div>
      <div className="sport-tabs" role="tablist" aria-label="Filter channel guide by sport">
        {categories.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={category === item}
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
          >
            {item === 'All Sports' ? 'All' : item}
          </button>
        ))}
      </div>
      <div className="digital-guide-band">
        <span><i /> ON-DEMAND LIBRARY</span>
        <strong>{totalDigital ? totalDigital.toLocaleString() : '—'} EVENTS</strong>
      </div>
      <div className="station-finder">
        <label className="source-directory">
          <span><Radio size={13} /> SOURCE DIRECTORY</span>
          <select
            value={sourceFilter}
            onChange={(event) => {
              setQuickNumber('')
              setQuickError('')
              onSourceFilter(event.target.value)
            }}
            aria-label="Find channels by source bank"
          >
            <option value="">ALL {sourceDirectory.length} SOURCE BANKS</option>
            {sourceDirectory.map(({ source, count, first, last }) => (
              <option key={source.id} value={source.id}>
                CH {source.number} · {source.name} · {count.toLocaleString()} DTV {first ? `${String(first).padStart(5, '0')}–${String(last).padStart(5, '0')}` : 'SCANNING'}
              </option>
            ))}
          </select>
        </label>
        <form className="quick-tune" onSubmit={submitQuickTune}>
          <label htmlFor="quick-dtv">QUICK TUNE</label>
          <div>
            <input
              id="quick-dtv"
              value={quickNumber}
              onChange={(event) => { setQuickNumber(event.target.value.replace(/\D/g, '').slice(0, 5)); setQuickError('') }}
              inputMode="numeric"
              placeholder="00001"
              aria-label="Enter a DTV channel number"
            />
            <button type="submit">TUNE</button>
          </div>
          <small aria-live="polite">{quickError || `1–${totalDigital.toLocaleString()}`}</small>
        </form>
      </div>
      <label className="guide-search">
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
            placeholder="Event #, game, team, sport, or creator…"
            aria-label="Search sports on demand"
        />
        {query && <button onClick={() => setQuery('')} aria-label="Clear digital channel search"><X size={14} /></button>}
      </label>
      <div className="channel-list">
        {digitalChannels.length ? digitalChannels.slice(0, visibleCount).map((station) => (
          <DigitalChannelRow
            key={station.key}
            station={station}
            selected={station.key === selectedKey}
            isFavorite={favorites.includes(station.source.id)}
            onSelect={onSelect}
            onFavorite={onFavorite}
          />
        )) : (
          <div className="empty-guide">
            <Star size={28} />
            <strong>{digitalStatus === 'loading' ? 'Scanning digital channels' : 'No channels found'}</strong>
            <span>{digitalStatus === 'error' ? 'The digital catalog could not be loaded.' : 'Try another sport, era, or search.'}</span>
          </div>
        )}
        {visibleCount < digitalChannels.length && (
          <button className="guide-load-more" onClick={() => setVisibleCount((count) => count + 80)}>
            SHOW 80 MORE · {(digitalChannels.length - visibleCount).toLocaleString()} CHANNELS REMAINING
          </button>
        )}
      </div>
      <div className="guide-footer">
        <div><small>NOW PLAYING</small><span>{selectedKey && selectedDigitalNumber ? `EVENT ${String(selectedDigitalNumber).padStart(5, '0')}` : 'Sports archive'}</span></div>
        <div><small>FULL LIBRARY</small><span>{totalDigital.toLocaleString()} events on demand</span></div>
      </div>
    </aside>
  )
}

function ArchiveRail({ channels: railChannels, selectedId, onSelect, archiveRef }) {
  const scrollerRef = useRef(null)
  const scroll = (direction) => scrollerRef.current?.scrollBy({ left: direction * 620, behavior: 'smooth' })

  return (
    <section className="archive-section" id="archive" ref={archiveRef}>
      <div className="section-heading">
        <div>
          <h2>BACK IN THE DAY</h2>
          <p>Every public upload from every station, queued on its official playlist.</p>
        </div>
        <div className="rail-controls">
          <button onClick={() => scroll(-1)} aria-label="Scroll archive left"><ArrowLeft size={19} /></button>
          <button onClick={() => scroll(1)} aria-label="Scroll archive right"><ArrowRight size={19} /></button>
        </div>
      </div>
      <div className="poster-rail" ref={scrollerRef}>
        {railChannels.map((channel) => (
          <button key={channel.id} className={`poster-card ${selectedId === channel.id ? 'selected' : ''}`} onClick={() => onSelect(channel)}>
            <img src={getThumb(channel)} alt="" loading="lazy" />
            <span className="poster-shade" />
            <span className="poster-era">ALL UPLOADS · {channel.era}</span>
            <span className="poster-play"><CirclePlay size={29} fill="currentColor" /></span>
            <span className="poster-copy">
              <strong>{channel.title}</strong>
              <small>{channel.name} · Ch. {channel.number}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [selectedId, setSelectedId] = useState('mdbball')
  const [selectedDigitalKey, setSelectedDigitalKey] = useState('mdbball:o5lWDUeyatI')
  const [selectedLiveNumber, setSelectedLiveNumber] = useState(1)
  const [clock, setClock] = useState(() => Date.now())
  const [requestedStation, setRequestedStation] = useState(null)
  const [digitalCatalog, setDigitalCatalog] = useState([])
  const [digitalStatus, setDigitalStatus] = useState('loading')
  const [category, setCategory] = useState('All Sports')
  const [era, setEra] = useState('')
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [searching, setSearching] = useState(false)
  const [tuning, setTuning] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [activeNav, setActiveNav] = useState('Watch')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('b2tf-favorites')) || [] } catch { return [] }
  })
  const playerRef = useRef(null)
  const liveGuideRef = useRef(null)
  const onDemandRef = useRef(null)
  const switchTimer = useRef(null)
  const liveStarted = useRef(false)

  const selected = channels.find((channel) => channel.id === selectedId) || channels[0]
  const digitalByKey = useMemo(() => new Map(digitalCatalog.map((station) => [station.key, station])), [digitalCatalog])
  const activeDigitalStation = digitalByKey.get(selectedDigitalKey)
  const liveChannels = useMemo(() => buildLiveChannels(digitalCatalog), [digitalCatalog])
  const liveSlot = Math.floor(clock / LIVE_SLOT_MS)
  const livePrograms = useMemo(() => {
    const scheduleMoment = liveSlot * LIVE_SLOT_MS + 1000
    return liveChannels.map((channel) => getLiveProgram(channel, scheduleMoment))
  }, [liveChannels, liveSlot])
  const sourceDirectory = useMemo(() => {
    const directory = new Map(channels.map((source) => [source.id, { source, count: 0, first: null, last: null }]))
    digitalCatalog.forEach((station) => {
      const entry = directory.get(station.source.id)
      entry.count += 1
      entry.first ??= station.digitalNumber
      entry.last = station.digitalNumber
    })
    return channels.map((source) => directory.get(source.id))
  }, [digitalCatalog])

  const visibleDigitalChannels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return digitalCatalog.filter((station) => {
      const { source } = station
      const categoryMatch = category === 'All Sports' || station.sport === category
      const eraMatch = !era || source.era === era
      const paddedNumber = String(station.digitalNumber).padStart(5, '0')
      const queryMatch = !normalizedQuery || `${station.digitalNumber} ${paddedNumber} ${station.title} ${source.name} ${source.fullName || ''} ${station.sport} ${source.sport}`.toLowerCase().includes(normalizedQuery)
      const favoriteMatch = !favoritesOnly || favorites.includes(source.id)
      const sourceMatch = !sourceFilter || source.id === sourceFilter
      return categoryMatch && eraMatch && queryMatch && favoriteMatch && sourceMatch
    })
  }, [digitalCatalog, category, era, query, sourceFilter, favoritesOnly, favorites])

  useEffect(() => {
    const controller = new AbortController()
    setDigitalStatus('loading')

    Promise.all(channels.map((source) => (
      fetch(`${import.meta.env.BASE_URL}catalog/${source.id}.json`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`)
          return response.json()
        })
        .then((data) => ({ source, videos: Array.isArray(data.videos) ? data.videos : [] }))
    )))
      .then((sourceCatalogs) => {
        let digitalNumber = 0
        const stations = sourceCatalogs.flatMap(({ source, videos }) => videos.map((video) => ({
          ...video,
          source,
          sport: inferEventSport(video.title, source.sport),
          key: `${source.id}:${video.id}`,
          digitalNumber: ++digitalNumber,
        })))
        setDigitalCatalog(stations)
        setDigitalStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setDigitalStatus('error')
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    localStorage.setItem('b2tf-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => () => clearTimeout(switchTimer.current), [])

  const selectChannel = (channel) => {
    if (channel.id === selectedId) {
      document.getElementById('watch')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    clearTimeout(switchTimer.current)
    setRequestedStation(null)
    setTuning(true)
    switchTimer.current = setTimeout(() => {
      setSelectedId(channel.id)
      setTuning(false)
    }, 380)
  }

  const stepChannel = (direction) => {
    const index = channels.findIndex((channel) => channel.id === selectedId)
    const next = channels[(index + direction + channels.length) % channels.length]
    selectChannel(next)
  }

  const tuneDigitalStation = (station) => {
    clearTimeout(switchTimer.current)
    setTuning(true)
    switchTimer.current = setTimeout(() => {
      setSelectedId(station.source.id)
      setSelectedDigitalKey(station.key)
      setRequestedStation({
        sourceId: station.source.id,
        videoId: station.id,
        token: `${station.key}:${Date.now()}`,
      })
      setTuning(false)
      document.getElementById('watch')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 380)
  }

  const tuneDigitalNumber = (number) => {
    const station = digitalCatalog[number - 1]
    if (!station) return false
    setSourceFilter('')
    setCategory('All Sports')
    setEra('')
    setQuery('')
    setFavoritesOnly(false)
    tuneDigitalStation(station)
    return true
  }

  const selectSourceFilter = (sourceId) => {
    setSourceFilter(sourceId)
    setCategory('All Sports')
    setEra('')
    setQuery('')
    setFavoritesOnly(false)
    const firstStation = digitalCatalog.find((station) => station.source.id === sourceId)
    if (firstStation) tuneDigitalStation(firstStation)
  }

  const tuneLiveChannel = (liveChannel, shouldScroll = true) => {
    const program = getLiveProgram(liveChannel, Date.now())
    if (!program) return
    clearTimeout(switchTimer.current)
    setTuning(true)
    switchTimer.current = setTimeout(() => {
      setSelectedLiveNumber(liveChannel.number)
      setSelectedId(program.current.source.id)
      setSelectedDigitalKey(program.current.key)
      setRequestedStation({
        sourceId: program.current.source.id,
        videoId: program.current.id,
        startSeconds: program.startSeconds,
        scheduleKey: program.key,
        token: `${program.key}:${Date.now()}`,
      })
      setTuning(false)
      if (shouldScroll) document.getElementById('watch')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, liveStarted.current ? 380 : 0)
    liveStarted.current = true
  }

  const stepLiveChannel = (direction) => {
    if (!liveChannels.length) return
    const nextIndex = (selectedLiveNumber - 1 + direction + liveChannels.length) % liveChannels.length
    tuneLiveChannel(liveChannels[nextIndex])
  }

  const handleVideoChange = React.useCallback((sourceId, videoId) => {
    setSelectedDigitalKey(`${sourceId}:${videoId}`)
  }, [])

  const handleProgramEnded = React.useCallback(() => {
    const liveChannel = liveChannels[selectedLiveNumber - 1]
    const program = getLiveProgram(liveChannel, Date.now())
    if (!program?.next) return
    setSelectedId(program.next.source.id)
    setSelectedDigitalKey(program.next.key)
    setRequestedStation({
      sourceId: program.next.source.id,
      videoId: program.next.id,
      startSeconds: 0,
      scheduleKey: `${program.key}:next`,
      token: `${program.next.key}:${Date.now()}`,
    })
  }, [liveChannels, selectedLiveNumber])

  useEffect(() => {
    if (!liveChannels.length) return
    const currentChannel = liveChannels[selectedLiveNumber - 1] || liveChannels[0]
    const scheduled = getLiveProgram(currentChannel, Date.now())
    if (!liveStarted.current || requestedStation?.scheduleKey?.split(':next')[0] !== scheduled?.key) {
      tuneLiveChannel(currentChannel, false)
    }
  }, [liveChannels, liveSlot])

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const navigate = (label) => {
    setActiveNav(label)
    if (label === 'My List') {
      setFavoritesOnly(true)
      setCategory('All Sports')
      setEra('')
      setSourceFilter('')
      setTimeout(() => onDemandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      return
    }
    setFavoritesOnly(false)
    const refs = { Watch: playerRef, 'Live TV': liveGuideRef, 'On Demand': onDemandRef }
    refs[label]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <AppHeader
        activeNav={activeNav}
        onNavigate={navigate}
        searching={searching}
        setSearching={setSearching}
        query={query}
        setQuery={setQuery}
      />

      <main>
        <div className="broadcast-grid" ref={playerRef}>
          <div>
            <TVPlayer
              channel={selected}
              digitalNumber={selectedLiveNumber}
              digitalTotal={LIVE_CHANNEL_COUNT}
              requestedStation={requestedStation}
              tuning={tuning}
              onStepSource={stepChannel}
              onStepDigital={stepLiveChannel}
              onTune={selectChannel}
              onVideoChange={handleVideoChange}
              onProgramEnded={handleProgramEnded}
            />
            <div className="tuner-row">
              <EraTuner era={era} setEra={setEra} />
            </div>
          </div>
          <LiveTVGuide programs={livePrograms} selectedNumber={selectedLiveNumber} now={clock} onSelect={tuneLiveChannel} liveGuideRef={liveGuideRef} />
        </div>

        <section className="on-demand-section" id="on-demand" ref={onDemandRef}>
          <ChannelGuide
              category={category}
              setCategory={setCategory}
              query={query}
              setQuery={setQuery}
              sourceDirectory={sourceDirectory}
              sourceFilter={sourceFilter}
              onSourceFilter={selectSourceFilter}
              onQuickTune={tuneDigitalNumber}
              digitalChannels={visibleDigitalChannels}
              digitalStatus={digitalStatus}
              totalDigital={digitalCatalog.length}
              selectedKey={selectedDigitalKey}
              selectedDigitalNumber={activeDigitalStation?.digitalNumber}
              favorites={favorites}
              onSelect={tuneDigitalStation}
              onFavorite={toggleFavorite}
              favoritesOnly={favoritesOnly}
          />
        </section>

        <section className="mission-strip">
          <Clapperboard size={28} />
          <p><strong>THE GAMES NEVER LEFT.</strong> We just put the antenna back up.</p>
          <a href={getChannelUrl(selected)} target="_blank" rel="noreferrer">Visit {selected.name} <ExternalLink size={15} /></a>
        </section>
      </main>

      <footer>
        <Brand />
        <p>Independent viewer interface. All video streams, titles, and thumbnails remain with their respective YouTube creators and rights holders.</p>
        <span>Built for the tape-traders, stat-keepers, and fans who remember.</span>
      </footer>

      <Navigation activeNav={activeNav} onNavigate={navigate} className="mobile-nav" />

    </div>
  )
}
