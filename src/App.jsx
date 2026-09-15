import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Clapperboard,
  ExternalLink,
  Heart,
  ListVideo,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tv,
  X,
} from 'lucide-react'
import { categories, channels, eras, getChannelUrl, getThumb } from './channels.js'
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
        ['Guide', ListVideo],
        ['Archive', Archive],
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

function TVPlayer({ channel, digitalNumber, digitalTotal, requestedStation, tuning, onStepSource, onStepDigital, onTune, onVideoChange }) {
  const playerApiRef = useRef(null)
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
                key={`${channel.id}:${requestedVideoId}`}
                channel={channel}
                initialVideoId={requestedVideoId}
                playerApiRef={playerApiRef}
                onMetaChange={setVideoMeta}
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
  const Icon = sportIcons[station.source.sport] || Radio
  return (
    <div className={`channel-row ${selected ? 'selected' : ''}`}>
      <button className="channel-main digital-channel-main" onClick={() => onSelect(station)}>
        <span className="channel-number digital-guide-number">{String(station.digitalNumber).padStart(5, '0')}</span>
        <span className="sport-mark"><Icon size={17} strokeWidth={1.5} /></span>
        <span className="channel-copy">
          <strong>{station.title}</strong>
          <small>{selected ? 'NOW PLAYING' : `${station.source.name} · ${station.source.era} · ${station.source.sport}`}</small>
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

function ChannelGuide({ category, setCategory, query, setQuery, sourceDirectory, sourceFilter, onSourceFilter, onQuickTune, digitalChannels, digitalStatus, totalDigital, selectedKey, selectedDigitalNumber, favorites, onSelect, onFavorite, guideRef, favoritesOnly }) {
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
    <aside className="guide-panel" id="guide" ref={guideRef}>
      <div className="guide-heading">
        <div>
          <h2>{favoritesOnly ? 'MY DIGITAL LIST' : 'DIGITAL CHANNEL GUIDE'}</h2>
          <p>{digitalStatus === 'loading' ? 'Scanning every source bank…' : `${digitalChannels.length.toLocaleString()} of ${totalDigital.toLocaleString()} digital channels`}</p>
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
        <span><i /> DIGITAL SIGNAL</span>
        <strong>{totalDigital ? totalDigital.toLocaleString() : '—'} CHANNELS</strong>
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
          placeholder="Channel #, game, team, or creator…"
          aria-label="Search the digital channel guide"
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
        <div><small>ON AIR</small><span>{selectedKey && selectedDigitalNumber ? `DTV ${String(selectedDigitalNumber).padStart(5, '0')}` : 'Digital archive'}</span></div>
        <div><small>FULL LINEUP</small><span>{totalDigital.toLocaleString()} digital channels</span></div>
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
  const guideRef = useRef(null)
  const archiveRef = useRef(null)
  const switchTimer = useRef(null)

  const selected = channels.find((channel) => channel.id === selectedId) || channels[0]
  const visibleSources = useMemo(() => channels.filter((channel) => {
    const categoryMatch = category === 'All Sports' || channel.sport === category
    const eraMatch = !era || channel.era === era
    const queryMatch = !query || `${channel.name} ${channel.fullName || ''} ${channel.title} ${channel.sport}`.toLowerCase().includes(query.toLowerCase())
    const favoriteMatch = !favoritesOnly || favorites.includes(channel.id)
    return categoryMatch && eraMatch && queryMatch && favoriteMatch
  }), [category, era, query, favoritesOnly, favorites])

  const digitalByKey = useMemo(() => new Map(digitalCatalog.map((station) => [station.key, station])), [digitalCatalog])
  const activeDigitalStation = digitalByKey.get(selectedDigitalKey)
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
      const categoryMatch = category === 'All Sports' || source.sport === category
      const eraMatch = !era || source.era === era
      const paddedNumber = String(station.digitalNumber).padStart(5, '0')
      const queryMatch = !normalizedQuery || `${station.digitalNumber} ${paddedNumber} ${station.title} ${source.name} ${source.fullName || ''} ${source.sport}`.toLowerCase().includes(normalizedQuery)
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

  const stepDigitalChannel = (direction) => {
    if (!digitalCatalog.length) return
    const currentIndex = activeDigitalStation
      ? activeDigitalStation.digitalNumber - 1
      : Math.max(0, digitalCatalog.findIndex((station) => station.source.id === selectedId))
    const nextIndex = (currentIndex + direction + digitalCatalog.length) % digitalCatalog.length
    tuneDigitalStation(digitalCatalog[nextIndex])
  }

  const handleVideoChange = React.useCallback((sourceId, videoId) => {
    setSelectedDigitalKey(`${sourceId}:${videoId}`)
  }, [])

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
      setTimeout(() => guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      return
    }
    setFavoritesOnly(false)
    const refs = { Watch: playerRef, Guide: guideRef, Archive: archiveRef }
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
              digitalNumber={activeDigitalStation?.digitalNumber}
              digitalTotal={digitalCatalog.length}
              requestedStation={requestedStation}
              tuning={tuning}
              onStepSource={stepChannel}
              onStepDigital={stepDigitalChannel}
              onTune={selectChannel}
              onVideoChange={handleVideoChange}
            />
            <div className="tuner-row">
              <EraTuner era={era} setEra={setEra} />
            </div>
          </div>
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
            guideRef={guideRef}
            favoritesOnly={favoritesOnly}
          />
        </div>

        <ArchiveRail channels={visibleSources.length ? visibleSources : channels} selectedId={selectedId} onSelect={selectChannel} archiveRef={archiveRef} />

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
