<script>
  import { tweened } from 'svelte/motion'
  import { scale } from 'svelte/transition'
  import { onMount, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  export let result;
  
  let wpm = tweened(0, { delay: 300, duration: 1000 });
  let acc = tweened(0, { delay: 1300, duration: 1000 });
  
  onMount(() => {
    $wpm = result.wpm
    $acc = result.acc
    setTimeout(() => dispatch("resultShown"), 2500);
  }, 0);
</script>

<div class="container">
  <div>
    <strong>wpm</strong>
    <h2>{Math.trunc($wpm)}</h2>
  </div>
  
  <div>
    <strong>acc</strong>
    <h2>{Math.trunc($acc)}%</h2>
  </div>
</div>

<style>
  .container {
    width: calc(85% - 3rem);
    max-width: 380px;
    margin-inline: auto;
    
    & > div:first-child { margin-bottom: 20px; }
  }
  
  strong {
    color: var(--primary-color);
  }
  
  h2 {
    font-size: var(--fs-1);
    color: var(--accent-color);
  }
</style>