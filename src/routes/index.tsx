import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  Coins,
  HandCoins,
  Handshake,
  Lock,
  RotateCcw,
  ShipWheel,
  Sparkles,
  Users,
  Wind,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: Home })

type FlowGroup = 'fly' | 'buy' | 'deal' | 'work'

type FlowNode = {
  id: string
  title: string
  eyebrow: string
  group: FlowGroup
  summary: string
  details: Array<string>
  next?: Array<string>
}

type ActionTrack = {
  id: FlowGroup
  title: string
  glyph: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  nodes: Array<FlowNode>
}

const actionTracks: Array<ActionTrack> = [
  {
    id: 'fly',
    title: 'Fly',
    glyph: 'I',
    icon: ShipWheel,
    description:
      'Move the ship. Choose Full Burn for distance or Mosey for one quiet sector.',
    nodes: [
      {
        id: 'fly-choice',
        title: 'Choose Fly',
        eyebrow: 'Anywhere',
        group: 'fly',
        summary:
          'Begin a movement action. Pick Full Burn or Mosey — they are mutually exclusive.',
        details: [
          'You can take Fly from any sector.',
          'Decide between Full Burn (fast, risky) and Mosey (slow, safe).',
        ],
        next: ['full-burn', 'mosey'],
      },
      {
        id: 'full-burn',
        title: 'Full Burn',
        eyebrow: 'Burn fuel',
        group: 'fly',
        summary:
          'Spend 1 Fuel, move to an adjacent sector, then draw a Nav Card.',
        details: [
          'Spend 1 Fuel token to initiate Full Burn.',
          'Move your Firefly to an adjacent sector.',
          'Draw a Nav Card from the matching deck (Alliance for blue sectors, Border for yellow).',
        ],
        next: ['nav-resolve'],
      },
      {
        id: 'nav-resolve',
        title: 'Resolve Nav Card',
        eyebrow: 'Keep Flying · Full Stop · Evade',
        group: 'fly',
        summary:
          'Each Nav Card option ends in Keep Flying, Full Stop, or Evade.',
        details: [
          'Keep Flying: you may move again and draw another Nav Card, up to your Drive Core’s max Range.',
          'Full Stop: ship halts in the current sector. No further movement.',
          'Evade: move to an adjacent sector. Do not draw another Nav Card.',
          'Drawing the Alliance Cruiser card causes a Full Stop and triggers Alliance Contact.',
        ],
        next: ['end-turn'],
      },
      {
        id: 'mosey',
        title: 'Mosey',
        eyebrow: 'Slow & quiet',
        group: 'fly',
        summary: 'Move 1 sector. No Fuel spent. No Nav Card drawn.',
        details: [
          'Move your Firefly exactly 1 sector.',
          'Do not spend a Fuel token.',
          'Do not draw from the Nav decks.',
        ],
        next: ['end-turn'],
      },
    ],
  },
  {
    id: 'buy',
    title: 'Buy',
    glyph: 'II',
    icon: HandCoins,
    description:
      'At a Supply Planet. Buy Crew, Gear and Upgrades — or take Shore Leave.',
    nodes: [
      {
        id: 'buy-start',
        title: 'Choose Buy',
        eyebrow: 'Supply Planet',
        group: 'buy',
        summary:
          'Your Firefly must be in a sector with a Supply Planet. Pick one of two paths.',
        details: [
          'Buy Supply Cards (Crew / Gear / Ship Upgrades) and restock Fuel & Parts, OR',
          'Use this Buy Action for Shore Leave instead.',
        ],
        next: ['buy-supply', 'shore-leave'],
      },
      {
        id: 'buy-supply',
        title: 'Consider 3, Buy 2',
        eyebrow: 'Supply deck',
        group: 'buy',
        summary:
          'Look through the discard pile, draw face-down to fill 3, then pay the bank for up to 2.',
        details: [
          'Pull up to 3 cards from the matching Supply discard pile to Consider.',
          'For each card less than 3 you pulled, draw 1 face-down card from the Supply deck.',
          'Pay the bank for up to 2 of the 3 cards (you don’t have to buy any).',
          'Unbought cards go face-up to the discard pile.',
          'You may also buy Fuel ($100 each) and Parts ($300 each) from the bank.',
        ],
        next: ['end-turn'],
      },
      {
        id: 'shore-leave',
        title: 'Shore Leave',
        eyebrow: 'Crew recovery',
        group: 'buy',
        summary:
          'Pay $100 per Crew (Disgruntled or not), then remove every Disgruntled token.',
        details: [
          'Pay the bank $100 for each Crew on the ship — Disgruntled or not.',
          'After paying, remove all Disgruntled tokens from your Crew.',
          'Shore Leave replaces buying Supply Cards on this Buy Action.',
        ],
        next: ['end-turn'],
      },
    ],
  },
  {
    id: 'deal',
    title: 'Deal',
    glyph: 'III',
    icon: Sparkles,
    description: 'At a Contact. Take Jobs — and sell goods if you’re Solid.',
    nodes: [
      {
        id: 'deal-start',
        title: 'Choose Deal',
        eyebrow: 'Contact sector',
        group: 'deal',
        summary:
          'Your Firefly must be in the sector of the Contact you want to Deal with.',
        details: [
          'Each Contact has their own deck of Jobs.',
          'Max 3 inactive Jobs in your hand at any time.',
        ],
        next: ['deal-consider'],
      },
      {
        id: 'deal-consider',
        title: 'Consider 3, Accept 2',
        eyebrow: 'Job deck',
        group: 'deal',
        summary:
          'Look through the Contact’s discard pile, draw to fill 3, then accept up to 2 Jobs.',
        details: [
          'Pull up to 3 Jobs from the Contact’s discard pile to Consider.',
          'For each card less than 3 you pulled, draw 1 face-down card from the deck.',
          'Accept up to 2 of the 3 (you don’t have to accept any).',
          'Unaccepted cards go face-up to the discard pile.',
          'Inactive Jobs are kept concealed in your hand until you Work them.',
        ],
        next: ['deal-solid'],
      },
      {
        id: 'deal-solid',
        title: 'If Solid: Sell Goods',
        eyebrow: 'Solid only',
        group: 'deal',
        summary:
          'When Solid with this Contact, you may also sell Cargo and Contraband to them.',
        details: [
          'Becoming Solid happens automatically when you finish a Job for that Contact.',
          'When Solid, sell prices are listed on the Contact side of the Job Cards.',
          'Receiving a Warrant while Working that Contact’s Job loses Solid status.',
          'Any Warrant also loses Harken rep; you can’t become Solid with Harken while Wanted.',
        ],
        next: ['end-turn'],
      },
    ],
  },
  {
    id: 'work',
    title: 'Work',
    glyph: 'IV',
    icon: Users,
    description:
      'Advance one Job — or take Make-Work for a guaranteed payout.',
    nodes: [
      {
        id: 'work-start',
        title: 'Choose Work',
        eyebrow: 'Job location',
        group: 'work',
        summary:
          'Be at the Pick-Up Location (Delivery) or Target Location (Crime). Or take Make-Work at a planet if you have nothing to do.',
        details: [
          'A Work Action advances a single Job.',
          'You may have up to 3 Active Jobs at once, in addition to 3 Inactive in hand.',
          'Once placed face-up beside your Ship Card, a Job is Active.',
        ],
        next: ['work-kind'],
      },
      {
        id: 'work-kind',
        title: 'Job or Make-Work',
        eyebrow: 'Pick a path',
        group: 'work',
        summary: 'Work the printed Job, or take a guaranteed Make-Work payout.',
        details: [
          'Work a Job: follow the four steps — Equip, Confirm Needs, Do the Job, Outcome.',
          'Make-Work: at any planet with nothing to do, take $200 from the bank and end.',
        ],
        next: ['work-equip', 'make-work'],
      },
      {
        id: 'work-equip',
        title: 'Equip Crew',
        eyebrow: 'Step 1',
        group: 'work',
        summary:
          'Lock in which Gear each Crew is carrying. Each Crew or Leader may carry 1 Gear.',
        details: [
          'Once Working, Gear cannot change hands until the attempt is over.',
          'Crew or Gear left on the ship cannot be used during the Job.',
          'If a Crew with Gear is killed, that Gear returns to the ship.',
        ],
        next: ['work-needs'],
      },
      {
        id: 'work-needs',
        title: 'Confirm Needs',
        eyebrow: 'Step 2',
        group: 'work',
        summary:
          'The Crew you brought must meet every Skill / Keyword listed in the Job’s Needs tab.',
        details: [
          'If Needs are not met, the Job cannot be advanced this turn.',
          'Some Jobs replace Needs with a Skill Test taken at the listed step.',
          'Jobs with no Needs tab have no prerequisites.',
        ],
        next: ['work-do'],
      },
      {
        id: 'work-do',
        title: 'Do the Job · Misbehave',
        eyebrow: 'Step 3',
        group: 'work',
        summary:
          'Follow the Job text. Illegal Jobs require Misbehaving — draw the listed number of cards.',
        details: [
          'Legal: load Cargo, deliver, etc. — follow the Job text exactly.',
          'Illegal: draw and resolve Misbehave Cards one at a time. You can’t bail out early.',
          'Each Misbehave card ends in Proceed, Attempt Botched, or Warrant Issued.',
          'Botched: try again on a future turn. Warrant Issued: gain a Warrant, discard the Job, and lose applicable rep.',
        ],
        next: ['work-payout'],
      },
      {
        id: 'work-payout',
        title: 'Get Paid · Pay Cut',
        eyebrow: 'Step 4',
        group: 'work',
        summary:
          'Take the Pay listed, become Solid with the Contact, then pay each Crew their Cut — or they go Disgruntled.',
        details: [
          'Take Credits from the bank equal to the Job’s Pay (plus any Profession Bonus, paid once).',
          'Slide the completed Job under your Ship Card to record Solid status with that Contact.',
          'Pay each Crew the Cut printed on their card — even Crew that didn’t work the Job.',
          'Any Crew you skip immediately gets a Disgruntled token.',
          'Leaders are Entrepreneurs and never take a Cut.',
        ],
        next: ['end-turn'],
      },
      {
        id: 'make-work',
        title: 'Make-Work',
        eyebrow: 'No Job? No problem.',
        group: 'work',
        summary:
          'At any sector with a planet, if you have nothing to do, take $200 from the bank instead of Working a Job.',
        details: [
          'No Crew Cut is paid for Make-Work.',
          'No Solid status changes — this is just a small payday.',
        ],
        next: ['end-turn'],
      },
    ],
  },
]

const endNode: FlowNode = {
  id: 'end-turn',
  title: 'End the Action',
  eyebrow: 'Action complete',
  group: 'fly',
  summary:
    'Finish this action. You may take 2 different actions per turn — never the same one twice.',
  details: [
    'After you’re done with your actions, play passes to your left.',
    'You may also trade or hire Disgruntled Crew while stopped in the same sector without using an action.',
  ],
}

const allNodes = [...actionTracks.flatMap((track) => track.nodes), endNode]

function descendantsOf(
  nodeMap: Map<string, FlowNode>,
  startId: string,
): Set<string> {
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const id = stack.pop()
    if (id == null || visited.has(id)) continue
    if (!nodeMap.has(id)) continue
    visited.add(id)
    const node = nodeMap.get(id)
    if (node?.next) {
      for (const next of node.next) stack.push(next)
    }
  }
  return visited
}

function buildConflictMap(
  nodes: Array<FlowNode>,
): Map<string, Set<string>> {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const conflicts = new Map<string, Set<string>>()
  for (const n of nodes) conflicts.set(n.id, new Set())

  for (const branchPoint of nodes) {
    if (!branchPoint.next || branchPoint.next.length <= 1) continue
    const childTerritories = branchPoint.next.map((childId) =>
      descendantsOf(nodeMap, childId),
    )
    for (let i = 0; i < childTerritories.length; i++) {
      for (let j = 0; j < childTerritories.length; j++) {
        if (i === j) continue
        for (const a of childTerritories[i]) {
          const set = conflicts.get(a)
          if (!set) continue
          for (const b of childTerritories[j]) set.add(b)
        }
      }
    }
  }
  return conflicts
}

const conflictMaps: Record<FlowGroup, Map<string, Set<string>>> = {
  fly: buildConflictMap(actionTracks[0].nodes),
  buy: buildConflictMap(actionTracks[1].nodes),
  deal: buildConflictMap(actionTracks[2].nodes),
  work: buildConflictMap(actionTracks[3].nodes),
}

function isNodeLocked(node: FlowNode, completed: Set<string>): boolean {
  if (completed.has(node.id)) return false
  const conflicts = conflictMaps[node.group]?.get(node.id)
  if (!conflicts) return false
  for (const id of conflicts) {
    if (completed.has(id)) return true
  }
  return false
}

const freeActions = [
  'Trade Crew, Fuel, Parts, Cargo, Contraband, Gear and Upgrades while stopped with players in the same sector.',
  'Hire a rival’s Disgruntled Crew while stopped in the same sector by paying the bank their hire cost.',
  'Browse public discard piles outside your turn to plan Buy and Deal choices.',
]

const disgruntledNotes = [
  'A Crew you don’t pay their Cut after a Job becomes Disgruntled.',
  'A Disgruntled Crew can be poached by another captain stopped in the same sector for their hire fee.',
  'A second Disgruntled token sends a Crew jumping ship — discarded to their Supply discard pile.',
  'Leaders are Lucky: when killed they return Disgruntled instead. A second token fires every other Crew, then clears the Leader’s token.',
]

const trackTone: Record<FlowGroup, { ink: string; bg: string; mark: string }> =
  {
    fly: {
      ink: 'text-[#8a2b13]',
      bg: 'bg-[rgba(177,59,28,0.08)]',
      mark: 'bg-[#b13b1c]',
    },
    buy: {
      ink: 'text-[#6f4a14]',
      bg: 'bg-[rgba(201,138,50,0.14)]',
      mark: 'bg-[#c98a32]',
    },
    deal: {
      ink: 'text-[#5a2a4a]',
      bg: 'bg-[rgba(110,55,90,0.12)]',
      mark: 'bg-[#7a3961]',
    },
    work: {
      ink: 'text-[#3b4a2a]',
      bg: 'bg-[rgba(96,117,80,0.14)]',
      mark: 'bg-[#607550]',
    },
  }

function Home() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [focusedTrack, setFocusedTrack] = useState<FlowGroup | 'all'>('all')
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const selectedNode = useMemo(
    () =>
      selectedNodeId
        ? (allNodes.find((node) => node.id === selectedNodeId) ?? null)
        : null,
    [selectedNodeId],
  )

  const visibleTracks = actionTracks.filter(
    (track) => focusedTrack === 'all' || track.id === focusedTrack,
  )

  const totalNodes = allNodes.length
  const progress = Math.round((completed.size / totalNodes) * 100)

  const toggleComplete = (nodeId: string) => {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  return (
    <div className="no-tap-highlight relative min-h-screen text-[var(--ink)]">
      <TopStrip
        progress={progress}
        completedCount={completed.size}
        totalCount={totalNodes}
        onReset={() => setCompleted(new Set())}
      />

      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-5 sm:px-6">
        <Hero progress={progress} />

        <TrackSelector
          focused={focusedTrack}
          onSelect={setFocusedTrack}
          completed={completed}
        />

        <section className="mt-6 flex flex-col gap-7">
          {visibleTracks.map((track, idx) => (
            <TrackDossier
              key={track.id}
              track={track}
              index={idx}
              completed={completed}
              onSelect={(id) => setSelectedNodeId(id)}
              onToggleComplete={toggleComplete}
              selectedNodeId={selectedNode?.id ?? null}
            />
          ))}
        </section>

        <EndStamp
          complete={completed.has(endNode.id)}
          onTap={() => setSelectedNodeId(endNode.id)}
          onToggleComplete={() => toggleComplete(endNode.id)}
        />

        <ReferenceCards />

        <Footer />
      </main>

      <NodeSheet
        node={selectedNode}
        isComplete={selectedNode ? completed.has(selectedNode.id) : false}
        isLocked={selectedNode ? isNodeLocked(selectedNode, completed) : false}
        onClose={() => setSelectedNodeId(null)}
        onSelect={setSelectedNodeId}
        onToggleComplete={toggleComplete}
      />
    </div>
  )
}

function TopStrip({
  progress,
  completedCount,
  totalCount,
  onReset,
}: {
  progress: number
  completedCount: number
  totalCount: number
  onReset: () => void
}) {
  const serial = useMemo(() => {
    const segs = ['SR', 'OPS', 'NAV']
    const stamp = `${segs[completedCount % segs.length]}-${String(
      0x4f1 + completedCount * 7,
    ).padStart(4, '0')}`
    return stamp
  }, [completedCount])

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-[rgba(243,231,201,0.92)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-4 py-2 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--rust)] text-[var(--bone)] flicker">
          <Wind className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden leading-none">
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]">
            S.S. SERENITY
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-fade)]">
            <span className="inline-block size-1.5 shrink-0 rounded-full bg-[var(--rust)]" />
            <span className="truncate">
              {serial} · {progress}%
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-[var(--line-strong)] bg-[var(--bone)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink)] transition active:scale-95"
          aria-label={`Reset checks. ${completedCount} of ${totalCount} complete.`}
        >
          <RotateCcw className="size-3" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  )
}

function Hero({ progress }: { progress: number }) {
  return (
    <section className="rise-in mt-2">
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--line-strong)]" />
        <span className="serial">CAPTAIN&apos;S OPERATIONS LOG</span>
        <span className="h-px flex-1 bg-[var(--line-strong)]" />
      </div>

      <h1 className="mt-3 font-display text-[2.4rem] leading-[0.95] text-[var(--ink)] sm:text-6xl">
        FIREFLY
        <span className="ml-1 text-[var(--rust)]">·</span>
        <br />
        <span className="text-[var(--rust-deep)]">TURN</span>{' '}
        <span className="text-[var(--ink)]">FLOW</span>
      </h1>

      <p className="mt-3 max-w-prose font-pulp text-[1.02rem] italic leading-snug text-[var(--ink-soft)] sm:text-lg">
        A pocket-sized field manual for the working captain. Each turn you
        may take <span className="not-italic font-mono text-[0.92em] text-[var(--rust-deep)]">2 different actions</span> —
        never the same one twice. Pick a route, read the orders, check off
        your moves.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-mono text-[var(--ink-soft)]">
        <Telemetry label="Actions" value="2" hint="per turn" />
        <Telemetry
          label="Tracks"
          value={`${actionTracks.length}`}
          hint="paths"
        />
        <Telemetry
          label="Progress"
          value={`${progress}%`}
          hint="checked"
        />
      </div>
    </section>
  )
}

function Telemetry({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="relative overflow-hidden border border-[var(--line-strong)] bg-[rgba(247,238,212,0.6)] px-2.5 py-2">
      <div className="serial">{label}</div>
      <div className="mt-0.5 font-display text-xl leading-none text-[var(--ink)]">
        {value}
      </div>
      <div className="mt-0.5 text-[9px] uppercase tracking-mono text-[var(--ink-fade)]">
        {hint}
      </div>
      <span className="pointer-events-none absolute -right-2 -top-2 h-6 w-6 rotate-45 border border-[var(--line-strong)] bg-[var(--brass-pale)]/40" />
    </div>
  )
}

function TrackSelector({
  focused,
  onSelect,
  completed,
}: {
  focused: FlowGroup | 'all'
  onSelect: (focus: FlowGroup | 'all') => void
  completed: Set<string>
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-end justify-between gap-2">
        <span className="serial">CHOOSE A ROUTE</span>
        <span className="font-mono text-[10px] uppercase tracking-mono text-[var(--ink-fade)]">
          swipe →
        </span>
      </div>
      <div className="snap-row scrollbar-rust -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <StampPill
          active={focused === 'all'}
          onClick={() => onSelect('all')}
          label="All"
          glyph="✶"
          tone="rust"
          rotate="stamp-rotate-1"
          count={`${actionTracks.length}`}
        />
        {actionTracks.map((track, idx) => {
          const Icon = track.icon
          const completedInTrack = track.nodes.filter((n) =>
            completed.has(n.id),
          ).length
          const tones = ['rust', 'ink', 'brass', 'rust', 'ink'] as const
          const rotates = [
            'stamp-rotate-2',
            'stamp-rotate-1',
            'stamp-rotate-3',
            'stamp-rotate-2',
            'stamp-rotate-1',
          ] as const
          return (
            <StampPill
              key={track.id}
              active={focused === track.id}
              onClick={() => onSelect(track.id)}
              label={track.title}
              glyph={track.glyph}
              icon={Icon}
              tone={tones[idx % tones.length]}
              rotate={rotates[idx % rotates.length]}
              count={`${completedInTrack}/${track.nodes.length}`}
            />
          )
        })}
      </div>
    </section>
  )
}

function StampPill({
  active,
  onClick,
  label,
  glyph,
  icon: Icon,
  tone,
  rotate,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  glyph: string
  icon?: React.ComponentType<{ className?: string }>
  tone: 'rust' | 'ink' | 'brass'
  rotate: string
  count: string
}) {
  const stampClass =
    tone === 'rust'
      ? 'stamp-rust'
      : tone === 'brass'
        ? 'stamp-brass'
        : 'stamp-ink'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-[5.6rem] shrink-0 flex-col items-center gap-1 px-1 py-2 transition active:scale-95',
        active
          ? 'opacity-100'
          : 'opacity-65 hover:opacity-100',
      )}
      aria-pressed={active}
    >
      <div
        className={cn(
          'stamp smudge flex size-[68px] items-center justify-center rounded-full text-[22px]',
          stampClass,
          rotate,
          active && 'shadow-[0_3px_0_rgba(28,20,16,0.18)]',
        )}
      >
        {Icon ? <Icon className="size-6" strokeWidth={1.75} /> : <span>{glyph}</span>}
      </div>
      <span
        className={cn(
          'font-display text-[13px] tracking-[0.05em] text-[var(--ink)]',
          active && 'text-[var(--rust-deep)]',
        )}
      >
        {label}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-mono text-[var(--ink-fade)]">
        {count}
      </span>
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[var(--rust)]" />
      )}
    </button>
  )
}

type ConnectorKind = 'sequence' | 'branch-start' | 'or'

function getConnectorKind(prev: FlowNode, current: FlowNode): ConnectorKind {
  if (prev.next?.includes(current.id)) {
    return (prev.next.length ?? 0) > 1 ? 'branch-start' : 'sequence'
  }
  return 'or'
}

function Connector({ kind }: { kind: ConnectorKind }) {
  if (kind === 'or') {
    return (
      <div
        className="relative my-3 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--line-strong)] opacity-70" />
        <span className="relative bg-[var(--parchment)] px-3 font-display text-[0.78rem] uppercase tracking-[0.32em] text-[var(--rust-deep)]">
          — or —
        </span>
      </div>
    )
  }
  if (kind === 'branch-start') {
    return (
      <div
        className="my-2 flex flex-col items-center gap-0.5"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--ink-fade)]">
          Pick one
        </span>
        <span className="route-line h-6" />
      </div>
    )
  }
  return (
    <div className="my-2 flex justify-center" aria-hidden="true">
      <span className="route-line h-7" />
    </div>
  )
}

function TrackDossier({
  track,
  index,
  completed,
  onSelect,
  onToggleComplete,
  selectedNodeId,
}: {
  track: ActionTrack
  index: number
  completed: Set<string>
  onSelect: (id: string) => void
  onToggleComplete: (id: string) => void
  selectedNodeId: string | null
}) {
  const Icon = track.icon
  const tone = trackTone[track.id]
  const completedCount = track.nodes.filter((n) => completed.has(n.id)).length

  return (
    <article
      className={cn(
        'dossier rise-in relative overflow-hidden rounded-sm px-4 pb-5 pt-7 sm:px-6',
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <header className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            'stamp smudge flex size-14 shrink-0 items-center justify-center rounded-full',
            tone.ink,
            'bg-[rgba(247,238,212,0.7)]',
            index % 2 === 0 ? 'stamp-rotate-1' : 'stamp-rotate-2',
          )}
          aria-hidden="true"
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-mono text-[var(--ink-fade)]">
              ROUTE · {track.glyph}
            </span>
            <span className="serial">/ {completedCount}/{track.nodes.length}</span>
          </div>
          <h2 className="font-display text-3xl leading-[1] text-[var(--ink)]">
            {track.title}
          </h2>
          <p className="mt-1.5 font-pulp text-[0.95rem] italic leading-snug text-[var(--ink-soft)]">
            {track.description}
          </p>
        </div>
      </header>

      <div className="divider-stitched mb-4" />

      <ol className="relative flex flex-col">
        {track.nodes.map((node, nodeIndex) => {
          const isLast = nodeIndex === track.nodes.length - 1
          const nextNode = isLast ? null : track.nodes[nodeIndex + 1]
          const connectorKind = nextNode
            ? getConnectorKind(node, nextNode)
            : null
          return (
            <li key={node.id} className="relative">
              <FlowCard
                node={node}
                ordinal={nodeIndex + 1}
                tone={tone}
                selected={selectedNodeId === node.id}
                complete={completed.has(node.id)}
                locked={isNodeLocked(node, completed)}
                onSelect={onSelect}
                onToggleComplete={onToggleComplete}
              />
              {connectorKind && <Connector kind={connectorKind} />}
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-mono text-[var(--ink-fade)]">
        <span>END OF ROUTE {track.glyph}</span>
        <span className="flex items-center gap-1">
          <ArrowRight className="size-3" /> END
        </span>
      </div>
    </article>
  )
}

function FlowCard({
  node,
  ordinal,
  tone,
  selected,
  complete,
  locked,
  onSelect,
  onToggleComplete,
}: {
  node: FlowNode
  ordinal: number
  tone: { ink: string; bg: string; mark: string }
  selected: boolean
  complete: boolean
  locked: boolean
  onSelect: (id: string) => void
  onToggleComplete: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'group relative flex items-stretch gap-3 rounded-sm border border-[var(--line-strong)] bg-[rgba(247,238,212,0.7)] p-3.5 transition',
        'shadow-[0_2px_0_rgba(28,20,16,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]',
        selected && 'ring-2 ring-[var(--rust)] ring-offset-2 ring-offset-[var(--parchment)]',
        complete && 'bg-[rgba(96,117,80,0.10)]',
        locked && 'opacity-55 saturate-50',
      )}
      aria-disabled={locked}
    >
      <div className="flex w-12 shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed border-[var(--line-strong)] pr-3">
        <span className={cn('font-mono text-[10px] uppercase tracking-mono text-[var(--ink-fade)]')}>
          NO.
        </span>
        <span
          className={cn(
            'font-display text-2xl leading-none',
            complete ? 'text-[#3b4a2a] line-through decoration-2' : tone.ink,
          )}
        >
          {String(ordinal).padStart(2, '0')}
        </span>
        <span className={cn('mt-1 h-1.5 w-6 rounded-full opacity-70', tone.mark)} />
      </div>

      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left outline-none"
        onClick={() => onSelect(node.id)}
      >
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-sm border border-current px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-mono',
            tone.ink,
          )}
        >
          {node.eyebrow}
        </span>
        <h3
          className={cn(
            'font-display text-[1.35rem] leading-[1.05]',
            complete ? 'text-[var(--ink-fade)] line-through' : 'text-[var(--ink)]',
          )}
        >
          {node.title}
        </h3>
        <p className="line-clamp-2 text-[0.92rem] leading-snug text-[var(--ink-soft)]">
          {node.summary}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-mono text-[var(--rust-deep)]">
          Read orders <ChevronRight className="size-3" />
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (locked) return
          onToggleComplete(node.id)
        }}
        disabled={locked}
        className={cn(
          'flex size-11 shrink-0 items-center justify-center self-start rounded-full border-2 transition active:scale-90',
          locked
            ? 'cursor-not-allowed border-[var(--line-strong)] bg-[rgba(28,20,16,0.05)] text-[var(--ink-fade)]'
            : complete
              ? 'border-[#3b4a2a] bg-[#607550] text-[var(--bone)]'
              : 'border-[var(--line-strong)] bg-[var(--bone)] text-[var(--ink)] hover:border-[var(--rust)]',
        )}
        aria-pressed={complete}
        aria-label={
          locked
            ? `${node.title} is locked — alternative branch was taken`
            : `Mark ${node.title} ${complete ? 'incomplete' : 'complete'}`
        }
      >
        {locked ? (
          <Lock className="size-4" strokeWidth={2.25} />
        ) : complete ? (
          <CheckCircle2 className="size-5" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>
    </div>
  )
}

function EndStamp({
  complete,
  onTap,
  onToggleComplete,
}: {
  complete: boolean
  onTap: () => void
  onToggleComplete: () => void
}) {
  return (
    <section className="mt-7">
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--line-strong)]" />
        <span className="serial">FINALE</span>
        <span className="h-px flex-1 bg-[var(--line-strong)]" />
      </div>
      <div
        className={cn(
          'dossier-tape-bottom relative mt-3 flex w-full items-stretch gap-3 overflow-hidden rounded-sm border-2 border-[var(--ink)] bg-[var(--bone)] transition',
          complete && 'bg-[rgba(96,117,80,0.14)]',
        )}
      >
        <button
          type="button"
          onClick={onTap}
          className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left transition active:scale-[0.99]"
        >
          <div
            className={cn(
              'stamp smudge flex size-14 shrink-0 items-center justify-center rounded-full text-[var(--rust-deep)]',
              'stamp-rust stamp-rotate-3 font-display text-[10px]',
            )}
            aria-hidden="true"
          >
            END
          </div>
          <div className="min-w-0 flex-1">
            <div className="serial">ACTION COMPLETE</div>
            <h3 className="font-display text-2xl leading-tight text-[var(--ink)]">
              End the action
            </h3>
            <p className="text-[0.92rem] leading-snug text-[var(--ink-soft)]">
              All routes converge here. Resolve the path, then end.
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={onToggleComplete}
          className={cn(
            'mr-3 flex size-11 shrink-0 items-center justify-center self-center rounded-full border-2 transition active:scale-90',
            complete
              ? 'border-[#3b4a2a] bg-[#607550] text-[var(--bone)]'
              : 'border-[var(--line-strong)] bg-[var(--parchment)] text-[var(--ink)]',
          )}
          aria-label="Toggle end action complete"
        >
          {complete ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Circle className="size-5" />
          )}
        </button>
      </div>
    </section>
  )
}

function ReferenceCards() {
  return (
    <section className="mt-10 grid gap-4">
      <ReferenceBlock
        title="Free Actions"
        kicker="No Action Used"
        icon={Coins}
        tone="brass"
        items={freeActions}
      />
      <ReferenceBlock
        title="Disgruntled"
        kicker="Crew Discipline"
        icon={AlertTriangle}
        tone="rust"
        items={disgruntledNotes}
      />
    </section>
  )
}

function ReferenceBlock({
  title,
  kicker,
  icon: Icon,
  tone,
  items,
}: {
  title: string
  kicker: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'brass' | 'rust'
  items: Array<string>
}) {
  const stampClass = tone === 'brass' ? 'stamp-brass' : 'stamp-rust'

  return (
    <article className="relative overflow-hidden rounded-sm border border-[var(--line-strong)] bg-[rgba(247,238,212,0.7)] p-4 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_18px_-12px_rgba(60,30,12,0.4)]">
      <header className="mb-3 flex items-center gap-3">
        <div
          className={cn(
            'stamp smudge flex size-12 shrink-0 items-center justify-center rounded-full stamp-rotate-2',
            stampClass,
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div>
          <div className="serial">{kicker}</div>
          <h3 className="font-display text-2xl leading-none text-[var(--ink)]">
            {title}
          </h3>
        </div>
      </header>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={item}
            className="flex gap-2.5 border-l-2 border-[var(--line-strong)] pl-3 text-[0.94rem] leading-snug text-[var(--ink-soft)]"
          >
            <span className="font-mono text-[10px] uppercase tracking-mono text-[var(--ink-fade)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-dashed border-[var(--line-strong)] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-mono text-[var(--ink-fade)]">
        <span>Issued by · Serenity Quartermaster</span>
        <span className="flex items-center gap-1.5">
          <Handshake className="size-3" />
          Aim to misbehave
        </span>
      </div>
      <p className="mt-2 max-w-prose font-pulp text-[0.85rem] italic text-[var(--ink-fade)]">
        Player aid for the Firefly board game. Verify any disagreement against
        the printed rulebook.
      </p>
    </footer>
  )
}

function NodeSheet({
  node,
  isComplete,
  isLocked,
  onClose,
  onSelect,
  onToggleComplete,
}: {
  node: FlowNode | null
  isComplete: boolean
  isLocked: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onToggleComplete: (id: string) => void
}) {
  const open = node !== null

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = original
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!node) return null

  const tone = trackTone[node.group]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="fade-in absolute inset-0 bg-[rgba(28,20,16,0.55)] backdrop-blur-sm"
      />

      <div
        className={cn(
          'sheet-enter relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl border border-[var(--line-strong)] bg-[var(--parchment)] shadow-[0_-12px_40px_rgba(28,20,16,0.35)] sm:mx-4 sm:rounded-2xl',
        )}
        style={{ maxHeight: '92vh' }}
      >
        <div className="relative flex items-center justify-between border-b border-dashed border-[var(--line-strong)] px-5 py-3">
          <span className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--ink-fade)] sm:hidden" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="serial">ORDERS</span>
            <span className={cn('font-mono text-[11px] uppercase tracking-mono', tone.ink)}>
              {node.group.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--bone)] transition active:scale-90"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className="scrollbar-rust overflow-y-auto px-5 py-5"
          style={{ maxHeight: 'calc(92vh - 56px)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-sm border border-current px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-mono',
                  tone.ink,
                )}
              >
                {node.eyebrow}
              </span>
              <h2 className="mt-2 font-display text-3xl leading-[1.02] text-[var(--ink)]">
                {node.title}
              </h2>
              <p className="mt-2 font-pulp text-base italic leading-snug text-[var(--ink-soft)]">
                {node.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isLocked) return
                onToggleComplete(node.id)
              }}
              disabled={isLocked}
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90',
                isLocked
                  ? 'cursor-not-allowed border-[var(--line-strong)] bg-[rgba(28,20,16,0.05)] text-[var(--ink-fade)]'
                  : isComplete
                    ? 'border-[#3b4a2a] bg-[#607550] text-[var(--bone)]'
                    : 'border-[var(--line-strong)] bg-[var(--bone)] text-[var(--ink)]',
              )}
              aria-pressed={isComplete}
              aria-label={isLocked ? 'Locked — alternative branch was taken' : 'Toggle complete'}
            >
              {isLocked ? (
                <Lock className="size-4" strokeWidth={2.25} />
              ) : isComplete ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
          </div>
          {isLocked && (
            <div className="mt-3 flex items-start gap-2 rounded-sm border border-dashed border-[var(--line-strong)] bg-[rgba(28,20,16,0.04)] px-3 py-2">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-[var(--ink-fade)]" />
              <p className="font-mono text-[10px] uppercase leading-snug tracking-mono text-[var(--ink-fade)]">
                Locked — you took the alternative branch this turn. Reset or
                undo the other path to enable it.
              </p>
            </div>
          )}

          <div className="mt-5">
            <div className="serial mb-2">// ORDERS IN DETAIL</div>
            <ul className="space-y-2.5">
              {node.details.map((detail, i) => (
                <li
                  key={detail}
                  className="flex items-start gap-3 border-l-2 border-[var(--line-strong)] pl-3 text-[0.96rem] leading-snug text-[var(--ink)]"
                >
                  <span className="mt-0.5 font-mono text-[10px] uppercase tracking-mono text-[var(--rust-deep)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {node.next && node.next.length > 0 && (
            <div className="mt-6">
              <div className="serial mb-2">// NEXT BEARING</div>
              <div className="flex flex-wrap gap-2">
                {node.next.map((nextId) => {
                  const nextNode = allNodes.find((n) => n.id === nextId)
                  if (!nextNode) return null
                  return (
                    <button
                      key={nextId}
                      type="button"
                      onClick={() => onSelect(nextId)}
                      className="group inline-flex items-center gap-2 rounded-sm border border-[var(--ink)] bg-[var(--bone)] px-3 py-1.5 font-display text-sm text-[var(--ink)] transition active:scale-95"
                    >
                      <span>{nextNode.title}</span>
                      <ChevronRight className="size-4 text-[var(--rust-deep)] transition group-hover:translate-x-0.5" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 rounded-sm border border-dashed border-[var(--line-strong)] bg-[rgba(247,238,212,0.5)] p-3.5">
            <div className="serial">// FIELD REMINDERS</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 font-display text-base text-[var(--ink)]">
                  Free Actions
                </div>
                <ul className="space-y-1.5 text-[0.86rem] leading-snug text-[var(--ink-soft)]">
                  {freeActions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--brass)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1 font-display text-base text-[var(--ink)]">
                  Disgruntled
                </div>
                <ul className="space-y-1.5 text-[0.86rem] leading-snug text-[var(--ink-soft)]">
                  {disgruntledNotes.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--rust)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
