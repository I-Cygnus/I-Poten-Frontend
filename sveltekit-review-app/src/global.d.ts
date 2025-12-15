// src/global.d.ts
import type { SvelteComponentTyped } from 'svelte';

declare module '*.svelte' {
    export default class Component extends SvelteComponentTyped<any, any, any> { }
}

export { };
