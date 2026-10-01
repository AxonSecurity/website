// Shared by the server layout (inline gate script) and the client Preloader.
// Kept free of 'use client' so the layout receives plain strings.

export const INTRO_SEEN_KEY = 'axon-intro-seen'
export const INTRO_SEEN_CLASS = 'intro-seen'

// Runs inline before the preloader is parsed: ?intro=1 forces the boot film,
// ?intro=0 or an earlier play in this browser session skips it.
export const INTRO_GATE_SCRIPT = `try{var q=new URLSearchParams(location.search).get('intro');if(q!=='1'&&(q==='0'||sessionStorage.getItem('${INTRO_SEEN_KEY}')==='1'))document.documentElement.classList.add('${INTRO_SEEN_CLASS}')}catch(e){}`
