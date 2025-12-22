// src/mf/boot.ts
import AboutUs from '$lib/AboutUs.svelte';
import { mount as svelteMount } from 'svelte';

// Svelte 5 'mount'가 반환하는 핸들 타입(간단 정의)
type Handle = { destroy: () => void; update?: (p: Record<string, any>) => void };

export function mount(target: HTMLElement, props?: { storageKey?: string }): Handle {
    const handle = svelteMount(AboutUs, { target, props }) as Handle;
    return {
        destroy: () => handle.destroy(),
        update: (p) => handle.update?.(p),
    };
}

// (선택) default로도 내보내면 트리쉐이킹 쉬움
export default mount;
