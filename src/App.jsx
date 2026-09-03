import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  CirclePlay,
  Clapperboard,
  ExternalLink,
  Expand,
  Heart,
  ListVideo,
  Maximize2,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tv,
  X,
} from 'lucide-react'
import { categories, channels, eras, getChannelUrl, getThumb, getUploadsPlaylist } from './channels.js'

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
            placeholder="Search the dial…"
            aria-label="Search channels"
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

function TVPlayer({ channel, tuning, theater, onToggleTheater, onFullscreen, onStep, isFavorite, onFavorite }) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${channel.videoId}?list=${getUploadsPlaylist(channel)}&rel=0&modestbranding=1&playsinline=1&cc_load_policy=0`

  return (
    <section className="tv-column" id="watch" aria-label="Now playing">
      <div className="tv-wrap">
        <Antennas />
        <div className="tv-cabinet">
          <div className="tv-screen-frame">
            <div className="crt-glass">
              <iframe
                key={channel.id}
                src={embedUrl}
                title={`${channel.name}: ${channel.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="scanlines" aria-hidden="true" />
              <div className={`tuning-static ${tuning ? 'active' : ''}`} aria-hidden="true" />
            </div>
          </div>
          <aside className="tv-controls" aria-hidden="true">
            <div className="control-label">VHF</div>
            <TunerDial label="CHANNEL" angle={channel.number * 11} large />
            <div className="control-label lower">UHF</div>
            <TunerDial label="FINE" angle={channel.number * -7} />
            <div className="mini-controls">
              <span><i />BRIGHT</span>
              <span><i />COLOR</span>
            </div>
            <div className="speaker-slats">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div>
            <div className="cabinet-badge">B2TF<br /><small>SPORTS TV</small></div>
          </aside>
        </div>
        <div className="console-deck">
          <div className="now-playing">
            <span className="live-dot" />
            <div>
              <small>NOW PLAYING · CHANNEL {channel.number}</small>
              <strong>{channel.title}</strong>
              <span>{channel.name}</span>
            </div>
          </div>
          <div className="deck-actions">
            <button onClick={() => onStep(-1)} aria-label="Previous channel"><ArrowLeft size={18} /></button>
            <button onClick={() => onStep(1)} aria-label="Next channel"><ArrowRight size={18} /></button>
            <button className={isFavorite ? 'favorite active' : 'favorite'} onClick={onFavorite} aria-label={`${isFavorite ? 'Remove channel from' : 'Add channel to'} My List`}>
              <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onToggleTheater} aria-label="Toggle theater mode" className={theater ? 'active' : ''}><Maximize2 size={18} /></button>
            <button onClick={onFullscreen} aria-label="Enter fullscreen"><Expand size={18} /></button>
          </div>
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

function ChannelRow({ channel, selected, isFavorite, onSelect, onFavorite }) {
  const Icon = sportIcons[channel.sport] || Radio
  return (
    <div className={`channel-row ${selected ? 'selected' : ''}`}>
      <button className="channel-main" onClick={() => onSelect(channel)}>
        <span className="channel-number">{channel.number}</span>
        <span className="sport-mark"><Icon size={17} strokeWidth={1.5} /></span>
        <span className="channel-copy">
          <strong>{channel.name}</strong>
          <small>{selected ? 'NOW PLAYING' : channel.era + ' · ' + channel.sport}</small>
        </span>
        <span className="air-time">{channel.number % 2 ? '9:00' : '10:30'} <small>PM</small></span>
      </button>
      <button
        className={`row-favorite ${isFavorite ? 'active' : ''}`}
        onClick={() => onFavorite(channel.id)}
        aria-label={`${isFavorite ? 'Remove' : 'Add'} ${channel.name} ${isFavorite ? 'from' : 'to'} My List`}
      >
        <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}

function ChannelGuide({ category, setCategory, visibleChannels, selectedId, favorites, onSelect, onFavorite, guideRef, favoritesOnly }) {
  return (
    <aside className="guide-panel" id="guide" ref={guideRef}>
      <div className="guide-heading">
        <div>
          <h2>{favoritesOnly ? 'MY LIST' : 'CHANNEL GUIDE'}</h2>
          <p>{visibleChannels.length} {visibleChannels.length === 1 ? 'station' : 'stations'} on the dial</p>
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
      <div className="channel-list">
        {visibleChannels.length ? visibleChannels.map((channel) => (
          <ChannelRow
            key={channel.id}
            channel={channel}
            selected={channel.id === selectedId}
            isFavorite={favorites.includes(channel.id)}
            onSelect={onSelect}
            onFavorite={onFavorite}
          />
        )) : (
          <div className="empty-guide">
            <Star size={28} />
            <strong>No channels on this dial</strong>
            <span>Try another sport or era.</span>
          </div>
        )}
      </div>
      <div className="guide-footer">
        <div><small>ON NOW</small><span>Archive broadcast</span></div>
        <div><small>UP NEXT</small><span>More from this channel</span></div>
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
          <p>Games, fights, films, and broadcasts waiting on the shelf.</p>
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
            <span className="poster-era">{channel.era} ARCHIVE</span>
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
  const [category, setCategory] = useState('All Sports')
  const [era, setEra] = useState('')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [theater, setTheater] = useState(false)
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
  const visibleChannels = useMemo(() => channels.filter((channel) => {
    const categoryMatch = category === 'All Sports' || channel.sport === category
    const eraMatch = !era || channel.era === era
    const queryMatch = !query || `${channel.name} ${channel.fullName || ''} ${channel.title} ${channel.sport}`.toLowerCase().includes(query.toLowerCase())
    const favoriteMatch = !favoritesOnly || favorites.includes(channel.id)
    return categoryMatch && eraMatch && queryMatch && favoriteMatch
  }), [category, era, query, favoritesOnly, favorites])

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

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const navigate = (label) => {
    setActiveNav(label)
    if (label === 'My List') {
      setFavoritesOnly(true)
      setCategory('All Sports')
      setEra('')
      setTimeout(() => guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      return
    }
    setFavoritesOnly(false)
    const refs = { Watch: playerRef, Guide: guideRef, Archive: archiveRef }
    refs[label]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const enterFullscreen = () => {
    const node = playerRef.current?.querySelector('.crt-glass')
    if (node?.requestFullscreen) node.requestFullscreen()
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
        <div className={`broadcast-grid ${theater ? 'theater' : ''}`} ref={playerRef}>
          <div>
            <TVPlayer
              channel={selected}
              tuning={tuning}
              theater={theater}
              onToggleTheater={() => setTheater((value) => !value)}
              onFullscreen={enterFullscreen}
              onStep={stepChannel}
              isFavorite={favorites.includes(selected.id)}
              onFavorite={() => toggleFavorite(selected.id)}
            />
            <div className="tuner-row">
              <EraTuner era={era} setEra={setEra} />
            </div>
          </div>
          <ChannelGuide
            category={category}
            setCategory={setCategory}
            visibleChannels={visibleChannels}
            selectedId={selectedId}
            favorites={favorites}
            onSelect={selectChannel}
            onFavorite={toggleFavorite}
            guideRef={guideRef}
            favoritesOnly={favoritesOnly}
          />
        </div>

        <ArchiveRail channels={visibleChannels.length ? visibleChannels : channels} selectedId={selectedId} onSelect={selectChannel} archiveRef={archiveRef} />

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
