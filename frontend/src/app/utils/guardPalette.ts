/**
 * Theme-aware palette for guard (vigia) components.
 * Dark mode: high-contrast white/light text on dark backgrounds.
 * Light mode: high-contrast dark text on light backgrounds.
 */
export function getGuardPalette(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    return {
      /* Backgrounds */
      bg:       '#07101E',
      surface:  '#0D1829',
      card:     '#0F1E30',
      navBg:    '#060E1A',

      /* Borders */
      border:   'rgba(0,200,120,0.12)',
      borderHi: 'rgba(0,200,120,0.45)',

      /* Accent colors */
      green:    '#00D48A',   /* slightly brighter for dark bg */
      amber:    '#FBB53A',
      red:      '#FF4545',
      blue:     '#5B9BFF',

      /* Text — always high contrast on dark bg */
      text:     '#FFFFFF',       /* primary text: pure white */
      textSub:  '#D1DCF0',       /* secondary: very light blue-gray */
      muted:    '#7A90AE',       /* labels: medium (still readable on dark) */
      dim:      '#1A2E45',       /* surface for empty/inactive elements */
    } as const;
  }

  return {
    /* Backgrounds */
    bg:       '#EFF4FF',
    surface:  '#FFFFFF',
    card:     '#FFFFFF',
    navBg:    '#FFFFFF',

    /* Borders */
    border:   'rgba(30,58,138,0.12)',
    borderHi: 'rgba(37,99,235,0.5)',

    /* Accent colors */
    green:    '#047857',   /* dark green for light bg */
    amber:    '#B45309',
    red:      '#B91C1C',
    blue:     '#1D4ED8',

    /* Text — always high contrast on light bg */
    text:     '#0F172A',       /* primary text: near-black */
    textSub:  '#1E293B',       /* secondary: dark slate */
    muted:    '#475569',       /* labels: mid-dark (4.5:1+ on white) */
    dim:      '#E8EFF9',       /* surface for empty/inactive elements */
  } as const;
}

export type GuardPalette = ReturnType<typeof getGuardPalette>;
