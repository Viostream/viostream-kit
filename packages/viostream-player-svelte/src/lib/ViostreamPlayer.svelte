<!--
  @component ViostreamPlayer

  Svelte 5 component that embeds a Viostream video player.

  Usage:
  ```svelte
  <script lang="ts">
    import { ViostreamPlayer } from '@viostream/viostream-player-svelte';
    import type { ViostreamPlayer as ViostreamPlayerType } from '@viostream/viostream-player-svelte';

    let player: ViostreamPlayerType | undefined = $state();
  </script>

  <ViostreamPlayer
    accountKey="vc-100100100"
    publicKey="nhedxonrxsyfee"
    displayTitle={true}
    sharing={true}
    onplay={() => console.log('playing!')}
    ontimeupdate={(d) => console.log('time:', d.seconds)}
    onplayerready={(p) => (player = p)}
  />
  ```
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { loadViostream, wrapRawPlayer } from '@viostream/viostream-player-core';
	import type {
		ViostreamEmbedOptions,
		ViostreamPlayer,
		RawViostreamPlayerInstance,
		ViostreamEventHandler,
	} from '@viostream/viostream-player-core';
	import type { ViostreamPlayerProps } from './types.js';

	let {
		// Required props
		accountKey,
		publicKey,

		// Embed options
		chapters,
		chapterDisplayType,
		chapterSlug,
		displayTitle,
		hlsQualitySelector,
		playerKey,
		sharing,
		speedSelector,
		startEndTimespan,
		startTime,
		transcriptDownload,

		// Event callbacks
		onplay,
		onpause,
		onended,
		ontimeupdate,
		onvolumechange,
		onerror,
		onprogress,
		onready,
		onseeked,
		onloaded,

		// Component callbacks
		onplayerready,

		// Snippet overrides
		loading: loadingSnippet,
		error: errorSnippet,

		// Styling
		class: className,

		// Spread rest for future-proofing
		...restProps
	}: ViostreamPlayerProps & {
		loading?: Snippet;
		error?: Snippet<[string]>;
	} = $props();

	// Internal state
	let containerEl: HTMLDivElement | undefined = $state();
	let player: ViostreamPlayer | undefined = $state();
	let errorMsg: string | undefined = $state();
	let isLoading = $state(true);

	// Unique ID for the container
	const containerId = `viostream-player-${Math.random().toString(36).slice(2, 10)}`;

	// Build the embed options object from props
	function buildEmbedOptions(): ViostreamEmbedOptions {
		const opts: ViostreamEmbedOptions = {};
		if (chapters !== undefined) opts.chapters = chapters;
		if (chapterDisplayType !== undefined) opts.chapterDisplayType = chapterDisplayType;
		if (chapterSlug !== undefined) opts.chapterSlug = chapterSlug;
		if (displayTitle !== undefined) opts.displayTitle = displayTitle;
		if (hlsQualitySelector !== undefined) opts.hlsQualitySelector = hlsQualitySelector;
		if (playerKey !== undefined) opts.playerKey = playerKey;
		if (sharing !== undefined) opts.sharing = sharing;
		if (speedSelector !== undefined) opts.speedSelector = speedSelector;
		if (startEndTimespan !== undefined) opts.startEndTimespan = startEndTimespan;
		if (startTime !== undefined) opts.startTime = startTime;
		if (transcriptDownload !== undefined) opts.transcriptDownload = transcriptDownload;
		return opts;
	}

	// Event wiring: maps event names to their prop callbacks
	const EVENT_MAP: Array<[string, (() => ViostreamEventHandler | undefined)]> = [
		['play', () => onplay as ViostreamEventHandler | undefined],
		['pause', () => onpause as ViostreamEventHandler | undefined],
		['ended', () => onended as ViostreamEventHandler | undefined],
		['timeupdate', () => ontimeupdate as ViostreamEventHandler | undefined],
		['volumechange', () => onvolumechange as ViostreamEventHandler | undefined],
		['error', () => onerror as ViostreamEventHandler | undefined],
		['progress', () => onprogress as ViostreamEventHandler | undefined],
		['ready', () => onready as ViostreamEventHandler | undefined],
		['seeked', () => onseeked as ViostreamEventHandler | undefined],
		['loaded', () => onloaded as ViostreamEventHandler | undefined]
	];

	onMount(() => {
		let destroyed = false;
		const unsubscribers: Array<() => void> = [];

		async function init() {
			try {
				const api = await loadViostream(accountKey);

				if (destroyed) return;

				const embedOpts = buildEmbedOptions();
				const raw: RawViostreamPlayerInstance = api.embed(publicKey, containerId, embedOpts);
				const wrappedPlayer = wrapRawPlayer(raw, containerId);

				if (destroyed) {
					wrappedPlayer.destroy();
					return;
				}

				player = wrappedPlayer;
				isLoading = false;

				// Wire up event callbacks from props
				for (const [eventName, getHandler] of EVENT_MAP) {
					const handler = getHandler();
					if (handler) {
						const unsub = wrappedPlayer.on(eventName, handler);
						unsubscribers.push(unsub);
					}
				}

				// Notify consumer that the player is ready
				onplayerready?.(wrappedPlayer);
			} catch (err) {
				if (!destroyed) {
					errorMsg = err instanceof Error ? err.message : String(err);
					isLoading = false;
				}
			}
		}

		init();

		return () => {
			destroyed = true;
			for (const unsub of unsubscribers) {
				unsub();
			}
			player?.destroy();
			player = undefined;
		};
	});

	// Re-wire event handlers reactively when callback props change
	// This handles the case where a consumer conditionally provides callbacks
	$effect(() => {
		if (!player) return;

		const currentUnsubscribers: Array<() => void> = [];

		for (const [eventName, getHandler] of EVENT_MAP) {
			const handler = getHandler();
			if (handler) {
				const unsub = player.on(eventName, handler);
				currentUnsubscribers.push(unsub);
			}
		}

		return () => {
			for (const unsub of currentUnsubscribers) {
				unsub();
			}
		};
	});
</script>

<div
	id={containerId}
	class={className}
	bind:this={containerEl}
	data-viostream-player
	data-viostream-public-key={publicKey}
>
	{#if isLoading}
		{#if loadingSnippet}
			{@render loadingSnippet()}
		{/if}
	{/if}

	{#if errorMsg}
		{#if errorSnippet}
			{@render errorSnippet(errorMsg)}
		{:else}
			<div data-viostream-error style="color: red; padding: 1em;">
				Failed to load Viostream player: {errorMsg}
			</div>
		{/if}
	{/if}
</div>
