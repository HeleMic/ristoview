<script lang="ts">
  import Icon from './Icon.svelte';

  interface Props {
    label: string;
    confirmLabel: string;
    question: string;
    onconfirm: () => void;
  }
  let { label, confirmLabel, question, onconfirm }: Props = $props();
  let asking = $state(false);
</script>

{#if asking}
  <div class="ask" role="group" aria-label={question}>
    <span>{question}</span>
    <button class="btn btn-sm btn-ghost" onclick={() => (asking = false)}>No</button>
    <button class="btn btn-sm btn-ribbon" onclick={onconfirm}>{confirmLabel}</button>
  </div>
{:else}
  <button class="btn btn-sm btn-danger" onclick={() => (asking = true)}>
    <Icon name="trash" size={16} />
    {label}
  </button>
{/if}

<style>
  .ask {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-weight: 650;
  }
</style>
