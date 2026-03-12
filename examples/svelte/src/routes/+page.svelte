<script lang="ts">
	import { ViostreamPlayer } from "@viostream/viostream-player-svelte";
	import type {
		ViostreamPlayerInstance,
		ViostreamTimeUpdateData,
	} from "@viostream/viostream-player-svelte";

	let accountKey = $state("vc-100100100");
	let publicKey = $state("nhedxonrxsyfee");

	let player: ViostreamPlayerInstance | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let isPaused = $state(true);
	let isMuted = $state(false);
	let volume = $state(1);
	let log: string[] = $state([]);

	let percent = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	function addLog(msg: string) {
		const ts = new Date().toLocaleTimeString();
		log = [`[${ts}] ${msg}`, ...log.slice(0, 49)];
	}

	function handlePlayerReady(p: ViostreamPlayerInstance) {
		player = p;
		addLog("Player ready");

		// Fetch initial state
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
</script>

<svelte:head>
	<title>Viostream Svelte SDK — Demo</title>
</svelte:head>

<main class="container py-4" style="max-width: 900px;">
	<h1 class="mb-2">Viostream Svelte SDK Demo</h1>
	<p class="lead text-body-secondary mb-4">
		This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component
		and event handling.
	</p>

	<!-- Configuration -->
	<div class="card mb-4">
		<div class="card-header">
			<h5 class="mb-0">Configuration</h5>
		</div>
		<div class="card-body">
			<div class="row g-3">
				<div class="col-sm-6">
					<label class="form-label fw-semibold" for="account-key"
						>Account Key</label
					>
					<input
						id="account-key"
						type="text"
						class="form-control font-monospace"
						bind:value={accountKey}
						placeholder="vc-100100100"
					/>
				</div>
				<div class="col-sm-6">
					<label class="form-label fw-semibold" for="public-key"
						>Public Key</label
					>
					<input
						id="public-key"
						type="text"
						class="form-control font-monospace"
						bind:value={publicKey}
						placeholder="nhedxonrxsyfee"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Player -->
	{#key `${accountKey}:${publicKey}`}
		<div class="mb-4">
			<ViostreamPlayer
				{accountKey}
				{publicKey}
				displayTitle={true}
				sharing={true}
				speedSelector={true}
				hlsQualitySelector={true}
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

	<!-- Custom Controls -->
	<div class="card mb-4">
		<div class="card-header">
			<h5 class="mb-0">Custom Controls</h5>
		</div>
		<div class="card-body">
			<div class="d-flex flex-wrap gap-2 align-items-center">
				<div
					class="btn-group"
					role="group"
					aria-label="Playback controls"
				>
					<button class="btn btn-outline-light" onclick={togglePlay}>
						<i
							class={isPaused
								? "bi bi-play-fill"
								: "bi bi-pause-fill"}
						></i>
						{isPaused ? "Play" : "Pause"}
					</button>
					<button class="btn btn-outline-light" onclick={toggleMute}>
						<i
							class={isMuted
								? "bi bi-volume-mute-fill"
								: "bi bi-volume-up-fill"}
						></i>
						{isMuted ? "Unmute" : "Mute"}
					</button>
				</div>

				<div class="btn-group" role="group" aria-label="Seek controls">
					<button
						class="btn btn-outline-light"
						onclick={() => seek(0)}
					>
						<i class="bi bi-skip-start-fill"></i> Restart
					</button>
					<button
						class="btn btn-outline-light"
						onclick={() => seek(Math.max(0, currentTime - 10))}
					>
						<i class="bi bi-skip-backward-fill"></i> -10s
					</button>
					<button
						class="btn btn-outline-light"
						onclick={() => seek(currentTime + 10)}
					>
						<i class="bi bi-skip-forward-fill"></i> +10s
					</button>
				</div>
			</div>

			<div class="d-flex align-items-center gap-3 mt-3">
				<div class="progress flex-grow-1" style="height: 8px;">
					<div
						class="progress-bar"
						role="progressbar"
						style="width: {percent}%"
						aria-valuenow={currentTime}
						aria-valuemin={0}
						aria-valuemax={duration}
					></div>
				</div>
				<span class="badge text-bg-light font-monospace">
					{formatTime(currentTime)} / {formatTime(duration)}
				</span>
			</div>
		</div>
	</div>

	<!-- Event Log -->
	<div class="card mb-4">
		<div class="card-header">
			<h5 class="mb-0">Event Log</h5>
		</div>
		<div class="card-body">
			<div
				class="font-monospace small"
				style="max-height: 200px; overflow-y: auto; line-height: 1.6;"
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

	<!-- Promise-based Getters -->
	<div class="card mb-4">
		<div class="card-header">
			<h5 class="mb-0">Promise-based Getters</h5>
		</div>
		<div class="card-body">
			<div class="d-flex flex-wrap gap-2">
				<button
					class="btn btn-outline-info btn-sm"
					onclick={async () => {
						if (!player) return;
						const t = await player.getCurrentTime();
						addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
					}}>Get Current Time</button
				>
				<button
					class="btn btn-outline-info btn-sm"
					onclick={async () => {
						if (!player) return;
						const d = await player.getDuration();
						addLog(`getDuration() → ${d.toFixed(2)}s`);
					}}>Get Duration</button
				>
				<button
					class="btn btn-outline-info btn-sm"
					onclick={async () => {
						if (!player) return;
						const v = await player.getVolume();
						addLog(`getVolume() → ${v}`);
					}}>Get Volume</button
				>
				<button
					class="btn btn-outline-info btn-sm"
					onclick={async () => {
						if (!player) return;
						const r = await player.getAspectRatio();
						addLog(`getAspectRatio() → ${r}`);
					}}>Get Aspect Ratio</button
				>
				<button
					class="btn btn-outline-info btn-sm"
					onclick={async () => {
						if (!player) return;
						const tracks = await player.getTracks();
						addLog(`getTracks() → ${JSON.stringify(tracks)}`);
					}}>Get Tracks</button
				>
			</div>
		</div>
	</div>
</main>
