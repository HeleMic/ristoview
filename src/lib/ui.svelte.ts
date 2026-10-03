/** Transient, per-tab UI flags (never saved). */
export const ui = $state({
  /** She just pressed "Sì": the gift page opens the box on its own. */
  justSaidYes: false,
  /** Settings → "Anteprima sorpresa": shows the easter egg without saving anything. */
  previewEasterEgg: false,
});
