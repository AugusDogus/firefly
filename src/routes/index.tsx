import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  Coins,
  Compass,
  HandCoins,
  Handshake,
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

type FlowGroup = 'fly' | 'buy' | 'work' | 'deal' | 'mosey'

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
      'Move from anywhere. Choose Full Burn for distance or Mosey for a slower turn.',
    nodes: [
      {
        id: 'fly-choice',
        title: 'Choose Fly',
        eyebrow: 'Anywhere',
        group: 'fly',
        summary: 'Start a movement action and pick Full Burn or Mosey.',
        details: [
          'You can fly from anywhere.',
          'Full Burn and Mosey are mutually exclusive paths.',
        ],
        next: ['full-burn', 'mosey-move'],
      },
      {
        id: 'full-burn',
        title: 'Full Burn',
        eyebrow: 'Fast route',
        group: 'fly',
        summary: 'Spend fuel, move the ship, and resolve navigation cards.',
        details: [
          'Burn 1 fuel.',
          'Move ship.',
          'Resolve Nav card five times.',
          'End the action after the fifth navigation resolution.',
        ],
        next: ['end-turn'],
      },
    ],
  },
  {
    id: 'mosey',
    title: 'Mosey',
    glyph: 'II',
    icon: Compass,
    description:
      'Move once, then take a Standard or Shore Leave planet action.',
    nodes: [
      {
        id: 'mosey-move',
        title: 'Mosey',
        eyebrow: 'Any planet',
        group: 'mosey',
        summary: 'Move the ship once, then choose Standard or Shore Leave.',
        details: [
          'Move ship one time.',
          'After moving, choose either Standard or Shore Leave.',
        ],
        next: ['mosey-standard', 'shore-leave'],
      },
      {
        id: 'mosey-standard',
        title: 'Standard',
        eyebrow: 'Planet option',
        group: 'mosey',
        summary: 'Take the normal planet action available at the destination.',
        details: [
          'Use the standard option shown for the planet or location.',
          'End afterward.',
        ],
        next: ['end-turn'],
      },
      {
        id: 'shore-leave',
        title: 'Shore Leave',
        eyebrow: 'Crew recovery',
        group: 'mosey',
        summary: 'Pay crew and remove Disgruntled markers.',
        details: [
          'Pay $100 per crew member.',
          'Remove Disgruntled.',
          'You must pay for all crew on shore leave.',
        ],
        next: ['end-turn'],
      },
    ],
  },
  {
    id: 'buy',
    title: 'Buy',
    glyph: 'III',
    icon: HandCoins,
    description:
      'Visit a merchant, consider cards, and trade goods, fuel, or parts.',
    nodes: [
      {
        id: 'buy-start',
        title: 'Buy',
        eyebrow: 'Merchant',
        group: 'buy',
        summary: 'Start a merchant action.',
        details: [
          'Use this action at a merchant.',
          'You will consider three cards and pick two.',
        ],
        next: ['buy-market'],
      },
      {
        id: 'buy-market',
        title: 'Consider 3, Pick 2',
        eyebrow: 'Market',
        group: 'buy',
        summary: 'Look at three options and keep two of them available.',
        details: ['Consider three.', 'Pick two.'],
        next: ['buy-goods'],
      },
      {
        id: 'buy-goods',
        title: 'Buy or Sell Goods',
        eyebrow: 'Trade',
        group: 'buy',
        summary: 'Resolve purchases, sales, fuel, or parts.',
        details: [
          'Buy or sell goods.',
          'Buy fuel or parts as allowed by the merchant.',
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
      'Run a job at its location, or take Make-Work for a smaller payout.',
    nodes: [
      {
        id: 'work-start',
        title: 'Work',
        eyebrow: 'Location per job',
        group: 'work',
        summary: 'Start work at the location required by the job.',
        details: [
          'Work is largely defined by the job card.',
          "Pay each crew member's hire fee at payout.",
        ],
        next: ['work-kind'],
      },
      {
        id: 'work-kind',
        title: 'Job Card or Make-Work',
        eyebrow: 'Choose work',
        group: 'work',
        summary: 'Choose the printed job or a Make-Work action.',
        details: [
          'Job card follows the card text.',
          'Make-Work collects $200.',
        ],
        next: ['work-resolve'],
      },
      {
        id: 'work-resolve',
        title: 'Work per Job Card',
        eyebrow: 'Resolve',
        group: 'work',
        summary: 'Complete the job instructions and handle payout.',
        details: [
          'Resolve the work exactly as the job defines.',
          "Pay each crew member's hire fee at payout.",
          'Become solid with the contact when complete.',
        ],
        next: ['work-solid'],
      },
      {
        id: 'work-solid',
        title: 'Solid?',
        eyebrow: 'Contact status',
        group: 'work',
        summary:
          'If the job makes you solid with the contact, record that status.',
        details: [
          'Yes: mark solid with the contact.',
          'No: end without changing contact status.',
        ],
        next: ['end-turn'],
      },
    ],
  },
  {
    id: 'deal',
    title: 'Deal',
    glyph: 'V',
    icon: Sparkles,
    description: 'Meet a contact, choose opportunities, and set crew or gear.',
    nodes: [
      {
        id: 'deal-start',
        title: 'Deal',
        eyebrow: 'Contact',
        group: 'deal',
        summary: 'Start a contact action.',
        details: ['Use this with a contact.', 'Consider three and pick two.'],
        next: ['deal-pick'],
      },
      {
        id: 'deal-pick',
        title: 'Consider 3, Pick 2',
        eyebrow: 'Contact offer',
        group: 'deal',
        summary: 'Review three options from the contact and choose two.',
        details: ['Consider three.', 'Pick two.'],
        next: ['deal-crew'],
      },
      {
        id: 'deal-crew',
        title: 'Set Crew & Gear',
        eyebrow: 'Loadout',
        group: 'deal',
        summary: 'Update crew and gear from the chosen options.',
        details: [
          'Set crew and gear as allowed by the deal.',
          'Check whether you are solid.',
        ],
        next: ['deal-solid'],
      },
      {
        id: 'deal-solid',
        title: 'Solid?',
        eyebrow: 'Contact status',
        group: 'deal',
        summary: 'Branch based on whether you are solid with the contact.',
        details: [
          'Yes: apply the solid outcome.',
          'No: continue without that contact benefit.',
        ],
        next: ['end-turn'],
      },
    ],
  },
]

const endNode: FlowNode = {
  id: 'end-turn',
  title: 'End',
  eyebrow: 'Action complete',
  group: 'fly',
  summary: 'Finish the selected action.',
  details: ['After completing the selected path, end the action.'],
}

const allNodes = [...actionTracks.flatMap((track) => track.nodes), endNode]

const freeActions = [
  'Send money to another player from anywhere.',
  'Trade with another player in the same sector.',
  'Look through discards at any time.',
]

const disgruntledNotes = [
  'Pay all crew for every job, or unpaid crew become Disgruntled.',
  'Disgruntled crew can be poached by other captains.',
  'Disgruntled crew twice: that crew member leaves.',
  'Disgruntled captain twice: fire all crew.',
]

const trackTone: Record<FlowGroup, { ink: string; bg: string; mark: string }> =
  {
    fly: {
      ink: 'text-[#8a2b13]',
      bg: 'bg-[rgba(177,59,28,0.08)]',
      mark: 'bg-[#b13b1c]',
    },
    mosey: {
      ink: 'text-[#2c5e5b]',
      bg: 'bg-[rgba(44,94,91,0.08)]',
      mark: 'bg-[#2c5e5b]',
    },
    buy: {
      ink: 'text-[#6f4a14]',
      bg: 'bg-[rgba(201,138,50,0.14)]',
      mark: 'bg-[#c98a32]',
    },
    work: {
      ink: 'text-[#3b4a2a]',
      bg: 'bg-[rgba(96,117,80,0.14)]',
      mark: 'bg-[#607550]',
    },
    deal: {
      ink: 'text-[#5a2a4a]',
      bg: 'bg-[rgba(110,55,90,0.12)]',
      mark: 'bg-[#7a3961]',
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
        A pocket-sized field manual for the working captain — pick an action,
        read the orders, and check off your moves while you steal the sky.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-mono text-[var(--ink-soft)]">
        <Telemetry label="Actions" value="5" hint="paths" />
        <Telemetry
          label="Progress"
          value={`${progress}%`}
          hint="checked"
        />
        <Telemetry label="Crew" value="∞" hint="roster" />
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
          return (
            <li key={node.id} className="relative">
              <FlowCard
                node={node}
                ordinal={nodeIndex + 1}
                tone={tone}
                selected={selectedNodeId === node.id}
                complete={completed.has(node.id)}
                onSelect={onSelect}
                onToggleComplete={onToggleComplete}
              />
              {!isLast && (
                <div className="my-2 flex justify-center">
                  <span className="route-line h-7" aria-hidden="true" />
                </div>
              )}
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
  onSelect,
  onToggleComplete,
}: {
  node: FlowNode
  ordinal: number
  tone: { ink: string; bg: string; mark: string }
  selected: boolean
  complete: boolean
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
      )}
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
          onToggleComplete(node.id)
        }}
        className={cn(
          'flex size-11 shrink-0 items-center justify-center self-start rounded-full border-2 transition active:scale-90',
          complete
            ? 'border-[#3b4a2a] bg-[#607550] text-[var(--bone)]'
            : 'border-[var(--line-strong)] bg-[var(--bone)] text-[var(--ink)] hover:border-[var(--rust)]',
        )}
        aria-pressed={complete}
        aria-label={`Mark ${node.title} ${complete ? 'incomplete' : 'complete'}`}
      >
        {complete ? (
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
        kicker="Anywhere · Anytime"
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
  onClose,
  onSelect,
  onToggleComplete,
}: {
  node: FlowNode | null
  isComplete: boolean
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
              onClick={() => onToggleComplete(node.id)}
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90',
                isComplete
                  ? 'border-[#3b4a2a] bg-[#607550] text-[var(--bone)]'
                  : 'border-[var(--line-strong)] bg-[var(--bone)] text-[var(--ink)]',
              )}
              aria-pressed={isComplete}
              aria-label="Toggle complete"
            >
              {isComplete ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
          </div>

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
