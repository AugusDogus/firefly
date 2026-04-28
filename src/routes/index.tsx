import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowDown,
  CheckCircle2,
  Circle,
  Compass,
  HandCoins,
  RotateCcw,
  ShipWheel,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Separator } from '#/components/ui/separator'
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
  icon: React.ComponentType<{ className?: string }>
  description: string
  nodes: Array<FlowNode>
}

const actionTracks: Array<ActionTrack> = [
  {
    id: 'fly',
    title: 'Fly',
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
          'Pay each crew member’s hire fee at payout.',
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
          'Pay each crew member’s hire fee at payout.',
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
  'Must pay all crew for every job, or unpaid crew become Disgruntled.',
  'Disgruntled crew can be poached by other captains.',
  'Disgruntled crew twice: that crew member leaves.',
  'Disgruntled captain twice: fire all crew.',
]

function Home() {
  const [selectedNodeId, setSelectedNodeId] = useState('fly-choice')
  const [focusedTrack, setFocusedTrack] = useState<FlowGroup | 'all'>('all')
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const selectedNode = useMemo(
    () => allNodes.find((node) => node.id === selectedNodeId) ?? allNodes[0],
    [selectedNodeId],
  )

  const visibleTracks = actionTracks.filter(
    (track) => focusedTrack === 'all' || track.id === focusedTrack,
  )

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
    <div className="min-h-screen px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="mb-4 rounded-full bg-teal-700 px-3 py-1 text-white hover:bg-teal-700">
                Firefly turn reference
              </Badge>
              <h1 className="display-title text-4xl font-bold tracking-tight text-[#173a40] md:text-6xl">
                Interactive turn flow chart
              </h1>
              <p className="mt-4 text-base leading-7 text-[#416166] md:text-lg">
                Click any node to inspect the rule text, focus a single action
                path, or mark steps complete while playing.
              </p>
            </div>
            <Card className="border-teal-900/10 bg-teal-950 text-white lg:w-80">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
                <CardDescription className="text-teal-100">
                  {completed.size} of {allNodes.length} chart nodes checked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setCompleted(new Set())}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset checks
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <Button
            variant={focusedTrack === 'all' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setFocusedTrack('all')}
          >
            All paths
          </Button>
          {actionTracks.map((track) => {
            const Icon = track.icon

            return (
              <Button
                key={track.id}
                variant={focusedTrack === track.id ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setFocusedTrack(track.id)}
              >
                <Icon className="mr-2 size-4" />
                {track.title}
              </Button>
            )
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="grid gap-5">
            {visibleTracks.map((track) => (
              <FlowTrack
                key={track.id}
                track={track}
                selectedNodeId={selectedNode.id}
                completed={completed}
                onSelect={setSelectedNodeId}
                onToggleComplete={toggleComplete}
              />
            ))}
            <Card className="border-teal-900/10 bg-white/80 shadow-xl shadow-teal-950/10 backdrop-blur">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col items-center gap-3 md:flex-row">
                  <ArrowDown className="size-5 text-teal-700 md:-rotate-90" />
                  <FlowCard
                    node={endNode}
                    selected={selectedNode.id === endNode.id}
                    complete={completed.has(endNode.id)}
                    onSelect={setSelectedNodeId}
                    onToggleComplete={toggleComplete}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <Card className="border-teal-900/10 bg-white/90 shadow-xl shadow-teal-950/10 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full">
                    {selectedNode.eyebrow}
                  </Badge>
                  <Button
                    size="sm"
                    variant={
                      completed.has(selectedNode.id) ? 'default' : 'outline'
                    }
                    onClick={() => toggleComplete(selectedNode.id)}
                  >
                    {completed.has(selectedNode.id) ? 'Checked' : 'Check off'}
                  </Button>
                </div>
                <CardTitle className="text-2xl text-[#173a40]">
                  {selectedNode.title}
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  {selectedNode.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[28rem] pr-4">
                  <div className="space-y-6">
                    <section>
                      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                        Node details
                      </h2>
                      <ul className="space-y-3">
                        {selectedNode.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex gap-3 text-sm leading-6 text-slate-700"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {selectedNode.next && (
                      <>
                        <Separator />
                        <section>
                          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                            Next nodes
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {selectedNode.next.map((nextId) => {
                              const nextNode = allNodes.find(
                                (node) => node.id === nextId,
                              )

                              if (!nextNode) {
                                return null
                              }

                              return (
                                <Button
                                  key={nextId}
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() => setSelectedNodeId(nextId)}
                                >
                                  {nextNode.title}
                                </Button>
                              )
                            })}
                          </div>
                        </section>
                      </>
                    )}

                    <Separator />
                    <ReferenceList title="Free actions" items={freeActions} />
                    <ReferenceList
                      title="Disgruntled reminders"
                      items={disgruntledNotes}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}

function FlowTrack({
  track,
  selectedNodeId,
  completed,
  onSelect,
  onToggleComplete,
}: {
  track: ActionTrack
  selectedNodeId: string
  completed: Set<string>
  onSelect: (nodeId: string) => void
  onToggleComplete: (nodeId: string) => void
}) {
  const Icon = track.icon

  return (
    <Card className="overflow-hidden border-teal-900/10 bg-white/80 shadow-xl shadow-teal-950/10 backdrop-blur">
      <CardHeader className="border-b border-teal-950/10 bg-gradient-to-r from-white to-teal-50/80">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-teal-700 p-3 text-white shadow-lg shadow-teal-900/20">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-2xl text-[#173a40]">
              {track.title}
            </CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-sm leading-6">
              {track.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
          {track.nodes.map((node, index) => (
            <div
              key={node.id}
              className="flex min-w-0 flex-col items-center gap-3 md:flex-row"
            >
              <FlowCard
                node={node}
                selected={selectedNodeId === node.id}
                complete={completed.has(node.id)}
                onSelect={onSelect}
                onToggleComplete={onToggleComplete}
              />
              {index < track.nodes.length - 1 && (
                <ArrowDown className="size-5 shrink-0 text-teal-700 md:-rotate-90" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FlowCard({
  node,
  selected,
  complete,
  onSelect,
  onToggleComplete,
}: {
  node: FlowNode
  selected: boolean
  complete: boolean
  onSelect: (nodeId: string) => void
  onToggleComplete: (nodeId: string) => void
}) {
  return (
    <div
      className={cn(
        'group min-h-44 w-full rounded-3xl border bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-teal-600 hover:shadow-lg hover:shadow-teal-950/10',
        selected && 'border-teal-700 ring-4 ring-teal-500/20',
        complete && 'bg-teal-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Badge
          variant={complete ? 'default' : 'secondary'}
          className="rounded-full"
        >
          {node.eyebrow}
        </Badge>
        <button
          type="button"
          className="rounded-full p-1 text-teal-700 outline-none ring-offset-2 transition hover:bg-teal-100 focus-visible:ring-2 focus-visible:ring-teal-700"
          onClick={() => onToggleComplete(node.id)}
          aria-label={`Toggle ${node.title}`}
        >
          {complete ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Circle className="size-5" />
          )}
        </button>
      </div>
      <button
        type="button"
        className="mt-4 block w-full text-left outline-none ring-offset-4 focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-teal-700"
        onClick={() => onSelect(node.id)}
      >
        <h3 className="text-lg font-bold text-[#173a40]">{node.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{node.summary}</p>
      </button>
    </div>
  )
}

function ReferenceList({
  title,
  items,
}: {
  title: string
  items: Array<string>
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-6 text-slate-700"
          >
            <Circle className="mt-1 size-3 shrink-0 fill-teal-700 text-teal-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
