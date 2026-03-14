import { useState, useCallback, useMemo } from 'react';
import { ViostreamPlayer } from '@viostream/viostream-player-react';
import type { ViostreamPlayerInstance, ViostreamTimeUpdateData } from '@viostream/viostream-player-react';
import './App.css';

export function App() {
  const [accountKey, setAccountKey] = useState('vc-100100100');
  const [publicKey, setPublicKey] = useState('nhedxonrxsyfee');

  const [player, setPlayer] = useState<ViostreamPlayerInstance>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [log, setLog] = useState<string[]>([]);

  // Key that forces player remount when config changes
  const playerKey = useMemo(() => `${accountKey}:${publicKey}`, [accountKey, publicKey]);

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLog((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  const handlePlayerReady = useCallback(
    (p: ViostreamPlayerInstance) => {
      setPlayer(p);
      addLog('Player ready');

      // Fetch initial state
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
    if (isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }

  function toggleMute() {
    if (!player) return;
    if (isMuted) {
      player.unmute();
    } else {
      player.mute();
    }
  }

  function seek(seconds: number) {
    player?.setCurrentTime(seconds);
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <main className="container py-4" style={{ maxWidth: 900 }}>
      <h1 className="mb-2">Viostream React SDK Demo</h1>
      <p className="lead text-body-secondary mb-4">
        This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component and event
        handling.
      </p>

      {/* Configuration */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Configuration</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label fw-semibold" htmlFor="account-key">Account Key</label>
              <input
                id="account-key"
                type="text"
                className="form-control font-monospace"
                value={accountKey}
                onChange={(e) => setAccountKey(e.target.value)}
                placeholder="vc-100100100"
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label fw-semibold" htmlFor="public-key">Public Key</label>
              <input
                id="public-key"
                type="text"
                className="form-control font-monospace"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="nhedxonrxsyfee"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="mb-4" key={playerKey}>
        <ViostreamPlayer
          accountKey={accountKey}
          publicKey={publicKey}
          displayTitle={true}
          sharing={true}
          speedSelector={true}
          hlsQualitySelector={true}
          onPlay={() => {
            setIsPaused(false);
            addLog('Event: play');
          }}
          onPause={() => {
            setIsPaused(true);
            addLog('Event: pause');
          }}
          onEnded={() => addLog('Event: ended')}
          onTimeUpdate={handleTimeUpdate}
          onVolumeChange={(d) => {
            setVolume(d.volume);
            addLog(`Event: volumechange → ${d.volume}`);
          }}
          onSeeked={() => addLog('Event: seeked')}
          onPlayerReady={handlePlayerReady}
        />
      </div>

      {/* Custom Controls */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Custom Controls</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="btn-group" role="group" aria-label="Playback controls">
              <button className="btn btn-outline-light" onClick={togglePlay}>
                <i className={isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'}></i>
                {' '}{isPaused ? 'Play' : 'Pause'}
              </button>
              <button className="btn btn-outline-light" onClick={toggleMute}>
                <i className={isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'}></i>
                {' '}{isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>

            <div className="btn-group" role="group" aria-label="Seek controls">
              <button className="btn btn-outline-light" onClick={() => seek(0)}>
                <i className="bi bi-skip-start-fill"></i> Restart
              </button>
              <button className="btn btn-outline-light" onClick={() => seek(Math.max(0, currentTime - 10))}>
                <i className="bi bi-skip-backward-fill"></i> -10s
              </button>
              <button className="btn btn-outline-light" onClick={() => seek(currentTime + 10)}>
                <i className="bi bi-skip-forward-fill"></i> +10s
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 mt-3">
            <div className="progress flex-grow-1" style={{ height: 8 }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${percent}%` }}
                aria-valuenow={currentTime}
                aria-valuemin={0}
                aria-valuemax={duration}
              ></div>
            </div>
            <span className="badge text-bg-light font-monospace">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Event Log</h5>
        </div>
        <div className="card-body">
          <div className="font-monospace small log-scroll">
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
            {log.length === 0 && <div className="text-body-secondary">Waiting for events...</div>}
          </div>
        </div>
      </div>

      {/* Promise-based Getters */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Promise-based Getters</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-outline-info btn-sm"
              onClick={async () => {
                if (!player) return;
                const t = await player.getCurrentTime();
                addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
              }}
            >
              Get Current Time
            </button>
            <button
              className="btn btn-outline-info btn-sm"
              onClick={async () => {
                if (!player) return;
                const d = await player.getDuration();
                addLog(`getDuration() → ${d.toFixed(2)}s`);
              }}
            >
              Get Duration
            </button>
            <button
              className="btn btn-outline-info btn-sm"
              onClick={async () => {
                if (!player) return;
                const v = await player.getVolume();
                addLog(`getVolume() → ${v}`);
              }}
            >
              Get Volume
            </button>
            <button
              className="btn btn-outline-info btn-sm"
              onClick={async () => {
                if (!player) return;
                const r = await player.getAspectRatio();
                addLog(`getAspectRatio() → ${r}`);
              }}
            >
              Get Aspect Ratio
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
