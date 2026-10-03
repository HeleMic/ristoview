<script lang="ts" module>
  export type IconName =
    | 'gift'
    | 'cloche'
    | 'plus'
    | 'sliders'
    | 'pin'
    | 'pencil'
    | 'trash'
    | 'check'
    | 'back'
    | 'chevron'
    | 'search'
    | 'refresh'
    | 'bookmark'
    | 'receipt'
    | 'download'
    | 'upload'
    | 'cloud'
    | 'cloud-off';
</script>

<script lang="ts">
  interface Props {
    name: IconName;
    size?: number;
    stroke?: number;
  }
  let { name, size = 22, stroke = 2 }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'gift'}
    <rect x="3.5" y="9" width="17" height="11.5" rx="1.5" />
    <path d="M2.5 9h19M12 9v11.5" />
    <path d="M12 9c-1.5-3.5-5.5-4.5-6-2s3 2 6 2c3 0 6.5.5 6-2s-4.5-1.5-6 2Z" />
  {:else if name === 'cloche'}
    <path d="M3 17.5h18M4.5 17.5a7.5 7.5 0 0 1 15 0" />
    <path d="M12 7.5V6M10.5 6h3M4 20.5h16" />
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14" />
  {:else if name === 'sliders'}
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  {:else if name === 'pin'}
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  {:else if name === 'pencil'}
    <path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5ZM13.5 6.5l4 4" />
  {:else if name === 'trash'}
    <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13M10 11v5.5M14 11v5.5" />
  {:else if name === 'check'}
    <path d="M4.5 12.5l5 5 10-11" />
  {:else if name === 'back'}
    <path d="M15 5l-7 7 7 7" />
  {:else if name === 'chevron'}
    <path d="M9 5l7 7-7 7" />
  {:else if name === 'search'}
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  {:else if name === 'refresh'}
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15" />
  {:else if name === 'bookmark'}
    <path d="M6.5 3.5h11v17L12 16.5l-5.5 4v-17Z" />
  {:else if name === 'receipt'}
    <path d="M5.5 3h13v18l-2.2-1.5L14 21l-2-1.5L10 21l-2.3-1.5L5.5 21V3Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  {:else if name === 'download'}
    <path d="M12 4v11M7 10.5l5 5 5-5M4.5 20h15" />
  {:else if name === 'upload'}
    <path d="M12 16V5M7 9.5l5-5 5 5M4.5 20h15" />
  {:else if name === 'cloud'}
    <path d="M7 18.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5 3.75 3.75 0 0 1-.5 7.5H7Z" />
  {:else if name === 'cloud-off'}
    <path d="M7 18.5a4.5 4.5 0 0 1-.5-9M10 6a6 6 0 0 1 8 5 3.75 3.75 0 0 1 1.2 6.6M3.5 3.5l17 17" />
  {/if}
</svg>
