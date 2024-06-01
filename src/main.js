import './app.css'
import App from './App.svelte'

const el = document.createElement("div")

const app = new App({
  target: document.getElementById('app'),
})


export default app
