<script>
  import words from './lib/words.json';
  import Settings from './lib/settings.svelte';
  import { store } from './lib/stores.js';
  import Result from './lib/Result.svelte';
	import { tick, onMount } from 'svelte';
	
	let state = "idle";
	
	let inputEl;
	let cursorEl;
	let wordsEl;
	let inputValue = "";
  let inputWordsArr = [];
  
  let renderArr = [];
  let wordsArr = generateWords();
  let wordIndex = 0;
  let letterIndex = 0;
  let lastSelctionStart = 0;
  let pressedKey = "";
  let time = $store.times;
  let timerId = null;
  let blink = true;
  const result = { wpm: 0, acc: 0 };
  let resultShown = false;
  $: inputWordsArr = inputValue.split(" ");
  
  function generateWords() {
    const wordsCopy = words.slice(0);
    
    for (let i = wordsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordsCopy[i], wordsCopy[j]] = [wordsCopy[j], wordsCopy[i]];
    }
    
    const arr = wordsCopy.slice(0, $store.words);
    renderArr = arr.slice(0);
    return arr;
  }
  
  function handleKeydown(e) {
    const regex = /(enter|arrow(?:left|right|up|down)|page(?:up|down)|tab|delete|home|end)/i;
    if (regex.test(e.key)) e.preventDefault();
  }
  
  function handleOnInput(e) {
    if (e.inputType === "deleteContentBackward") {
      pressedKey = "backspace"
    } else {
      pressedKey = e.data
      if (pressedKey === " " && (inputValue.length === 1 || inputValue[inputValue.length - 2] === " ")) {
        inputValue = inputValue.substring(0, inputValue.length - 1);
        return
      }
    }
    
    wordIndex = Math.max(0, inputWordsArr.length - 1);
    letterIndex = Math.max(0, inputWordsArr[wordIndex]?.length);
    
    setLetter();
    tick().then(moveCursor);
    
    lastSelctionStart = inputEl.selectionStart;
    !timerId && startGameTimer();
  }
  
  function setLetter() {
    const currentExpectedWordLen = wordsArr[wordIndex].length;
    if (pressedKey === "backspace" && renderArr[wordIndex].length !== inputWordsArr[wordIndex].length && currentExpectedWordLen < renderArr[wordIndex].length) {
      let charectersRemoved = lastSelctionStart - inputEl.selectionStart;
      const maxRemoveAble = renderArr[wordIndex].length - currentExpectedWordLen
      if (charectersRemoved > maxRemoveAble) charectersRemoved = maxRemoveAble;
      renderArr[wordIndex] = renderArr[wordIndex].substring(0, renderArr[wordIndex].length - charectersRemoved);
    }
    
    const extraWord = currentExpectedWordLen < inputWordsArr[wordIndex].length
    if (!extraWord || pressedKey === "backspace") return
    
    if (pressedKey.length > currentExpectedWordLen) {
      // find better solution
      renderArr[wordIndex] = wordsArr[wordIndex] + pressedKey.substring(currentExpectedWordLen);
    } else {
      renderArr[wordIndex] += pressedKey
    }
  }
  
  function moveCursor() {
    if (!cursorEl) return;
    let x, y;
    if (wordIndex === 0 && letterIndex === 0) {
      x = 0;
      y = 0;
    } else if (inputWordsArr[wordIndex] === "") {
      const currentLetter = wordsEl.children[wordIndex].children[0];
      x = currentLetter.offsetLeft 
      y = currentLetter.offsetTop
    } else {
      const currentLetter = wordsEl.children[wordIndex].children[letterIndex - 1];
      if (currentLetter) {
        x = currentLetter.offsetLeft + currentLetter.offsetWidth
        y = currentLetter.offsetTop
      }
    }
    
    if (x >= 0 && y >= 0) {
      cursorEl.style.transform = `translate(${x}px, ${y}px)`;
    }
    
    translateContainer();
  }
  
  function translateContainer() {
    const currentWord = wordsEl.children[wordIndex];
    if (currentWord.offsetTop < currentWord.offsetHeight * 2) {
      wordsEl.parentElement.scrollTop = 0
    } else {
      wordsEl.parentElement.scrollTop = currentWord.offsetTop - currentWord.offsetHeight
    }
  }
  
  function startGameTimer() {
    const countDown = () => {
      if (time === 0) {
        clearInterval(timerId);
        timerId = null;
        calculateResult();
        inputEl?.blur();
        state = "gameOver";
        blink = true;
      } else {
        time -= 1
      }
    }
    
    blink = false;
    timerId = setInterval(countDown, 1000)
  }
  
  function calculateResult() {
    const totalKeysPressed = inputValue.length;
    const timeElapsed = $store.times / 60
    result.wpm = (totalKeysPressed / 5) / timeElapsed;
    
    const incorrectKeysPressed = document.querySelectorAll(".incorrect, .extra")?.length ?? 0;
    const acc = ((totalKeysPressed - incorrectKeysPressed) / totalKeysPressed) * 100;
    result.acc = acc ?? 0;
  }
  
  function startGame() {
    state = "playing"
    inputEl?.focus();
  }
  
  function resetGame() {
    inputValue = "";
    wordsArr = generateWords();
    wordIndex = 0;
    letterIndex = 0;
    lastSelctionStart = 0;
    pressedKey = "";
    time = $store.times;
    timerId && clearInterval(timerId);
    timerId = null;
    blink = true;
    result.wpm = 0;
    result.acc = 0;
    resultShown = false;
    state = "playing";
    tick().then(moveCursor);
  }
  
  window.onkeydown = function() {
    if (state === "idle") {
      setTimeout(startGame);
    }
    
    if (state === "playing" && document.activeElement !== inputEl) {
      inputEl?.focus();
    }
    
    if (state === "gameOver" && resultShown) {
      setTimeout(() => {
        resetGame();
        inputEl?.focus();
      })
    }
  }
  
</script>


<textarea
  bind:this={inputEl}
  bind:value={inputValue}
  on:paste={(e) => e.preventDefault()}
  on:keydown={handleKeydown}
  on:input={handleOnInput}
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  spellcheck="false"
/>

{#if state !== "playing"}
  <Settings />
{:else}
  <h2 class="timer">{time}</h2>
{/if}

{#if state !== "gameOver"}
  <div class="container">
    <div class="words" bind:this={wordsEl} on:click={startGame}>
      {#each renderArr as word, wi}
        {@const w = inputWordsArr[wi]}
        {@const wl = w ? inputWordsArr[wi].length : 0}
        {@const ml = wordsArr[wi].length - 1}
        <div class="word">
          {#each word as letter, li}
            <letter class="{ml < li ? "extra" : wl > li ? w[li] === letter ? "correct" : "incorrect" : ""}">
              {letter}
            </letter>
          {/each}
        </div>
      {/each}
    </div>
    
    {#if state === "playing"}
      <div class="cursor" class:blink bind:this={cursorEl}></div>
    {/if}
    
    {#if state === "idle"}
      <div class="overlay">
        <p>Click Here Or Press Any key to Start</p>
      </div>
    {/if}
  </div>
{:else}
  <Result {result} on:resultShown={() => resultShown = true} />
{/if}

<button on:click={resetGame} class="reset">
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 2048 2048"><path fill="currentColor" d="M1920 1216q0 115-30 221t-84 198t-130 169t-168 130t-199 84t-221 30q-115 0-221-30t-198-84t-169-130t-130-168t-84-199t-30-221v-64h128v64q0 97 25 187t71 168t110 142t143 111t168 71t187 25q97 0 187-25t168-71t142-110t111-143t71-168t25-187q0-97-25-187t-71-168t-110-142t-143-111t-168-71t-187-25H250l291 291l-90 90L6 448L451 3l90 90l-291 291h838q115 0 221 30t198 84t169 130t130 168t84 199t30 221"/></svg>
</button>

<style>
  textarea {
    height: calc(var(--fs-2) * var(--line-height));
    position: absolute;
    top: 50%;
    left: 1rem;
    opacity: 0;
    background: none;
    transform: translateY(-50%);
    resize: none;
    pointer-events: none;
    outline: var(--primary-color);
  }
  
  .timer {
    font-size: var(--fs-1);
    color: var(--accent-color);
    position: absolute;
    bottom: calc(100% + 5vw);
    left: 1rem;
    font-weight: 600;
    font-family: var(--ff-lexend-deca);
  }
  
  .container {
    position: relative;
    height: calc(var(--fs-2) * var(--line-height) * 3);
    overflow: hidden;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  
  .words {
    display: flex;
    flex-wrap: wrap;
    gap: 0 calc(var(--fs-2) / 1.5);
  }
  
  letter {
    display: inline-block;
    font-weight: 900;
    color: var(--primary-color);
    font-size: var(--fs-2);
    line-height: var(--line-height);
    transition: color 0.2s ease-out;
    
    &.correct { color: var(--primary-text-color) }
    &.incorrect { color: var(--error-color) }
    &.extra { color: var(--error-extra-color) }
  }
  
  .cursor {
    position: absolute;
    top: calc(calc(var(--fs-2) * var(--line-height) / 9));
    left: 0;
    height: calc(var(--fs-2) * var(--line-height) / 1.3);
    width: clamp(1.5px, 0.4vw, 5px);
    background-color: var(--accent-color);
    border-radius: 2px;
    transition: transform 0.2s ease-out;
  }
  
  .cursor.blink { animation: blink 1s linear infinite }
  
  @keyframes blink {
    0%,
    100% { opacity: 1 }
    50% { opacity: 0 }
  }
  
  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    backdrop-filter: blur(5px);
    pointer-events: none;
    cursor: pointer;
    
    & p {
      font-size: var(--fs-2);
      line-height: 1.8;
      font-weight: 900;
      font-family: var(--ff-lexend-deca);
      max-width: 40%;
      text-align: center;
      color: var(--primary-text-color);
    }
  }
  
  .reset {
    position: absolute;
    top: calc(100% + 6vw);
    left: 50%;
    transform: translateX(-50%);
    color: var(--primary-color);
    font-size: clamp(1rem, 0.5rem + 3vw, 4rem);
    
    &:hover { color: var(--primary-text-color) }
  }
</style>