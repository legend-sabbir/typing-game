import { writable } from 'svelte/store';

export const store = writable({ times: 30, words: 100 });