<script lang="ts">
  interface Props {
    label: string;
    value?: number;
    onchange?: (value: number | undefined) => void;
    /** Read-only display. */
    readonly?: boolean;
    size?: number;
  }

  let { label, value, onchange, readonly = false, size = 30 }: Props = $props();

  const name = `paw-${Math.random().toString(36).slice(2, 8)}`;
  const WORDS = ['', 'Da dimenticare', 'Così così', 'Buono', 'Molto buono', 'Da tornarci'];

  function toggle(n: number) {
    // Tapping the current value again clears it: every field is optional.
    onchange?.(value === n ? undefined : n);
  }
</script>

{#snippet paw(filled: boolean)}
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" class:filled>
    <ellipse cx="16" cy="21.5" rx="7.2" ry="6" />
    <ellipse cx="7.6" cy="13.6" rx="2.9" ry="3.6" transform="rotate(-18 7.6 13.6)" />
    <ellipse cx="12.6" cy="8.4" rx="2.9" ry="3.7" transform="rotate(-6 12.6 8.4)" />
    <ellipse cx="19.4" cy="8.4" rx="2.9" ry="3.7" transform="rotate(6 19.4 8.4)" />
    <ellipse cx="24.4" cy="13.6" rx="2.9" ry="3.6" transform="rotate(18 24.4 13.6)" />
  </svg>
{/snippet}

{#if readonly}
  <span class="paws" role="img" aria-label="{label}: {value ?? 0} su 5">
    {#each [1, 2, 3, 4, 5] as n (n)}
      {@render paw(!!value && n <= value)}
    {/each}
  </span>
{:else}
  <fieldset class="rating">
    <legend>{label}</legend>
    <div class="row">
      <div class="paws">
        {#each [1, 2, 3, 4, 5] as n (n)}
          <label class="paw-btn">
            <input
              type="radio"
              {name}
              value={n}
              checked={value === n}
              onclick={() => toggle(n)}
              aria-label="{n} su 5"
            />
            {@render paw(!!value && n <= value)}
          </label>
        {/each}
      </div>
      <span class="word" aria-live="polite">{value ? WORDS[value] : ''}</span>
    </div>
  </fieldset>
{/if}

<style>
  .rating {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 650;
    color: var(--color-cocoa-soft);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .paws {
    display: inline-flex;
    gap: 2px;
  }

  .paw-btn {
    position: relative;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    cursor: pointer;
  }

  .paw-btn input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .paw-btn:has(input:focus-visible) {
    outline: 3px solid var(--color-ribbon);
    outline-offset: -2px;
  }

  .paw-btn:hover svg:not(.filled) {
    fill: var(--color-stripe);
  }

  svg {
    fill: var(--color-line);
    transition:
      fill 160ms,
      transform 260ms var(--ease-settle);
  }

  svg.filled {
    fill: var(--color-ribbon);
  }

  .paw-btn input:checked + svg {
    transform: scale(1.18) rotate(-8deg);
  }

  span.paws svg {
    fill: var(--color-line);
  }

  span.paws svg.filled {
    fill: var(--color-ribbon);
  }

  .word {
    font-size: 14px;
    color: var(--color-cocoa-soft);
    min-height: 1.5em;
  }
</style>
