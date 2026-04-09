import { useState, useCallback } from 'react';
import { ViostreamPlayer } from '@viostream/viostream-player-react';
import type { ViostreamPlayerInstance, ViostreamTimeUpdateData } from '@viostream/viostream-player-react';
import './App.css';

const ACCOUNT_KEY = 'vc-100100100';

export function App() {
  // ---------------------------------------------------------------------------
  // Configuration state
  // ---------------------------------------------------------------------------
  const [videoSelect, setVideoSelect] = useState('r3qyz91r5k7q6b');
  const [customPublicKey, setCustomPublicKey] = useState('');
  const publicKey = videoSelect || customPublicKey;

  const [embedRevision, setEmbedRevision] = useState(0);

  // ---------------------------------------------------------------------------
  // Embed options state
  // ---------------------------------------------------------------------------
  const [chapters, setChapters] = useState(true);
  const [chapterSlug, setChapterSlug] = useState('');
  const [displayTitle, setDisplayTitle] = useState(false);
  const [hlsQualitySelector, setHlsQualitySelector] = useState(true);
  const [playerKey, setPlayerKey] = useState('');
  const [playerStyle, setPlayerStyle] = useState<'video' | 'audio' | 'audio-poster'>('video');
  const [sharing, setSharing] = useState(false);
  const [skinCustom, setSkinCustom] = useState(false);
  const [skinActive, setSkinActive] = useState('');
  const [skinActiveColour, setSkinActiveColour] = useState('#ff0000');
  const [skinBackground, setSkinBackground] = useState('');
  const [skinBackgroundColour, setSkinBackgroundColour] = useState('#000000');
  const [skinInactive, setSkinInactive] = useState('');
  const [skinInactiveColour, setSkinInactiveColour] = useState('#cccccc');
  const [speedSelector, setSpeedSelector] = useState(true);
  const [startEndTimespan, setStartEndTimespan] = useState('');
  const [startTime, setStartTime] = useState('');
  const [transcriptDownload, setTranscriptDownload] = useState(false);
  const [useSettingsMenu, setUseSettingsMenu] = useState(false);
  const [forceAspectRatioEnabled, setForceAspectRatioEnabled] = useState(false);
  const [forceAspectRatioValue, setForceAspectRatioValue] = useState(1.7778);
  const forceAspectRatio = forceAspectRatioEnabled ? forceAspectRatioValue : undefined;

  // ---------------------------------------------------------------------------
  // Player state
  // ---------------------------------------------------------------------------
  const [player, setPlayer] = useState<ViostreamPlayerInstance>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [log, setLog] = useState<string[]>([]);

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLog((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  function embed() {
    setPlayer(undefined);
    setCurrentTime(0);
    setDuration(0);
    setIsPaused(true);
    setIsMuted(false);
    setVolume(1);
    setEmbedRevision((r) => r + 1);
    addLog('Embed triggered');
  }

  const handlePlayerReady = useCallback(
    (p: ViostreamPlayerInstance) => {
      setPlayer(p);
      addLog('Player ready');
      p.getDuration().then((d) => setDuration(d));
      p.getPaused().then((v) => setIsPaused(v));
      p.getMuted().then((v) => setIsMuted(v));
      p.getVolume().then((v) => setVolume(v));
    },
    [addLog],
  );

  const handleTimeUpdate = useCallback(
    (data: ViostreamTimeUpdateData) => {
      setCurrentTime(data.seconds);
      if (data.duration && data.duration !== duration) {
        setDuration(data.duration);
      }
    },
    [duration],
  );

  function togglePlay() {
    if (!player) return;
    if (isPaused) player.play(); else player.pause();
  }

  function toggleMute() {
    if (!player) return;
    if (isMuted) player.unmute(); else player.mute();
  }

  function seek(seconds: number) {
    player?.setCurrentTime(seconds);
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function syncTextToColour(text: string, setter: (v: string) => void) {
    if (/^#[0-9a-fA-F]{6}$/.test(text)) setter(text);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="container-fluid py-4" style={{ maxWidth: 1200 }}>
      <h1 className="mb-2">Viostream React SDK Demo</h1>
      <p className="lead text-body-secondary mb-4">
        This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component and event handling.
      </p>

      <div className="row g-4">
        {/* ================================================================ */}
        {/* LEFT COLUMN — Configuration & Embed Options                      */}
        {/* ================================================================ */}
        <div className="col-lg-4">
          <div className="card config-panel">
            <div className="card-header"><h6 className="mb-0">Configuration</h6></div>
            <div className="card-body d-flex flex-column overflow-hidden p-0">

              {/* Fixed top: Video dropdown */}
              <div className="px-3 pt-3">
                <div className="mb-2">
                  <label className="form-label fw-semibold small mb-1" htmlFor="video-select">Video</label>
                  <select
                    id="video-select"
                    className="form-select form-select-sm"
                    value={videoSelect}
                    onChange={(e) => setVideoSelect(e.target.value)}
                  >
                    <option value="r3qyz91r5k7q6b">16:9 Landscape</option>
                    <option value="r3qyz91r3qy3gr">9:16 Portrait</option>
                    <option value="r3qyz91r5k7897">1:1 Square</option>
                    <option value="">Custom...</option>
                  </select>
                </div>
                {videoSelect === '' && (
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={customPublicKey}
                      onChange={(e) => setCustomPublicKey(e.target.value)}
                      placeholder="Enter public key"
                    />
                  </div>
                )}
              </div>

              <hr className="mx-3 my-2" />

              {/* Scrollable middle: Embed Options */}
              <div className="flex-grow-1 overflow-y-auto px-3 pb-2">
                <small className="text-uppercase text-body-secondary fw-semibold d-block mb-2" style={{ letterSpacing: '0.05em' }}>Embed Options</small>

                {/* Boolean toggles */}
                <div className="mb-3">
                  <div className="form-check form-switch mb-1">
                    <input id="opt-chapters" className="form-check-input" type="checkbox" checked={chapters} onChange={(e) => setChapters(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-chapters">chapters</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-display-title" className="form-check-input" type="checkbox" checked={displayTitle} onChange={(e) => setDisplayTitle(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-display-title">displayTitle</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-hls-quality" className="form-check-input" type="checkbox" checked={hlsQualitySelector} onChange={(e) => setHlsQualitySelector(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-hls-quality">hlsQualitySelector</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-sharing" className="form-check-input" type="checkbox" checked={sharing} onChange={(e) => setSharing(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-sharing">sharing</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-speed-selector" className="form-check-input" type="checkbox" checked={speedSelector} onChange={(e) => setSpeedSelector(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-speed-selector">speedSelector</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-transcript-download" className="form-check-input" type="checkbox" checked={transcriptDownload} onChange={(e) => setTranscriptDownload(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-transcript-download">transcriptDownload</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-use-settings-menu" className="form-check-input" type="checkbox" checked={useSettingsMenu} onChange={(e) => setUseSettingsMenu(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-use-settings-menu">useSettingsMenu</label>
                  </div>
                  <div className="form-check form-switch mb-1">
                    <input id="opt-skin-custom" className="form-check-input" type="checkbox" checked={skinCustom} onChange={(e) => setSkinCustom(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="opt-skin-custom">skinCustom</label>
                  </div>
                  {skinCustom && (
                    <div className="ms-4 mb-1">
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <input type="color" className="form-control form-control-color form-control-sm skin-colour-picker" value={skinActiveColour} onChange={(e) => { setSkinActiveColour(e.target.value); setSkinActive(e.target.value); }} />
                        <input id="opt-skin-active" type="text" className="form-control form-control-sm font-monospace" style={{ width: '7em' }} value={skinActive} onChange={(e) => { setSkinActive(e.target.value); syncTextToColour(e.target.value, setSkinActiveColour); }} placeholder="#ff0000" />
                        <label className="small text-body-secondary text-nowrap" htmlFor="opt-skin-active">skinActive</label>
                      </div>
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <input type="color" className="form-control form-control-color form-control-sm skin-colour-picker" value={skinBackgroundColour} onChange={(e) => { setSkinBackgroundColour(e.target.value); setSkinBackground(e.target.value); }} />
                        <input id="opt-skin-background" type="text" className="form-control form-control-sm font-monospace" style={{ width: '7em' }} value={skinBackground} onChange={(e) => { setSkinBackground(e.target.value); syncTextToColour(e.target.value, setSkinBackgroundColour); }} placeholder="#000000" />
                        <label className="small text-body-secondary text-nowrap" htmlFor="opt-skin-background">skinBackground</label>
                      </div>
                      <div className="mb-1 d-flex align-items-center gap-2">
                        <input type="color" className="form-control form-control-color form-control-sm skin-colour-picker" value={skinInactiveColour} onChange={(e) => { setSkinInactiveColour(e.target.value); setSkinInactive(e.target.value); }} />
                        <input id="opt-skin-inactive" type="text" className="form-control form-control-sm font-monospace" style={{ width: '7em' }} value={skinInactive} onChange={(e) => { setSkinInactive(e.target.value); syncTextToColour(e.target.value, setSkinInactiveColour); }} placeholder="#cccccc" />
                        <label className="small text-body-secondary text-nowrap" htmlFor="opt-skin-inactive">skinInactive</label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Player style */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1" htmlFor="opt-player-style">playerStyle</label>
                  <select id="opt-player-style" className="form-select form-select-sm font-monospace" value={playerStyle} onChange={(e) => setPlayerStyle(e.target.value as typeof playerStyle)}>
                    <option value="video">video</option>
                    <option value="audio">audio</option>
                    <option value="audio-poster">audio-poster</option>
                  </select>
                </div>

                {/* String inputs */}
                <div className="mb-2">
                  <label className="form-label fw-semibold small mb-1" htmlFor="opt-player-key">playerKey</label>
                  <input id="opt-player-key" type="text" className="form-control form-control-sm font-monospace" value={playerKey} onChange={(e) => setPlayerKey(e.target.value)} placeholder="optional" />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small mb-1" htmlFor="opt-chapter-slug">chapterSlug</label>
                  <input id="opt-chapter-slug" type="text" className="form-control form-control-sm font-monospace" value={chapterSlug} onChange={(e) => setChapterSlug(e.target.value)} placeholder="optional" />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small mb-1" htmlFor="opt-start-time">startTime</label>
                  <input id="opt-start-time" type="text" className="form-control form-control-sm font-monospace" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="e.g. 30" />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small mb-1" htmlFor="opt-start-end-timespan">startEndTimespan</label>
                  <input id="opt-start-end-timespan" type="text" className="form-control form-control-sm font-monospace" value={startEndTimespan} onChange={(e) => setStartEndTimespan(e.target.value)} placeholder="e.g. 10,30" />
                </div>

                {/* Force Aspect Ratio */}
                <div className="mt-3 mb-2">
                  <div className="form-check form-switch mb-1">
                    <input id="force-aspect-ratio-toggle" className="form-check-input" type="checkbox" checked={forceAspectRatioEnabled} onChange={(e) => setForceAspectRatioEnabled(e.target.checked)} />
                    <label className="form-check-label fw-semibold small" htmlFor="force-aspect-ratio-toggle">forceAspectRatio</label>
                  </div>
                  <input
                    id="force-aspect-ratio"
                    type="number"
                    className="form-control form-control-sm font-monospace"
                    value={forceAspectRatioValue}
                    onChange={(e) => setForceAspectRatioValue(parseFloat(e.target.value) || 0)}
                    disabled={!forceAspectRatioEnabled}
                    step={0.0001}
                    min={0.0001}
                    placeholder="1.7778"
                  />
                  <div className="form-text small">1.7778 (16:9), 1.3333 (4:3), 0.5625 (9:16)</div>
                </div>
              </div>

              {/* Fixed bottom: Embed button */}
              <div className="px-3 py-2 border-top">
                <button className="btn btn-primary w-100" onClick={embed}>
                  <i className="bi bi-play-circle-fill"></i> Embed Player
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT COLUMN — Player, Controls, Log                            */}
        {/* ================================================================ */}
        <div className="col-lg-8">
          {/* Player */}
          <div className="mb-3" key={embedRevision}>
            <ViostreamPlayer
              accountKey={ACCOUNT_KEY}
              publicKey={publicKey}
              chapters={chapters}
              chapterSlug={chapterSlug || undefined}
              displayTitle={displayTitle}
              hlsQualitySelector={hlsQualitySelector}
              playerKey={playerKey || undefined}
              playerStyle={playerStyle}
              sharing={sharing}
              skinCustom={skinCustom}
              skinActive={skinActive || undefined}
              skinBackground={skinBackground || undefined}
              skinInactive={skinInactive || undefined}
              speedSelector={speedSelector}
              startEndTimespan={startEndTimespan || undefined}
              startTime={startTime || undefined}
              transcriptDownload={transcriptDownload}
              useSettingsMenu={useSettingsMenu}
              forceAspectRatio={forceAspectRatio}
              onPlay={() => { setIsPaused(false); addLog('Event: play'); }}
              onPause={() => { setIsPaused(true); addLog('Event: pause'); }}
              onEnded={() => addLog('Event: ended')}
              onTimeUpdate={handleTimeUpdate}
              onVolumeChange={(d) => { setVolume(d.volume); addLog(`Event: volumechange → ${d.volume}`); }}
              onSeeked={() => addLog('Event: seeked')}
              onPlayerReady={handlePlayerReady}
            />
          </div>

          {/* Controls */}
          <div className="card mb-3">
            <div className="card-header"><h6 className="mb-0">Controls</h6></div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <div className="btn-group" role="group">
                  <button className="btn btn-outline-light btn-sm" onClick={togglePlay} disabled={!player}>
                    <i className={isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'}></i>
                    {' '}{isPaused ? 'Play' : 'Pause'}
                  </button>
                  <button className="btn btn-outline-light btn-sm" onClick={toggleMute} disabled={!player}>
                    <i className={isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'}></i>
                    {' '}{isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <div className="btn-group" role="group">
                  <button className="btn btn-outline-light btn-sm" onClick={() => seek(0)} disabled={!player}>
                    <i className="bi bi-skip-start-fill"></i> Restart
                  </button>
                  <button className="btn btn-outline-light btn-sm" onClick={() => seek(Math.max(0, currentTime - 10))} disabled={!player}>
                    <i className="bi bi-skip-backward-fill"></i> -10s
                  </button>
                  <button className="btn btn-outline-light btn-sm" onClick={() => seek(currentTime + 10)} disabled={!player}>
                    <i className="bi bi-skip-forward-fill"></i> +10s
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3">
                <div className="progress flex-grow-1" style={{ height: 6 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${percent}%` }}
                    aria-valuenow={currentTime}
                    aria-valuemin={0}
                    aria-valuemax={duration}
                  ></div>
                </div>
                <span className="badge text-bg-light font-monospace small">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <hr className="my-3" />

              <div className="d-flex flex-wrap gap-1">
                <button className="btn btn-outline-info btn-sm" disabled={!player} onClick={async () => { if (!player) return; const t = await player.getCurrentTime(); addLog(`getCurrentTime() → ${t.toFixed(2)}s`); }}>
                  Get Current Time
                </button>
                <button className="btn btn-outline-info btn-sm" disabled={!player} onClick={async () => { if (!player) return; const d = await player.getDuration(); addLog(`getDuration() → ${d.toFixed(2)}s`); }}>
                  Get Duration
                </button>
                <button className="btn btn-outline-info btn-sm" disabled={!player} onClick={async () => { if (!player) return; const v = await player.getVolume(); addLog(`getVolume() → ${v}`); }}>
                  Get Volume
                </button>
                <button className="btn btn-outline-info btn-sm" disabled={!player} onClick={async () => { if (!player) return; const r = await player.getAspectRatio(); addLog(`getAspectRatio() → ${r}`); }}>
                  Get Aspect Ratio
                </button>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="card mb-3">
            <div className="card-header"><h6 className="mb-0">Event Log</h6></div>
            <div className="card-body p-2">
              <div className="font-monospace small" style={{ maxHeight: 200, overflowY: 'auto', lineHeight: 1.5 }}>
                {log.map((entry, i) => (
                  <div key={i}>{entry}</div>
                ))}
                {log.length === 0 && <div className="text-body-secondary">Waiting for events...</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
