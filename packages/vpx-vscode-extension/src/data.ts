export interface VpxSuggestion {
  readonly label: string;
  readonly detail: string;
  readonly documentation: string;
}

export interface VpxUnitSuggestion extends VpxSuggestion {
  readonly insertText: string;
}

export const UNIT_SUGGESTIONS: readonly VpxUnitSuggestion[] = [
  {
    label: 'vpx',
    detail: '📐 Viewport pixel → vw',
    documentation: '**vpx** — Viewport pixel unit.\n\nConverts to a vw value based on the configured viewport width.\n\nExample: `width: 120vpx;` → `width: 32vw;` (375px viewport)',
    insertText: 'vpx'
  },
  {
    label: 'maxvpx',
    detail: '⬆️ Viewport pixel with minimum bound',
    documentation: '**maxvpx** — Viewport pixel with minimum bound.\n\nOutputs `max(vw, Npx)` to ensure the value never drops below the pixel fallback.\n\nExample: `font-size: 36maxvpx;` → `font-size: max(9.6vw, 36px);`',
    insertText: 'maxvpx'
  },
  {
    label: 'minvpx',
    detail: '⬇️ Viewport pixel with maximum bound',
    documentation: '**minvpx** — Viewport pixel with maximum bound.\n\nOutputs `min(vw, Npx)` to ensure the value never exceeds the pixel limit.\n\nExample: `width: 640minvpx;` → `width: min(170.67vw, 640px);`',
    insertText: 'minvpx'
  },
  {
    label: 'cvpx',
    detail: '🔒 Clamped viewport pixel',
    documentation: '**cvpx** — Clamped viewport pixel.\n\nGenerates `clamp(minPx, vw, maxPx)` for responsive ranges with both upper and lower bounds.',
    insertText: 'cvpx'
  }
];

export interface VpxFunctionSuggestion extends VpxSuggestion {
  readonly insertText: string;
}

export const FUNCTION_SUGGESTIONS: readonly VpxFunctionSuggestion[] = [
  {
    label: 'linear-vpx(minValue, maxValue)',
    detail: '📈 Linear interpolation (short form)',
    documentation: '**linear-vpx()** — Fluid interpolation helper.\n\n`linear-vpx(minValue, maxValue)` uses the plugin defaults for `linearMinWidth` and `linearMaxWidth`.\n\nExample: `font-size: linear-vpx(16, 24);`',
    insertText: 'linear-vpx(${1:minValue}, ${2:maxValue})'
  },
  {
    label: 'linear-vpx(minValue, maxValue, minViewportWidth, maxViewportWidth)',
    detail: '📈 Linear interpolation (full form)',
    documentation: '**linear-vpx()** — Fluid interpolation with custom viewport range.\n\n`linear-vpx(minValue, maxValue, minViewportWidth, maxViewportWidth)` outputs a clamp/calc expression spanning the provided breakpoints.\n\nExample: `width: linear-vpx(840, 1000, 1200, 1920);`',
    insertText: 'linear-vpx(${1:minValue}, ${2:maxValue}, ${3:minViewportWidth}, ${4:maxViewportWidth})'
  }
];

export const HOVER_ENTRIES = new Map<string, string>([
  ['vpx', '**vpx** — Viewport pixel unit.\n\nConverts to a vw value based on the configured viewport width.'],
  ['maxvpx', '**maxvpx** — Viewport pixel with minimum bound.\n\nOutputs `max(vw, Npx)` to ensure the value never drops below the pixel fallback.'],
  ['minvpx', '**minvpx** — Viewport pixel with maximum bound.\n\nOutputs `min(vw, Npx)` to ensure the value never exceeds the pixel limit.'],
  ['cvpx', '**cvpx** — Clamped viewport pixel.\n\nGenerates `clamp(minPx, vw, maxPx)` for responsive ranges.'],
  ['linear-vpx', '**linear-vpx()** — Fluid interpolation helper.\n\n`linear-vpx(min, max, minViewport, maxViewport)` becomes a `clamp` + `calc` expression for smooth scaling.']
]);
