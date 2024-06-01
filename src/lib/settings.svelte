<script>
  import { store } from "./stores.js";
  const config = {
    times: [30, 60, 90, 120],
    words: [50, 100, 150, 200]
  }
  
  let selected = Object.keys(config)[0];
  
</script>

<div class="container">
  <div class="wrapper">
    {#each Object.keys(config) as key}
      <button on:click={() => selected = key} class:selected={key === selected}>{key}</button>
    {/each}
  </div>
  
  <div class="wrapper">
    {#each config[selected] as item}
      <button on:click={() => $store[selected] = item} class:selected={$store[selected] === item}>{item}</button>
    {/each}
  </div>
</div>

<style>
  .container {
    width: calc(85% - 3rem);
    max-width: 380px;
    border-radius: 10px;
    position: absolute;
    bottom: calc(100% + 7vw);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--secondary-color);
    padding: clamp(1rem, 0.5rem + 2.5vw, 1.5rem);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0 calc(var(--fs-3) * 1.3);
    
    &:last-child { margin-left: auto; }
    
    &:first-child > button:last-child {
      position: relative;
      
      &:after {
        content: "";
        height: 100%;
        position: absolute;
        left: calc(100% + calc(var(--fs-3) * 1.5));
        top: 50%;
        transform: translateY(-50%);
        width: 1.5px;
        background-color: var(--accent-color);
      }
    }
  }
  
  button {
    text-transform: uppercase;
    font-weight: 700;
    font-size: var(--fs-3);
    color: var(--primary-color);
    
    &:hover { color: var(--primary-text-color) }
    
    &.selected { color: var(--accent-color) }
  }
</style>