<script lang="ts">
	import { ViostreamPlayer } from "viostream-player-svelte";
	import type { ViostreamPlayerInstance, ViostreamTimeUpdateData } from "viostream-player-svelte";

	let player: ViostreamPlayerInstance | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let isPaused = $state(true);
	let isMuted = $state(false);
	let volume = $state(1);
	let log: string[] = $state([]);

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

<main
	style="max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;"
>
	<h1>Viostream Svelte SDK Demo</h1>
	<p>
		This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component and event
		handling.
	</p>

	<div style="margin: 1.5rem 0;">
		<ViostreamPlayer
			accountKey="vc-100100100"
			publicKey="nhedxonrxsyfee"
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

	<!-- Custom controls -->
	<section
		style="margin: 1.5rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;"
	>
		<h2 style="margin-top: 0;">Custom Controls</h2>

		<div
			style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;"
		>
			<button onclick={togglePlay}>
				{isPaused ? "Play" : "Pause"}
			</button>
			<button onclick={toggleMute}>
				{isMuted ? "Unmute" : "Mute"}
			</button>
			<button onclick={() => seek(0)}> Restart </button>
			<button onclick={() => seek(Math.max(0, currentTime - 10))}>
				-10s
			</button>
			<button onclick={() => seek(currentTime + 10)}> +10s </button>
		</div>

		<p style="margin-top: 0.75rem; font-variant-numeric: tabular-nums;">
			{formatTime(currentTime)} / {formatTime(duration)}
		</p>
	</section>

	<!-- Event log -->
	<section
		style="margin: 1.5rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;"
	>
		<h2 style="margin-top: 0;">Event Log</h2>
		<div
			style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.85rem; line-height: 1.6;"
		>
			{#each log as entry}
				<div>{entry}</div>
			{/each}
			{#if log.length === 0}
				<div style="color: #999;">Waiting for events...</div>
			{/if}
		</div>
	</section>

	<!-- Programmatic API example -->
	<section
		style="margin: 1.5rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;"
	>
		<h2 style="margin-top: 0;">Promise-based Getters</h2>
		<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
			<button
				onclick={async () => {
					if (!player) return;
					const t = await player.getCurrentTime();
					addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
				}}>Get Current Time</button
			>
			<button
				onclick={async () => {
					if (!player) return;
					const d = await player.getDuration();
					addLog(`getDuration() → ${d.toFixed(2)}s`);
				}}>Get Duration</button
			>
			<button
				onclick={async () => {
					if (!player) return;
					const v = await player.getVolume();
					addLog(`getVolume() → ${v}`);
				}}>Get Volume</button
			>
			<button
				onclick={async () => {
					if (!player) return;
					const r = await player.getAspectRatio();
					addLog(`getAspectRatio() → ${r}`);
				}}>Get Aspect Ratio</button
			>
			<button
				onclick={async () => {
					if (!player) return;
					const tracks = await player.getTracks();
					addLog(`getTracks() → ${JSON.stringify(tracks)}`);
				}}>Get Tracks</button
			>
		</div>
	</section>
</main>
