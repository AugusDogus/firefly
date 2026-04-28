# Firefly Turn Flow

A single-page player aid for the Firefly board game (Gale Force Nine, 2013). Mobile-first.

Not affiliated with Gale Force Nine or 20th Century Fox. Firefly is &copy; 20th Century Fox; Firefly: The Game is &copy; Gale Force Nine.

## Stack

- [TanStack Start](https://tanstack.com/start) (TanStack Router, Vite, Nitro)
- React 19, TypeScript, Tailwind CSS v4
- shadcn/ui
- Bun

## Develop

```bash
bun install
bun run dev          # http://localhost:3000
```

## Build

```bash
bun run build
bun run preview
```

## Other scripts

```bash
bun run test
bun run lint
bun run format
bun run check
```

## Layout

- `src/routes/__root.tsx`: document shell, head metadata, favicon
- `src/routes/index.tsx`: turn-flow chart, tracks, reference cards, drawer
- `src/styles.css`: design tokens, paper texture, type stack
- `src/components/ui/`: shadcn primitives
- `public/serenity.png`: favicon / PWA icon

## Adding shadcn components

```bash
bunx shadcn@latest add <component>
```
