<script lang="ts">
	import { ViostreamPlayer } from "@viostream/viostream-player-svelte";
	import type {
		ViostreamPlayerInstance,
		ViostreamTimeUpdateData,
	} from "@viostream/viostream-player-svelte";

	// -----------------------------------------------------------------------
	// Configuration state
	// -----------------------------------------------------------------------
	const accountKey = 'vc-100100100';
	let videoSelect = $state('r3qyz91r5k7q6b');
	let customPublicKey = $state('');
	let publicKey = $derived(videoSelect || customPublicKey);

	let embedRevision = $state(0);

	// -----------------------------------------------------------------------
	// Embed options state (all ViostreamEmbedOptions props)
	// -----------------------------------------------------------------------
	let chapters = $state(true);
	let chapterSlug = $state('');
	let displayTitle = $state(false);
	let hlsQualitySelector = $state(true);
	let optPlayerKey = $state('');
	let playerStyle = $state<'video' | 'audio' | 'audio-poster'>('video');
	let sharing = $state(false);
	let skinCustom = $state(false);
	let skinActive = $state('');
	let skinActiveColour = $state('#ff0000');
	let skinBackground = $state('');
	let skinBackgroundColour = $state('#000000');
	let skinInactive = $state('');
	let skinInactiveColour = $state('#cccccc');
	let speedSelector = $state(true);
	let startEndTimespan = $state('');
	let startTime = $state('');
	let transcriptDownload = $state(false);
	let useSettingsMenu = $state(false);
	let forceAspectRatioEnabled = $state(false);
	let forceAspectRatioValue = $state(1.7778);
	let forceAspectRatio = $derived(forceAspectRatioEnabled ? forceAspectRatioValue : undefined);

	// -----------------------------------------------------------------------
	// Player state
	// -----------------------------------------------------------------------
	let player: ViostreamPlayerInstance | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let isPaused = $state(true);
	let isMuted = $state(false);
	let volume = $state(1);
	let log: string[] = $state([]);

	let percent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	// -----------------------------------------------------------------------
	// Helpers
	// -----------------------------------------------------------------------
	function addLog(msg: string) {
		const ts = new Date().toLocaleTimeString();
		log = [`[${ts}] ${msg}`, ...log.slice(0, 49)];
	}

	function embed() {
		player = undefined;
		currentTime = 0;
		duration = 0;
		isPaused = true;
		isMuted = false;
		volume = 1;
		embedRevision++;
		addLog('Embed triggered (revision ' + embedRevision + ')');
	}

	function handlePlayerReady(p: ViostreamPlayerInstance) {
		player = p;
		addLog("Player ready");

		p.getDuration().then((d) => (duration = d));
		p.getPaused().then((v) => (isPaused = v));
		p.getMuted().then((v) => (isMuted = v));
		p.getVolume().then((v) => (volume = v));
	}

	function handleTimeUpdate(data: ViostreamTimeUpdateData) {
		currentTime = data.seconds;
		if (data.duration && data.duration !== duration) {
			duration = data.duration;
		}
	}

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
		return `${m}:${sec.toString().padStart(2, "0")}`;
	}

	// Colour picker sync helpers
	function syncColourToText(picker: EventTarget | null, setter: (v: string) => void) {
		if (picker instanceof HTMLInputElement) setter(picker.value);
	}
	function syncTextToColour(text: string, setter: (v: string) => void) {
		if (/^#[0-9a-fA-F]{6}$/.test(text)) setter(text);
	}
</script>

<svelte:head>
	<title>Viostream Svelte SDK — Demo</title>
</svelte:head>

<main class="container-fluid py-4" style="max-width: 1200px;">
	<h1 class="mb-2">Viostream Svelte SDK Demo</h1>
	<p class="lead text-body-secondary mb-4">
		This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component
		and event handling.
	</p>

	<div class="row g-4">
		<!-- ================================================================ -->
		<!-- LEFT COLUMN — Configuration & Embed Options                      -->
		<!-- ================================================================ -->
		<div class="col-lg-4">
			<div class="card config-panel">
				<div class="card-header"><h6 class="mb-0">Configuration</h6></div>
				<div class="card-body d-flex flex-column overflow-hidden p-0">

					<!-- Fixed top: Video dropdown -->
					<div class="px-3 pt-3">
						<div class="mb-2">
							<label class="form-label fw-semibold small mb-1" for="video-select">Video</label>
							<select id="video-select" class="form-select form-select-sm" bind:value={videoSelect}>
								<option value="r3qyz91r5k7q6b">16:9 Landscape</option>
								<option value="r3qyz91r3qy3gr">9:16 Portrait</option>
								<option value="r3qyz91r5k7897">1:1 Square</option>
								<option value="">Custom...</option>
							</select>
						</div>
						{#if videoSelect === ''}
							<div class="mb-2">
								<input
									type="text"
									class="form-control form-control-sm font-monospace"
									bind:value={customPublicKey}
									placeholder="Enter public key"
								/>
							</div>
						{/if}
					</div>

					<hr class="mx-3 my-2" />

					<!-- Scrollable middle: Embed Options -->
					<div class="flex-grow-1 overflow-y-auto px-3 pb-2">
						<small class="text-uppercase text-body-secondary fw-semibold d-block mb-2" style="letter-spacing: 0.05em;">Embed Options</small>

						<!-- Boolean toggles -->
						<div class="mb-3">
							<div class="form-check form-switch mb-1">
								<input id="opt-chapters" class="form-check-input" type="checkbox" bind:checked={chapters} />
								<label class="form-check-label small" for="opt-chapters">chapters</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-display-title" class="form-check-input" type="checkbox" bind:checked={displayTitle} />
								<label class="form-check-label small" for="opt-display-title">displayTitle</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-hls-quality" class="form-check-input" type="checkbox" bind:checked={hlsQualitySelector} />
								<label class="form-check-label small" for="opt-hls-quality">hlsQualitySelector</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-sharing" class="form-check-input" type="checkbox" bind:checked={sharing} />
								<label class="form-check-label small" for="opt-sharing">sharing</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-speed-selector" class="form-check-input" type="checkbox" bind:checked={speedSelector} />
								<label class="form-check-label small" for="opt-speed-selector">speedSelector</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-transcript-download" class="form-check-input" type="checkbox" bind:checked={transcriptDownload} />
								<label class="form-check-label small" for="opt-transcript-download">transcriptDownload</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-use-settings-menu" class="form-check-input" type="checkbox" bind:checked={useSettingsMenu} />
								<label class="form-check-label small" for="opt-use-settings-menu">useSettingsMenu</label>
							</div>
							<div class="form-check form-switch mb-1">
								<input id="opt-skin-custom" class="form-check-input" type="checkbox" bind:checked={skinCustom} />
								<label class="form-check-label small" for="opt-skin-custom">skinCustom</label>
							</div>
							{#if skinCustom}
								<div class="ms-4 mb-1">
									<div class="mb-2 d-flex align-items-center gap-2">
										<input type="color" class="form-control form-control-color form-control-sm skin-colour-picker" bind:value={skinActiveColour} oninput={(e) => syncColourToText(e.target, (v) => skinActive = v)} />
										<input id="opt-skin-active" type="text" class="form-control form-control-sm font-monospace" style="width: 7em;" bind:value={skinActive} oninput={() => syncTextToColour(skinActive, (v) => skinActiveColour = v)} placeholder="#ff0000" />
										<label class="small text-body-secondary text-nowrap" for="opt-skin-active">skinActive</label>
									</div>
									<div class="mb-2 d-flex align-items-center gap-2">
										<input type="color" class="form-control form-control-color form-control-sm skin-colour-picker" bind:value={skinBackgroundColour} oninput={(e) => syncColourToText(e.target, (v) => skinBackground = v)} />
										<input id="opt-skin-background" type="text" class="form-control form-control-sm font-monospace" style="width: 7em;" bind:value={skinBackground} oninput={() => syncTextToColour(skinBackground, (v) => skinBackgroundColour = v)} placeholder="#000000" />
										<label class="small text-body-secondary text-nowrap" for="opt-skin-background">skinBackground</label>
									</div>
									<div class="mb-1 d-flex align-items-center gap-2">
										<input type="color" class="form-control form-control-color form-control-sm skin-colour-picker" bind:value={skinInactiveColour} oninput={(e) => syncColourToText(e.target, (v) => skinInactive = v)} />
										<input id="opt-skin-inactive" type="text" class="form-control form-control-sm font-monospace" style="width: 7em;" bind:value={skinInactive} oninput={() => syncTextToColour(skinInactive, (v) => skinInactiveColour = v)} placeholder="#cccccc" />
										<label class="small text-body-secondary text-nowrap" for="opt-skin-inactive">skinInactive</label>
									</div>
								</div>
							{/if}
						</div>

						<!-- Player style -->
						<div class="mb-3">
							<label class="form-label fw-semibold small mb-1" for="opt-player-style">playerStyle</label>
							<select id="opt-player-style" class="form-select form-select-sm font-monospace" bind:value={playerStyle}>
								<option value="video">video</option>
								<option value="audio">audio</option>
								<option value="audio-poster">audio-poster</option>
							</select>
						</div>

						<!-- String inputs -->
						<div class="mb-2">
							<label class="form-label fw-semibold small mb-1" for="opt-player-key">playerKey</label>
							<input id="opt-player-key" type="text" class="form-control form-control-sm font-monospace" bind:value={optPlayerKey} placeholder="optional" />
						</div>
						<div class="mb-2">
							<label class="form-label fw-semibold small mb-1" for="opt-chapter-slug">chapterSlug</label>
							<input id="opt-chapter-slug" type="text" class="form-control form-control-sm font-monospace" bind:value={chapterSlug} placeholder="optional" />
						</div>
						<div class="mb-2">
							<label class="form-label fw-semibold small mb-1" for="opt-start-time">startTime</label>
							<input id="opt-start-time" type="text" class="form-control form-control-sm font-monospace" bind:value={startTime} placeholder="e.g. 30" />
						</div>
						<div class="mb-2">
							<label class="form-label fw-semibold small mb-1" for="opt-start-end-timespan">startEndTimespan</label>
							<input id="opt-start-end-timespan" type="text" class="form-control form-control-sm font-monospace" bind:value={startEndTimespan} placeholder="e.g. 10,30" />
						</div>

						<!-- Force Aspect Ratio -->
						<div class="mt-3 mb-2">
							<div class="form-check form-switch mb-1">
								<input id="force-aspect-ratio-toggle" class="form-check-input" type="checkbox" bind:checked={forceAspectRatioEnabled} />
								<label class="form-check-label fw-semibold small" for="force-aspect-ratio-toggle">forceAspectRatio</label>
							</div>
							<input
								id="force-aspect-ratio"
								type="number"
								class="form-control form-control-sm font-monospace"
								bind:value={forceAspectRatioValue}
								disabled={!forceAspectRatioEnabled}
								step="0.0001"
								min="0.0001"
								placeholder="1.7778"
							/>
							<div class="form-text small">1.7778 (16:9), 1.3333 (4:3), 0.5625 (9:16)</div>
						</div>
					</div>

					<!-- Fixed bottom: Embed button -->
					<div class="px-3 py-2 border-top">
						<button class="btn btn-primary w-100" onclick={embed}>
							<i class="bi bi-play-circle-fill"></i> Embed Player
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- ================================================================ -->
		<!-- RIGHT COLUMN — Player, Controls, Log                            -->
		<!-- ================================================================ -->
		<div class="col-lg-8">
			<!-- Player -->
			{#key embedRevision}
				<div class="mb-3">
					<ViostreamPlayer
						{accountKey}
						{publicKey}
						{chapters}
						chapterSlug={chapterSlug || undefined}
						{displayTitle}
						{hlsQualitySelector}
						playerKey={optPlayerKey || undefined}
						{playerStyle}
						{sharing}
						{skinCustom}
						skinActive={skinActive || undefined}
						skinBackground={skinBackground || undefined}
						skinInactive={skinInactive || undefined}
						{speedSelector}
						startEndTimespan={startEndTimespan || undefined}
						startTime={startTime || undefined}
						{transcriptDownload}
						{useSettingsMenu}
						{forceAspectRatio}
						onplay={() => {
							isPaused = false;
							addLog("Event: play");
						}}
						onpause={() => {
							isPaused = true;
							addLog("Event: pause");
						}}
						onended={() => addLog("Event: ended")}
						ontimeupdate={handleTimeUpdate}
						onvolumechange={(d) => {
							volume = d.volume;
							addLog(`Event: volumechange → ${d.volume}`);
						}}
						onseeked={() => addLog("Event: seeked")}
						onplayerready={handlePlayerReady}
					/>
				</div>
			{/key}

			<!-- Controls -->
			<div class="card mb-3">
				<div class="card-header"><h6 class="mb-0">Controls</h6></div>
				<div class="card-body">
					<div class="d-flex flex-wrap gap-2 align-items-center">
						<div class="btn-group" role="group">
							<button class="btn btn-outline-light btn-sm" onclick={togglePlay} disabled={!player}>
								<i class={isPaused ? "bi bi-play-fill" : "bi bi-pause-fill"}></i>
								{isPaused ? "Play" : "Pause"}
							</button>
							<button class="btn btn-outline-light btn-sm" onclick={toggleMute} disabled={!player}>
								<i class={isMuted ? "bi bi-volume-mute-fill" : "bi bi-volume-up-fill"}></i>
								{isMuted ? "Unmute" : "Mute"}
							</button>
						</div>
						<div class="btn-group" role="group">
							<button class="btn btn-outline-light btn-sm" onclick={() => seek(0)} disabled={!player}>
								<i class="bi bi-skip-start-fill"></i> Restart
							</button>
							<button class="btn btn-outline-light btn-sm" onclick={() => seek(Math.max(0, currentTime - 10))} disabled={!player}>
								<i class="bi bi-skip-backward-fill"></i> -10s
							</button>
							<button class="btn btn-outline-light btn-sm" onclick={() => seek(currentTime + 10)} disabled={!player}>
								<i class="bi bi-skip-forward-fill"></i> +10s
							</button>
						</div>
					</div>

					<div class="d-flex align-items-center gap-3 mt-3">
						<div class="progress flex-grow-1" style="height: 6px;">
							<div
								class="progress-bar"
								role="progressbar"
								style="width: {percent}%"
								aria-valuenow={currentTime}
								aria-valuemin={0}
								aria-valuemax={duration}
							></div>
						</div>
						<span class="badge text-bg-light font-monospace small">
							{formatTime(currentTime)} / {formatTime(duration)}
						</span>
					</div>

					<hr class="my-3" />

					<div class="d-flex flex-wrap gap-1">
						<button
							class="btn btn-outline-info btn-sm"
							disabled={!player}
							onclick={async () => {
								if (!player) return;
								const t = await player.getCurrentTime();
								addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
							}}>Get Current Time</button
						>
						<button
							class="btn btn-outline-info btn-sm"
							disabled={!player}
							onclick={async () => {
								if (!player) return;
								const d = await player.getDuration();
								addLog(`getDuration() → ${d.toFixed(2)}s`);
							}}>Get Duration</button
						>
						<button
							class="btn btn-outline-info btn-sm"
							disabled={!player}
							onclick={async () => {
								if (!player) return;
								const v = await player.getVolume();
								addLog(`getVolume() → ${v}`);
							}}>Get Volume</button
						>
						<button
							class="btn btn-outline-info btn-sm"
							disabled={!player}
							onclick={async () => {
								if (!player) return;
								const r = await player.getAspectRatio();
								addLog(`getAspectRatio() → ${r}`);
							}}>Get Aspect Ratio</button
						>
					</div>
				</div>
			</div>

			<!-- Event Log -->
			<div class="card mb-3">
				<div class="card-header"><h6 class="mb-0">Event Log</h6></div>
				<div class="card-body p-2">
					<div
						class="font-monospace small"
						style="max-height: 200px; overflow-y: auto; line-height: 1.5;"
					>
						{#each log as entry}
							<div>{entry}</div>
						{/each}
						{#if log.length === 0}
							<div class="text-body-secondary">Waiting for events...</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	@media (min-width: 992px) {
		:global(.config-panel) {
			height: calc(100vh - 200px);
			display: flex;
			flex-direction: column;
		}
	}
	:global(.skin-colour-picker) {
		border: 1px solid rgba(255, 255, 255, 0.25);
		width: 2.5em;
		min-width: 2.5em;
	}
</style>
