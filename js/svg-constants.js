// Define SVG constants
const SVG_ADD_ROW = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-plus">
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
  <line x1="16" x2="22" y1="5" y2="5"/>
  <line x1="19" x2="19" y1="2" y2="8"/>
  <circle cx="9" cy="9" r="2"/>
  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
</svg>`;

const SVG_REMOVE_ROW = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2">
<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
<line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
</svg>`;

const SVG_ADD_TIMEFRAME = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images">
  <path d="M18 22H4a2 2 0 0 1-2-2V6"/>
  <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/>
  <circle cx="12" cy="8" r="2"/>
  <rect width="16" height="16" x="6" y="2" rx="2"/>
</svg>`;

const SVG_REMOVE_TIMEFRAME = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="lucide lucide-image-off">
  <line x1="2" x2="22" y1="2" y2="22"/>
  <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/>
  <line x1="13.5" x2="6" y1="13.5" y2="21"/>
  <line x1="18" x2="21" y1="12" y2="15"/>
  <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/>
  <path d="M21 15V5a2 2 0 0 0-2-2H9"/>
</svg>`;

const SVG_UPLOAD_IMAGE = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="lucide lucide-image-up">
  <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/>
  <path d="m14 19.5 3-3 3 3"/>
  <path d="M17 22v-5.5"/>
  <circle cx="9" cy="9" r="2"/>
</svg>`;

const SVG_SHOW_CURVES = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-spline">
<circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/>
<path d="M5 17A12 12 0 0 1 17 5"/>
</svg>`;




export {SVG_ADD_ROW, SVG_REMOVE_ROW, SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, SVG_UPLOAD_IMAGE, SVG_SHOW_CURVES};