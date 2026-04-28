# Firefly · Turn Flow

A mobile-first, single-page **player aid** for *Firefly: The Game* (Gale Force Nine, 2013) — laid out like a captain's manifest so you can quickly look up what each action does on your phone at the table.

Live tracks for every action — Fly, Buy, Deal, Work — with the real branch points (Full Burn vs Mosey, Buy Supplies vs Shore Leave, Job vs Make-Work, the four Work steps), plus reference cards for Free Actions and Disgruntled rules. Verified against the printed rulebook.

Not affiliated with Gale Force Nine or 20th Century Fox. *Firefly* is &copy; 20th Century Fox; *Firefly: The Game* is &copy; Gale Force Nine.

## Stack

- [TanStack Start](https://tanstack.com/start) (TanStack Router + Vite + Nitro)
- React 19, TypeScript, Tailwind CSS v4
- shadcn/ui (`new-york` style, zinc base) for primitives
- Bun as the runtime / package manager

## Develop

```bash
bun install
bun run dev          # http://localhost:3000
```

## Build

```bash
bun run build        # production build via Vite + Nitro
bun run preview      # preview the production build
```

## Quality gates

```bash
bun run test         # vitest
bun run lint         # eslint (tanstack/eslint-config)
bun run format       # prettier --write . && eslint --fix
bun run check        # prettier --check
```

## Layout

- `src/routes/__root.tsx` — document shell, head metadata, favicon
- `src/routes/index.tsx` — the entire turn-flow chart, tracks, reference cards, bottom-sheet drawer
- `src/styles.css` — design tokens, paper texture, stamp/dossier styles, Rye + Special Elite + DM Mono + Fraunces type stack
- `src/components/ui/` — shadcn primitives
- `public/serenity.png` — favicon / PWA icon (the 宁静 emblem)

## Adding shadcn components

```bash
bunx shadcn@latest add <component>
```
