/**
 * Seed data for courses and lessons.
 * noteTitleRefs: matched against existing notes by title in seed-courses.mjs
 */

const JS   = "default-javascript"
const REACT = "default-react"
const TS   = "default-typescript"
const REDUX = "default-redux"
const NODE = "default-nodejs"
const EXPRESS = "default-express"
const SQL = "default-sql"

export const SEED_COURSES = [
  // ── JavaScript ──────────────────────────────────────────────────────────────
  {
    title: "JS Fundamentals",
    description: "Core JavaScript concepts every developer needs to know",
    tagId: JS,
  },
  {
    title: "Async JavaScript",
    description: "Promises, async/await, and the event loop in depth",
    tagId: JS,
  },

  // ── React ───────────────────────────────────────────────────────────────────
  {
    title: "React Under the Hood",
    description: "How React works internally: Virtual DOM, reconciliation, and rendering",
    tagId: REACT,
  },
  {
    title: "React Hooks Mastery",
    description: "Every hook explained with patterns and gotchas",
    tagId: REACT,
  },

  // ── TypeScript ──────────────────────────────────────────────────────────────
  {
    title: "TypeScript Essentials",
    description: "Types, interfaces, generics, and utility types",
    tagId: TS,
  },

  // ── Redux ───────────────────────────────────────────────────────────────────
  {
    title: "Redux Toolkit Deep Dive",
    description: "Modern Redux with RTK: slices, thunks, and RTK Query",
    tagId: REDUX,
  },

  // ── Node.js ─────────────────────────────────────────────────────────────────
  {
    title: "Node.js Core Concepts",
    description: "Event loop, streams, modules, and async patterns in Node",
    tagId: NODE,
  },

  // ── Express ─────────────────────────────────────────────────────────────────
  {
    title: "Building APIs with Express",
    description: "Routing, middleware, error handling, and REST best practices",
    tagId: EXPRESS,
  },

  // ── SQL ─────────────────────────────────────────────────────────────────────
  {
    title: "SQL Fundamentals",
    description: "Queries, joins, indexes, and transactions",
    tagId: SQL,
  },
]

export const SEED_LESSONS = [
  // ── JS Fundamentals ─────────────────────────────────────────────────────────
  {
    courseTitleRef: "JS Fundamentals",
    title: "Closures & Scope",
    order: 0,
    noteTitleRefs: ["What is a closure and how does it work?"],
    markdown: `# Closures & Scope

A **closure** is a function that retains access to its lexical scope even when executed outside that scope.

## Scope chain
When a function is created, it captures a reference to its surrounding scope. This means inner functions can access variables from outer functions even after the outer function has returned.

\`\`\`js
function makeCounter() {
  let count = 0
  return () => ++count  // closes over 'count'
}
const counter = makeCounter()
counter() // 1
counter() // 2
\`\`\`

## Why closures matter
- Data encapsulation (private variables)
- Factory functions
- Callbacks and event handlers retaining context
- Memoization

## var vs let/const scoping
\`var\` is function-scoped; \`let\`/\`const\` are block-scoped. Closures created in loops with \`var\` share the same binding — a classic gotcha.

\`\`\`js
// Bug: all callbacks log 3
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)

// Fix: let creates a new binding per iteration
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)
\`\`\`
`,
  },
  {
    courseTitleRef: "JS Fundamentals",
    title: "Prototypes & Inheritance",
    order: 1,
    noteTitleRefs: ["How does the prototype chain work in JavaScript?"],
    markdown: `# Prototypes & Inheritance

JavaScript uses **prototype-based inheritance** — every object has an internal \`[[Prototype]]\` link to another object.

## The prototype chain
Property lookups walk the chain: if a property isn't found on the object itself, JS looks at its prototype, then the prototype's prototype, until it reaches \`null\`.

\`\`\`js
const animal = { eat() { return 'nom' } }
const dog = Object.create(animal)
dog.bark = () => 'woof'

dog.bark()  // 'woof'  — own property
dog.eat()   // 'nom'   — inherited from animal
\`\`\`

## ES6 classes
\`class\` syntax is syntactic sugar over the prototype system.

\`\`\`js
class Animal {
  eat() { return 'nom' }
}
class Dog extends Animal {
  bark() { return 'woof' }
}
\`\`\`

## hasOwnProperty
Use \`Object.hasOwn(obj, key)\` to distinguish own vs inherited properties.
`,
  },
  {
    courseTitleRef: "JS Fundamentals",
    title: "this & Execution Context",
    order: 2,
    noteTitleRefs: ["Explain how 'this' works in JavaScript"],
    markdown: `# this & Execution Context

The value of \`this\` depends on **how** a function is called, not where it's defined (except for arrow functions).

## Rules (in priority order)
1. **new binding** — \`this\` is the new object
2. **Explicit binding** — \`call()\`, \`apply()\`, \`bind()\` set \`this\` explicitly
3. **Implicit binding** — the object before the dot: \`obj.fn()\` → \`this === obj\`
4. **Default binding** — global object (or \`undefined\` in strict mode)

\`\`\`js
function greet() { console.log(this.name) }

const user = { name: 'Alice', greet }
user.greet()           // 'Alice'  — implicit
greet.call({ name: 'Bob' })  // 'Bob' — explicit
\`\`\`

## Arrow functions
Arrow functions capture \`this\` from their enclosing lexical scope at definition time — they have no own \`this\`.

\`\`\`js
class Timer {
  start() {
    setTimeout(() => {
      console.log(this) // Timer instance, not window
    }, 1000)
  }
}
\`\`\`
`,
  },

  // ── Async JavaScript ────────────────────────────────────────────────────────
  {
    courseTitleRef: "Async JavaScript",
    title: "The Event Loop",
    order: 0,
    noteTitleRefs: ["Explain the JavaScript event loop"],
    markdown: `# The Event Loop

JavaScript is single-threaded but handles concurrency via the **event loop**.

## Components
- **Call stack** — where synchronous code executes (LIFO)
- **Web APIs** — browser-provided async capabilities (setTimeout, fetch, DOM events)
- **Microtask queue** — Promise callbacks, \`queueMicrotask()\` (higher priority)
- **Macrotask queue** (task queue) — setTimeout, setInterval, I/O callbacks

## Execution order
1. Run all synchronous code (empty the call stack)
2. Drain the **microtask queue** completely
3. Render (browser only)
4. Take one **macrotask**, run it
5. Repeat from step 2

\`\`\`js
console.log('1')
setTimeout(() => console.log('4'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('2')
// Output: 1, 2, 3, 4
\`\`\`

Promises always resolve after the current synchronous code but before the next setTimeout.
`,
  },
  {
    courseTitleRef: "Async JavaScript",
    title: "Promises & async/await",
    order: 1,
    noteTitleRefs: ["What is the difference between Promise.all, Promise.race, Promise.allSettled?"],
    markdown: `# Promises & async/await

A **Promise** represents an eventual value — pending, fulfilled, or rejected.

## Basic usage
\`\`\`js
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
\`\`\`

## async/await
Syntactic sugar that lets you write async code that reads synchronously.

\`\`\`js
async function loadData() {
  try {
    const res = await fetch('/api/data')
    const data = await res.json()
    return data
  } catch (err) {
    console.error(err)
  }
}
\`\`\`

## Combinators

| Method | Resolves when | Rejects when |
|--------|--------------|--------------|
| \`Promise.all\` | All resolve | Any rejects |
| \`Promise.race\` | First settles | First rejects |
| \`Promise.allSettled\` | All settle | Never |
| \`Promise.any\` | First resolves | All reject |

## Common pitfall: forgetting await
\`\`\`js
// Bug: getUserId returns a Promise, not a value
const id = getUserId()

// Fix
const id = await getUserId()
\`\`\`
`,
  },

  // ── React Under the Hood ─────────────────────────────────────────────────────
  {
    courseTitleRef: "React Under the Hood",
    title: "Virtual DOM",
    order: 0,
    noteTitleRefs: ["What is the Virtual DOM and how does React use it?"],
    markdown: `# Virtual DOM

React maintains a **Virtual DOM** — a lightweight JavaScript representation of the real DOM tree.

## Why it exists
Direct DOM manipulation is expensive. Batching changes through a virtual representation lets React minimise actual DOM updates.

## How it works
1. On each render, React creates a new Virtual DOM tree
2. React **diffs** the new tree against the previous snapshot (reconciliation)
3. Only the minimal set of real DOM operations is applied (**commit phase**)

\`\`\`
State change
   ↓
New VDOM tree
   ↓
Diff (reconciliation)
   ↓
Patch real DOM (minimal changes)
\`\`\`

## Key insight
The VDOM isn't "fast" — the diffing itself has a cost. The benefit is that React can batch, deduplicate, and optimise real DOM mutations, which are the actual bottleneck.
`,
  },
  {
    courseTitleRef: "React Under the Hood",
    title: "Reconciliation",
    order: 1,
    noteTitleRefs: ["What is React reconciliation?"],
    markdown: `# Reconciliation

Reconciliation is React's algorithm for diffing two Virtual DOM trees and computing the minimum DOM changes needed.

## Two heuristics that make O(n) diffing possible

### 1. Different types → full subtree replacement
If a \`<div>\` becomes a \`<span>\`, React tears down the old subtree and mounts a new one.

### 2. keys on lists
Without keys, React diffs by index. With stable \`key\` props, React can track which items were added, moved, or removed.

\`\`\`jsx
// Bad: reorders force full re-renders
{items.map((item, i) => <Item key={i} {...item} />)}

// Good: stable identity
{items.map(item => <Item key={item.id} {...item} />)}
\`\`\`

## React Fiber
Fiber is React's reconciliation engine (since v16). It represents each component as a unit of work that can be **paused, resumed, or aborted** — enabling concurrent features like Suspense and transitions.
`,
  },

  // ── React Hooks Mastery ──────────────────────────────────────────────────────
  {
    courseTitleRef: "React Hooks Mastery",
    title: "useState & useReducer",
    order: 0,
    noteTitleRefs: ["When would you use useReducer instead of useState?"],
    markdown: `# useState & useReducer

Both hooks manage local component state. The choice between them depends on complexity.

## useState
Best for simple, independent pieces of state.

\`\`\`js
const [count, setCount] = useState(0)
setCount(c => c + 1)  // functional update — safe with stale closures
\`\`\`

## useReducer
Better when:
- Next state depends on previous state in non-trivial ways
- Multiple sub-values that change together
- State transitions benefit from explicit action names (debuggability)

\`\`\`js
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 }
    case 'reset':     return { count: 0 }
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 })
dispatch({ type: 'increment' })
\`\`\`

## Rule of thumb
Start with \`useState\`. Reach for \`useReducer\` when you find yourself writing several related \`useState\` calls or complex update logic.
`,
  },
  {
    courseTitleRef: "React Hooks Mastery",
    title: "useEffect & Cleanup",
    order: 1,
    noteTitleRefs: ["Explain the useEffect dependency array"],
    markdown: `# useEffect & Cleanup

\`useEffect\` runs side effects after renders. Understanding the dependency array is critical.

## Dependency array rules
- **Omitted** → runs after every render
- **Empty \`[]\`** → runs once (on mount)
- **\`[a, b]\`** → runs when \`a\` or \`b\` change (shallow comparison)

\`\`\`js
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000)
  return () => clearInterval(id)  // cleanup
}, []) // runs once
\`\`\`

## The cleanup function
Return a function to clean up subscriptions, timers, or event listeners. It runs:
- Before the next effect execution (when deps change)
- On component unmount

## Common pitfalls
- Missing deps → stale closure bugs
- Including unstable object/function refs → infinite loops
- Use \`useCallback\`/\`useMemo\` to stabilise deps when needed
`,
  },
  {
    courseTitleRef: "React Hooks Mastery",
    title: "useMemo & useCallback",
    order: 2,
    noteTitleRefs: ["What is the difference between useMemo and useCallback?"],
    markdown: `# useMemo & useCallback

Both hooks memoize values between renders. They differ only in *what* they memoize.

## useMemo — memoize a computed value
\`\`\`js
const sorted = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
\`\`\`
Use when a computation is expensive and its inputs change rarely.

## useCallback — memoize a function reference
\`\`\`js
const handleClick = useCallback(() => {
  dispatch({ type: 'increment' })
}, [dispatch])
\`\`\`
Use when passing callbacks to memoized child components to prevent unnecessary re-renders.

## When NOT to use them
Both have overhead. Don't add them everywhere — only when:
1. You've measured a performance problem, or
2. You need referential stability for a dependency array or memoized child

\`\`\`
useMemo(() => fn(), deps) === useCallback(fn, deps) for functions
\`\`\`
`,
  },

  // ── TypeScript Essentials ────────────────────────────────────────────────────
  {
    courseTitleRef: "TypeScript Essentials",
    title: "Types vs Interfaces",
    order: 0,
    noteTitleRefs: ["What is the difference between type and interface in TypeScript?"],
    markdown: `# Types vs Interfaces

Both \`type\` and \`interface\` describe object shapes. Their differences are mostly stylistic but a few are practical.

## interface
- Declaration merging (multiple \`interface\` declarations with the same name are merged)
- \`extends\` for inheritance
- Best for public API contracts and object shapes

\`\`\`ts
interface User {
  id: string
  name: string
}
interface User {
  email: string  // merged
}
\`\`\`

## type
- Can represent unions, intersections, primitives, tuples
- Cannot be merged after declaration
- More expressive for complex type algebra

\`\`\`ts
type ID = string | number
type Admin = User & { role: 'admin' }
type Pair<T> = [T, T]
\`\`\`

## Rule of thumb
Use \`interface\` for object shapes you might extend or expose; use \`type\` for everything else.
`,
  },
  {
    courseTitleRef: "TypeScript Essentials",
    title: "Generics",
    order: 1,
    noteTitleRefs: ["How do generics work in TypeScript?"],
    markdown: `# Generics

Generics let you write reusable code that works with different types while preserving type safety.

## Basic syntax
\`\`\`ts
function identity<T>(value: T): T {
  return value
}
identity<string>('hello')  // T = string
identity(42)               // T inferred as number
\`\`\`

## Generic constraints
\`\`\`ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length
}
getLength('hello')   // 5
getLength([1, 2, 3]) // 3
\`\`\`

## Generic interfaces & types
\`\`\`ts
type ApiResponse<T> = {
  data: T
  status: number
  message: string
}

type UserResponse = ApiResponse<User>
\`\`\`

## When to use generics
- When behaviour is the same but types vary (collections, wrappers, utilities)
- To avoid \`any\` while keeping flexibility
- For reusable hooks, components, and utility functions
`,
  },
  {
    courseTitleRef: "TypeScript Essentials",
    title: "Utility Types",
    order: 2,
    noteTitleRefs: ["What are TypeScript utility types?"],
    markdown: `# Utility Types

TypeScript ships built-in utility types that transform existing types.

## Most commonly used

| Utility | What it does |
|---------|-------------|
| \`Partial<T>\` | All properties optional |
| \`Required<T>\` | All properties required |
| \`Readonly<T>\` | All properties readonly |
| \`Pick<T, K>\` | Keep only keys K |
| \`Omit<T, K>\` | Remove keys K |
| \`Record<K, V>\` | Map keys K to values V |
| \`ReturnType<F>\` | Return type of function F |
| \`Parameters<F>\` | Parameter types of function F |
| \`NonNullable<T>\` | Remove null and undefined |

\`\`\`ts
type User = { id: string; name: string; email: string }

type UserPreview = Pick<User, 'id' | 'name'>
type UpdateUser = Partial<Omit<User, 'id'>>

const cache: Record<string, User> = {}
\`\`\`

## Combining utilities
\`\`\`ts
type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
type PatchInput<T> = Partial<CreateInput<T>>
\`\`\`
`,
  },

  // ── Redux Toolkit Deep Dive ──────────────────────────────────────────────────
  {
    courseTitleRef: "Redux Toolkit Deep Dive",
    title: "createSlice & State Management",
    order: 0,
    noteTitleRefs: ["What is createSlice in Redux Toolkit?"],
    markdown: `# createSlice & State Management

\`createSlice\` is the core RTK API. It generates action creators and a reducer from a single configuration object.

## Before RTK
You'd write separate action type constants, action creators, and a reducer with a switch statement — lots of boilerplate.

## With createSlice
\`\`\`ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value++  // Immer lets you mutate safely
    },
    addBy(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
  },
})

export const { increment, addBy } = counterSlice.actions
export default counterSlice.reducer
\`\`\`

## Immer under the hood
RTK uses Immer so you can write "mutating" logic inside reducers — Immer produces a new immutable state behind the scenes.
`,
  },
  {
    courseTitleRef: "Redux Toolkit Deep Dive",
    title: "createAsyncThunk",
    order: 1,
    noteTitleRefs: ["How does createAsyncThunk work?"],
    markdown: `# createAsyncThunk

\`createAsyncThunk\` handles async logic and automatically dispatches \`pending\`, \`fulfilled\`, and \`rejected\` actions.

\`\`\`ts
export const fetchUser = createAsyncThunk(
  'users/fetchById',
  async (userId: string) => {
    const res = await fetch(\`/api/users/\${userId}\`)
    return res.json() as Promise<User>
  }
)
\`\`\`

## Handling the lifecycle in a slice
\`\`\`ts
const usersSlice = createSlice({
  name: 'users',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUser.pending,   (state) => { state.status = 'loading' })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(fetchUser.rejected,  (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})
\`\`\`

## Error handling
Throw inside the thunk or use \`rejectWithValue\` for structured error data.
`,
  },

  // ── Node.js Core Concepts ────────────────────────────────────────────────────
  {
    courseTitleRef: "Node.js Core Concepts",
    title: "The Node Event Loop",
    order: 0,
    noteTitleRefs: [],
    markdown: `# The Node.js Event Loop

Node.js uses a single-threaded event loop powered by **libuv** to handle I/O non-blocking.

## Phases (in order)
1. **timers** — executes \`setTimeout\`/\`setInterval\` callbacks whose threshold has passed
2. **pending callbacks** — I/O callbacks deferred to the next loop
3. **idle, prepare** — internal use
4. **poll** — retrieve new I/O events; block here when nothing is queued
5. **check** — \`setImmediate()\` callbacks
6. **close callbacks** — e.g. \`socket.on('close', ...)\`

Between each phase, Node drains the **microtask queues**: \`process.nextTick()\` first, then Promises.

## process.nextTick vs setImmediate
- \`process.nextTick\` fires before the next event loop phase (highest priority)
- \`setImmediate\` fires in the check phase — after I/O

\`\`\`js
setImmediate(() => console.log('setImmediate'))
process.nextTick(() => console.log('nextTick'))
// Output: nextTick → setImmediate
\`\`\`

## Worker threads
CPU-bound work should be offloaded to \`worker_threads\` — they run in separate V8 isolates and communicate via message passing.
`,
  },
  {
    courseTitleRef: "Node.js Core Concepts",
    title: "Streams & Buffers",
    order: 1,
    noteTitleRefs: [],
    markdown: `# Streams & Buffers

Streams let you process data **incrementally** rather than loading it all into memory at once.

## Stream types
- **Readable** — source of data (e.g. \`fs.createReadStream\`)
- **Writable** — destination (e.g. \`fs.createWriteStream\`, \`res\` in HTTP)
- **Duplex** — both readable and writable (e.g. TCP socket)
- **Transform** — duplex that modifies data (e.g. \`zlib.createGzip()\`)

## Piping
\`\`\`js
import { createReadStream, createWriteStream } from 'fs'
import { createGzip } from 'zlib'

createReadStream('input.txt')
  .pipe(createGzip())
  .pipe(createWriteStream('output.txt.gz'))
\`\`\`

## Backpressure
When a Writable can't keep up with a Readable, the stream signals backpressure. \`pipe()\` handles this automatically; when using \`write()\` manually, check its return value and pause the readable if it returns \`false\`.

## Buffers
\`Buffer\` is Node's way of handling raw binary data — a fixed-size allocation in memory outside the V8 heap.

\`\`\`js
const buf = Buffer.from('hello', 'utf8')
buf.toString('hex')  // '68656c6c6f'
\`\`\`
`,
  },

  // ── Building APIs with Express ───────────────────────────────────────────────
  {
    courseTitleRef: "Building APIs with Express",
    title: "Routing & Middleware",
    order: 0,
    noteTitleRefs: [],
    markdown: `# Routing & Middleware

Express is built around two primitives: **routes** and **middleware**.

## Middleware
A middleware function has the signature \`(req, res, next)\`. Call \`next()\` to pass control to the next middleware, or \`next(err)\` to skip to error handlers.

\`\`\`js
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`)
  next()
})
\`\`\`

## Route handlers
\`\`\`js
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id)
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
})
\`\`\`

## Router
Group related routes with \`express.Router()\`:
\`\`\`js
// routes/users.js
const router = express.Router()
router.get('/',    listUsers)
router.post('/',   createUser)
router.get('/:id', getUser)

// app.js
app.use('/users', router)
\`\`\`

## Order matters
Middleware and routes are matched in registration order. Put error handlers last with a 4-argument signature \`(err, req, res, next)\`.
`,
  },
  {
    courseTitleRef: "Building APIs with Express",
    title: "Error Handling",
    order: 1,
    noteTitleRefs: [],
    markdown: `# Error Handling in Express

Centralised error handling keeps route handlers clean and ensures consistent API responses.

## The error middleware
Define a middleware with 4 parameters — Express recognises it as an error handler:
\`\`\`js
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  const message = err.message ?? 'Internal server error'
  res.status(status).json({ error: message })
})
\`\`\`

## Passing errors
In async handlers, catch errors and pass them to \`next()\`:
\`\`\`js
app.get('/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
    res.json(item)
  } catch (err) {
    next(err)
  }
})
\`\`\`

## Async wrapper utility
Avoid repeating try/catch with a wrapper:
\`\`\`js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

app.get('/items/:id', asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
  res.json(item)
}))
\`\`\`
`,
  },

  // ── SQL Fundamentals ─────────────────────────────────────────────────────────
  {
    courseTitleRef: "SQL Fundamentals",
    title: "Joins",
    order: 0,
    noteTitleRefs: [],
    markdown: `# SQL Joins

Joins combine rows from two or more tables based on a related column.

## Types of joins

\`\`\`
INNER JOIN  — only matching rows in both tables
LEFT JOIN   — all left rows + matching right rows (NULLs for no match)
RIGHT JOIN  — all right rows + matching left rows
FULL JOIN   — all rows from both, NULLs where no match
CROSS JOIN  — Cartesian product (every combination)
\`\`\`

## Examples
\`\`\`sql
-- All orders with customer info (inner)
SELECT o.id, o.total, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id

-- All customers, even those with no orders (left)
SELECT c.name, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
\`\`\`

## Self join
Join a table to itself — useful for hierarchical data:
\`\`\`sql
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
\`\`\`
`,
  },
  {
    courseTitleRef: "SQL Fundamentals",
    title: "Indexes & Performance",
    order: 1,
    noteTitleRefs: [],
    markdown: `# Indexes & Performance

Indexes are data structures that speed up reads at the cost of write overhead and storage.

## How indexes work
Without an index, the database does a **full table scan** — O(n). A B-tree index reduces lookups to O(log n).

## Creating indexes
\`\`\`sql
-- Single column
CREATE INDEX idx_users_email ON users(email);

-- Composite (order matters — leftmost prefix rule)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Unique
CREATE UNIQUE INDEX idx_users_email_uniq ON users(email);
\`\`\`

## When indexes help
- \`WHERE\` clauses on indexed columns
- \`JOIN\` conditions
- \`ORDER BY\` and \`GROUP BY\`

## When they don't help
- Low-cardinality columns (e.g. boolean flags)
- Small tables (full scan is faster than index overhead)
- Heavy write workloads (every INSERT/UPDATE/DELETE must update the index)

## EXPLAIN
Use \`EXPLAIN\` (or \`EXPLAIN ANALYZE\`) to see the query plan and spot missing indexes or sequential scans.

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
\`\`\`
`,
  },
  {
    courseTitleRef: "SQL Fundamentals",
    title: "Transactions & ACID",
    order: 2,
    noteTitleRefs: [],
    markdown: `# Transactions & ACID

A **transaction** is a sequence of operations treated as a single unit — either all succeed or none do.

## ACID properties
- **Atomicity** — all operations succeed, or none are applied
- **Consistency** — the database moves from one valid state to another
- **Isolation** — concurrent transactions don't see each other's partial work
- **Durability** — committed transactions survive crashes

## Basic syntax
\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;  -- or ROLLBACK to undo
\`\`\`

## Isolation levels (PostgreSQL)
| Level | Dirty Read | Non-repeatable Read | Phantom Read |
|-------|-----------|---------------------|--------------|
| Read Uncommitted | Possible | Possible | Possible |
| Read Committed (default) | No | Possible | Possible |
| Repeatable Read | No | No | No (in PG) |
| Serializable | No | No | No |

Higher isolation = fewer anomalies, more locking overhead.
`,
  },
]
