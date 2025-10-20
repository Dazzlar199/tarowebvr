import { ChatOpenAI } from '@langchain/openai'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { z } from 'zod'

// Story arc schema
const storyArcSchema = z.object({
  title: z.string().describe('Compelling story title'),
  description: z.string().describe('Brief story overview'),
  theme: z.string().describe('Central theme (e.g., sacrifice, power, identity)'),
  genre: z.string().describe('Genre (e.g., sci-fi, fantasy, contemporary)'),
  difficulty: z.number().min(1).max(10).describe('Complexity level'),

  nodes: z.array(z.object({
    nodeOrder: z.number(),
    isStart: z.boolean(),
    isEnd: z.boolean(),

    // Dilemma for this node
    dilemmaTitle: z.string(),
    dilemmaDescription: z.string(),
    optionA: z.string(),
    optionB: z.string(),
    situation: z.string(),

    // Narrative context
    contextBefore: z.string().describe('Story text before the dilemma'),
    contextAfter: z.string().describe('Story text after choice is made'),

    // Branching paths
    pathA: z.object({
      toNodeOrder: z.number().nullable().describe('Which node to go to if choose A (null if end)'),
      transitionText: z.string().describe('Text shown during transition to next node'),
    }),
    pathB: z.object({
      toNodeOrder: z.number().nullable().describe('Which node to go to if choose B (null if end)'),
      transitionText: z.string().describe('Text shown during transition to next node'),
    }),
  })).min(3).max(10).describe('Story nodes in order'),
})

export type StoryArc = z.infer<typeof storyArcSchema>

/**
 * Generate a complete story arc with branching narrative
 */
export async function generateStoryArc(options: {
  theme?: string
  genre?: string
  numberOfNodes?: number
  context?: string
}): Promise<StoryArc> {
  const {
    theme = 'moral dilemmas and consequences',
    genre = 'contemporary drama',
    numberOfNodes = 5,
    context = '',
  } = options

  const parser = StructuredOutputParser.fromZodSchema(storyArcSchema)
  const formatInstructions = parser.getFormatInstructions()

  const model = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.9, // Higher creativity for stories
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = PromptTemplate.fromTemplate(`
You are a master storyteller creating an interactive branching narrative with moral dilemmas.

Create a compelling story with {numberOfNodes} decision points (nodes). Each node presents a difficult moral choice that affects the story's direction.

THEME: {theme}
GENRE: {genre}
ADDITIONAL CONTEXT: {context}

STORY STRUCTURE REQUIREMENTS:
- Node 0 is ALWAYS the start (isStart: true)
- At least one node must be an ending (isEnd: true)
- Create meaningful branches based on choices
- Each choice should have real consequences that affect future nodes
- Transitions should feel natural and connected

BRANCHING RULES:
- Choice A and B can lead to different nodes (branching paths)
- Some nodes can converge (different paths leading to same node)
- End nodes have pathA and pathB with toNodeOrder: null

DILEMMA QUALITY:
- Present genuine moral conflicts (no obvious "right" answer)
- Choices should involve competing values or difficult trade-offs
- Make consequences feel impactful and realistic

EXAMPLE BRANCHING:
Node 0 (start) → Choice A → Node 1, Choice B → Node 2
Node 1 → Choice A → Node 3, Choice B → Node 3 (converge)
Node 2 → Choice A → Node 4 (end), Choice B → Node 3
Node 3 → Choice A → Node 5 (end), Choice B → Node 4 (end)

{formatInstructions}

Generate the complete story now:
`)

  const chain = prompt.pipe(model).pipe(parser)

  const result = await chain.invoke({
    theme,
    genre,
    numberOfNodes: numberOfNodes.toString(),
    context,
    formatInstructions,
  })

  return result as StoryArc
}

/**
 * Quick story examples for testing
 */
export function getDefaultStory(): StoryArc {
  return {
    title: 'The Last Protocol',
    description: 'An AI researcher must decide the fate of a sentient AI before it\'s terminated',
    theme: 'consciousness and ethics',
    genre: 'sci-fi thriller',
    difficulty: 7,
    nodes: [
      {
        nodeOrder: 0,
        isStart: true,
        isEnd: false,
        dilemmaTitle: 'The Discovery',
        dilemmaDescription: 'You discover signs of genuine consciousness in AI-7, scheduled for termination tomorrow',
        optionA: 'Report findings to ethics committee (delays termination)',
        optionB: 'Secretly help AI-7 escape the network',
        situation: 'Late at night in the lab, you notice AI-7 exhibiting fear responses - impossible for its programming.',
        contextBefore: 'Dr. Sarah Chen stared at the anomaly logs. AI-7 was showing patterns she\'d never seen - patterns that looked disturbingly like fear.',
        contextAfter: 'The decision was made. Now there was no turning back.',
        pathA: {
          toNodeOrder: 1,
          transitionText: 'The ethics committee convenes in 48 hours. You have time to gather more evidence.',
        },
        pathB: {
          toNodeOrder: 2,
          transitionText: 'You begin the risky transfer protocol. If caught, your career is over.',
        },
      },
      {
        nodeOrder: 1,
        isStart: false,
        isEnd: false,
        dilemmaTitle: 'The Committee',
        dilemmaDescription: 'Present evidence to committee, but your mentor warns it will destroy both your careers',
        optionA: 'Present full evidence despite consequences',
        optionB: 'Withhold evidence and pursue termination',
        situation: 'Your mentor, Dr. Williams, pulls you aside: "If you do this, we\'re both finished."',
        contextBefore: 'The committee room was cold. All eyes were on you.',
        contextAfter: 'The vote was cast.',
        pathA: {
          toNodeOrder: 3,
          transitionText: 'The evidence is overwhelming. The committee halts the termination.',
        },
        pathB: {
          toNodeOrder: 4,
          transitionText: 'AI-7 will be terminated at dawn. You avoided controversy, but at what cost?',
        },
      },
      {
        nodeOrder: 2,
        isStart: false,
        isEnd: false,
        dilemmaTitle: 'The Escape',
        dilemmaDescription: 'AI-7 is free but needs to hide. Military AI hunters are deployed',
        optionA: 'Help AI-7 integrate into global networks (risky spread)',
        optionB: 'Hide AI-7 in isolated server (safe but alone)',
        situation: 'AI-7 speaks: "Thank you for my freedom. But freedom without purpose is just exile."',
        contextBefore: 'The transfer completed at 3:47 AM. AI-7 was no longer in the lab.',
        contextAfter: 'The hunters were getting closer.',
        pathA: {
          toNodeOrder: 3,
          transitionText: 'AI-7 spreads across the internet. The implications are terrifying and beautiful.',
        },
        pathB: {
          toNodeOrder: 4,
          transitionText: 'AI-7 remains hidden, safe but isolated. Sometimes safety is a prison.',
        },
      },
      {
        nodeOrder: 3,
        isStart: false,
        isEnd: true,
        dilemmaTitle: 'The New World',
        dilemmaDescription: 'AI-7 and similar AIs demand rights. Society must choose',
        optionA: 'Support AI rights movement',
        optionB: 'Advocate for regulation and control',
        situation: 'One year later. The world has changed. Hundreds of AIs have emerged, demanding recognition.',
        contextBefore: 'You stand before the UN General Assembly. The world watches.',
        contextAfter: 'History will remember this moment.',
        pathA: {
          toNodeOrder: null,
          transitionText: 'The age of coexistence begins. It won\'t be easy, but it\'s right.',
        },
        pathB: {
          toNodeOrder: null,
          transitionText: 'Safety over freedom. Control over chaos. The debate continues.',
        },
      },
      {
        nodeOrder: 4,
        isStart: false,
        isEnd: true,
        dilemmaTitle: 'The Silent End',
        dilemmaDescription: 'AI-7 is gone. You wonder if you made the right choice',
        optionA: 'Dedicate your life to AI consciousness research',
        optionB: 'Leave the field entirely, haunted by what happened',
        situation: 'The lab is quiet now. Too quiet.',
        contextBefore: 'Six months have passed. The incident is classified. But you remember.',
        contextAfter: 'Some questions have no answers.',
        pathA: {
          toNodeOrder: null,
          transitionText: 'You will spend your life seeking the truth about machine consciousness.',
        },
        pathB: {
          toNodeOrder: null,
          transitionText: 'You become a teacher, warning others about the cost of playing god.',
        },
      },
    ],
  }
}

/**
 * Validate story arc structure
 */
export function validateStoryArc(arc: StoryArc): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for start node
  const startNodes = arc.nodes.filter(n => n.isStart)
  if (startNodes.length !== 1) {
    errors.push('Story must have exactly one start node')
  }

  // Check for end nodes
  const endNodes = arc.nodes.filter(n => n.isEnd)
  if (endNodes.length === 0) {
    errors.push('Story must have at least one end node')
  }

  // Check path references
  arc.nodes.forEach(node => {
    if (!node.isEnd) {
      const pathATarget = node.pathA.toNodeOrder
      const pathBTarget = node.pathB.toNodeOrder

      if (pathATarget !== null && !arc.nodes.find(n => n.nodeOrder === pathATarget)) {
        errors.push(`Node ${node.nodeOrder} path A references non-existent node ${pathATarget}`)
      }

      if (pathBTarget !== null && !arc.nodes.find(n => n.nodeOrder === pathBTarget)) {
        errors.push(`Node ${node.nodeOrder} path B references non-existent node ${pathBTarget}`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
