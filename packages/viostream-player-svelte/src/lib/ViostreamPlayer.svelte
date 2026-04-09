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
	import Debug from 'debug';
	import { getViostreamApi, wrapRawPlayer, normalizeForceAspectRatio } from '@viostream/viostream-player-core';
	import type {
		ViostreamEmbedOptions,
		ViostreamPlayer,
		RawViostreamPlayerInstance,
		ViostreamEventHandler,
	} from '@viostream/viostream-player-core';
	import type { ViostreamPlayerProps } from './types.js';
	import { SDK_NAME, SDK_VERSION } from './version.js';

	const debug = Debug('viostream:svelte');

	let {
		// Required props
		accountKey,
		publicKey,

		// Embed options
		chapters,
		chapterSlug,
		displayTitle,
		hlsQualitySelector,
		playerKey,
		playerStyle,
		sharing,
		skinActive,
		skinBackground,
		skinCustom,
		skinInactive,
		speedSelector,
		startEndTimespan,
		startTime,
		transcriptDownload,
		useSettingsMenu,
		forceAspectRatio,

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
		if (chapterSlug !== undefined) opts.chapterSlug = chapterSlug;
		if (displayTitle !== undefined) opts.displayTitle = displayTitle;
		if (hlsQualitySelector !== undefined) opts.hlsQualitySelector = hlsQualitySelector;
		if (playerKey !== undefined) opts.playerKey = playerKey;
		if (playerStyle !== undefined) opts.playerStyle = playerStyle;
		if (sharing !== undefined) opts.sharing = sharing;
		if (skinActive !== undefined) opts.skinActive = skinActive;
		if (skinBackground !== undefined) opts.skinBackground = skinBackground;
		if (skinCustom !== undefined) opts.skinCustom = skinCustom;
		if (skinInactive !== undefined) opts.skinInactive = skinInactive;
		if (speedSelector !== undefined) opts.speedSelector = speedSelector;
		if (startEndTimespan !== undefined) opts.startEndTimespan = startEndTimespan;
		if (startTime !== undefined) opts.startTime = startTime;
		if (transcriptDownload !== undefined) opts.transcriptDownload = transcriptDownload;
		if (useSettingsMenu !== undefined) opts.useSettingsMenu = useSettingsMenu;
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
		debug('onMount publicKey=%s accountKey=%s containerId=%s', publicKey, accountKey, containerId);

		let destroyed = false;

		async function init() {
			try {
				debug('init: getting embed API');
				const api = getViostreamApi();

				if (destroyed) {
					debug('init: stale closure detected after getViostreamApi — aborting publicKey=%s', publicKey);
					return;
				}

				const embedOpts = buildEmbedOptions();
				debug('init: calling api.embed publicKey=%s containerId=%s options=%o', publicKey, containerId, embedOpts);
				const raw: RawViostreamPlayerInstance = api.embed(publicKey, containerId, embedOpts, normalizeForceAspectRatio(forceAspectRatio));
				debug('init: api.embed returned raw player');

				const wrappedPlayer = wrapRawPlayer(raw, containerId);
				debug('init: wrapRawPlayer completed containerId=%s', containerId);

				if (destroyed) {
					debug('init: stale closure detected after wrapRawPlayer — destroying and aborting publicKey=%s', publicKey);
					wrappedPlayer.destroy();
					return;
				}

				player = wrappedPlayer;
				isLoading = false;
				debug('init: player set, isLoading -> false publicKey=%s', publicKey);

				// Event wiring is handled by the $effect block below, which
				// runs reactively when `player` is set and re-wires when
				// callback props change.

				// Notify consumer that the player is ready
				debug('init: firing onplayerready publicKey=%s', publicKey);
				onplayerready?.(wrappedPlayer);
			} catch (err) {
				if (!destroyed) {
					const msg = err instanceof Error ? err.message : String(err);
					debug('init: error caught publicKey=%s error=%s', publicKey, msg);
					errorMsg = msg;
					isLoading = false;
				} else {
					debug('init: error caught but destroyed — ignoring publicKey=%s', publicKey);
				}
			}
		}

		init();

		return () => {
			debug('cleanup publicKey=%s hasPlayer=%s', publicKey, !!player);
			destroyed = true;
			player?.destroy();
			player = undefined;
		};
	});

	// Re-wire event handlers reactively when callback props change
	// This handles the case where a consumer conditionally provides callbacks
	$effect(() => {
		if (!player) {
			debug('$effect event wiring skipped — no player');
			return;
		}

		const currentUnsubscribers: Array<() => void> = [];
		const wiredEvents: string[] = [];

		for (const [eventName, getHandler] of EVENT_MAP) {
			const handler = getHandler();
			if (handler) {
				const unsub = player.on(eventName, handler);
				currentUnsubscribers.push(unsub);
				wiredEvents.push(eventName);
			}
		}

		debug('$effect event wiring: subscribed to [%s]', wiredEvents.join(', '));

		return () => {
			debug('$effect event wiring cleanup: unsubscribing %d events', currentUnsubscribers.length);
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
	data-viostream-sdk={`${SDK_NAME}@${SDK_VERSION}`}
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
