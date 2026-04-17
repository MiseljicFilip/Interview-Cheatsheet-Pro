// Tag IDs must match DEFAULT_TAGS in src/data/defaultTags.ts
const JS = "default-javascript"
const REACT = "default-react"
const TS = "default-typescript"
const REDUX = "default-redux"

export const SEED_NOTES = [
  // ─── JavaScript ──────────────────────────────────────────────────────────────
  {
    title: "What is a closure and what are common use cases?",
    tagIds: [JS],
    markdown: `A closure is a function that **retains access to variables from its outer (enclosing) scope** even after that scope has finished executing.

\`\`\`javascript
function makeCounter(start = 0) {
  let count = start

  return {
    increment: () => ++count,
    decrement: () => --count,
    value:     () => count,
  }
}

const counter = makeCounter(10)
counter.increment() // 11
counter.increment() // 12
counter.value()     // 12
\`\`\`

**Common use cases:**
- **Data privacy / encapsulation** — variables not accessible from outside
- **Factory functions** — create multiple independent instances
- **Memoization** — cache expensive results
- **Event handlers that need state**

\`\`\`javascript
function memoize(fn) {
  const cache = {}
  return (n) => cache[n] ?? (cache[n] = fn(n))
}
const fib = memoize(n => n <= 1 ? n : fib(n - 1) + fib(n - 2))
\`\`\``,
  },

  {
    title: "How does the JavaScript event loop work? (call stack, microtasks, macrotasks)",
    tagIds: [JS],
    markdown: `JavaScript is **single-threaded**. The event loop processes tasks in this priority order:

1. **Call stack** — synchronous code runs here first
2. **Microtask queue** — Promises (\`.then\`/\`.catch\`), \`queueMicrotask()\`, \`MutationObserver\` — **drained completely** after each task
3. **Macrotask queue** — \`setTimeout\`, \`setInterval\`, I/O callbacks

\`\`\`javascript
console.log('1')                          // sync

setTimeout(() => console.log('2'), 0)     // macrotask

Promise.resolve()
  .then(() => console.log('3'))           // microtask
  .then(() => console.log('4'))           // microtask (chained)

queueMicrotask(() => console.log('5'))    // microtask

console.log('6')                          // sync

// Output: 1, 6, 3, 5, 4, 2
// Sync first → microtasks fully drained → then macrotask
\`\`\`

**Why it matters:**
- Explains why \`Promise.resolve().then()\` beats \`setTimeout(..., 0)\`
- \`await\` suspends at the microtask level, then resumes
- Long synchronous work blocks the entire UI`,
  },

  {
    title: "var vs let vs const — differences and gotchas",
    tagIds: [JS],
    markdown: `| | \`var\` | \`let\` | \`const\` |
|---|---|---|---|
| Scope | function | block | block |
| Hoisting | yes (→ \`undefined\`) | yes (TDZ) | yes (TDZ) |
| Re-declare | yes | no | no |
| Re-assign | yes | yes | no |

**Temporal Dead Zone (TDZ)** — accessing \`let\`/\`const\` before declaration throws \`ReferenceError\`.

\`\`\`javascript
// var hoisting
console.log(x)  // undefined (no error)
var x = 5

// let TDZ
console.log(y)  // ReferenceError
let y = 5

// const — binding cannot be reassigned, but object is mutable
const obj = { a: 1 }
obj.a = 2     // ✅ property mutation is fine
obj = {}      // ❌ TypeError

// var leaks out of blocks
for (var i = 0; i < 3; i++) {}
console.log(i)  // 3 — leaked!

for (let j = 0; j < 3; j++) {}
console.log(j)  // ReferenceError
\`\`\`

**Rule:** always \`const\` by default, \`let\` when reassignment needed, never \`var\`.`,
  },

  {
    title: "How do Promises work? async/await vs .then()?",
    tagIds: [JS],
    markdown: `A **Promise** represents a value that will be available in the future.
States: \`pending\` → \`fulfilled\` | \`rejected\` (irreversible).

\`\`\`javascript
// .then()/.catch() chain
fetch('/api/user')
  .then(res => {
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  })
  .then(user => console.log(user))
  .catch(err => console.error(err))
  .finally(() => setLoading(false))

// async/await — syntactic sugar over Promises (same behaviour)
async function getUser() {
  try {
    const res = await fetch('/api/user')
    if (!res.ok) throw new Error(res.statusText)
    const user = await res.json()
    console.log(user)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}
\`\`\`

**Parallel execution:**
\`\`\`javascript
// ❌ Sequential — each waits for the previous
const a = await fetchA()
const b = await fetchB()

// ✅ Parallel — both fire at the same time
const [a, b] = await Promise.all([fetchA(), fetchB()])

// Promise.allSettled — doesn't reject if one fails
const results = await Promise.allSettled([fetchA(), fetchB()])
results.forEach(r =>
  r.status === 'fulfilled' ? use(r.value) : log(r.reason)
)
\`\`\``,
  },

  {
    title: "What is hoisting in JavaScript?",
    tagIds: [JS],
    markdown: `Hoisting moves **declarations** (not initialisations) to the top of their scope before execution.

\`\`\`javascript
// Function declarations are fully hoisted
greet()               // ✅ works before declaration
function greet() { console.log('Hello') }

// Function expressions are NOT hoisted
sayHi()               // ❌ TypeError — sayHi is undefined at this point
var sayHi = () => console.log('Hi')

// var — hoisted, initialized as undefined
console.log(name)     // undefined (no error)
var name = 'Filip'

// let/const — hoisted but Temporal Dead Zone
console.log(age)      // ❌ ReferenceError
let age = 25
\`\`\`

**Practical takeaway:** use \`let\`/\`const\` and function expressions (or define functions before calling them) to avoid relying on hoisting behaviour.`,
  },

  {
    title: "What is `this` in JavaScript? How does arrow function differ?",
    tagIds: [JS],
    markdown: `\`this\` is determined by **how a function is called**, not where it's defined.

\`\`\`javascript
// Method call — this = the object
const user = {
  name: 'Filip',
  greet() { console.log(this.name) },           // 'Filip'
  greetArrow: () => console.log(this.name),     // undefined
}
user.greet()       // 'Filip'
user.greetArrow()  // undefined — arrow has no own this

// Constructor — this = new instance
function Person(name) { this.name = name }
const p = new Person('Filip')  // p.name === 'Filip'

// Explicit binding
function greet(g) { console.log(g + ', ' + this.name) }
greet.call({ name: 'Filip' }, 'Hello')    // Hello, Filip
greet.apply({ name: 'Filip' }, ['Hi'])    // Hi, Filip
const bound = greet.bind({ name: 'Filip' })
bound('Hey')                               // Hey, Filip
\`\`\`

**Arrow functions** capture \`this\` **lexically** — ideal for callbacks inside class methods:

\`\`\`javascript
class Timer {
  count = 0
  start() {
    setInterval(() => {
      this.count++  // ✅ arrow fn: this = Timer instance
    }, 1000)
  }
}
\`\`\``,
  },

  {
    title: "Shallow copy vs deep copy — methods and gotchas",
    tagIds: [JS],
    markdown: `**Shallow copy** — copies top-level props. Nested objects remain **shared references**.

\`\`\`javascript
const original = { a: 1, nested: { b: 2 } }

const shallow = { ...original }
shallow.a = 99           // original.a unchanged ✅
shallow.nested.b = 99   // original.nested.b is NOW 99 ⚠️ (same reference)

// Deep copy options
const deep1 = structuredClone(original)          // ✅ modern, handles Date/Map/Set
const deep2 = JSON.parse(JSON.stringify(original)) // ✅ simple, but loses functions/Date/undefined
\`\`\`

**Common mistake in React/Redux state:**
\`\`\`javascript
// ❌ Spread is only one level deep
const newState = { ...state }
newState.user.name = 'Ivan'  // still mutates original state!

// ✅ Deep spread for nested updates
const newState = {
  ...state,
  user: { ...state.user, name: 'Ivan' }
}

// ✅ Or use Immer (via RTK) for deeply nested state
\`\`\``,
  },

  {
    title: "What is debounce vs throttle? Write simple implementations.",
    tagIds: [JS],
    markdown: `**Debounce** — fires ONLY after N ms of **inactivity**. Use for: search inputs, form validation.
**Throttle** — fires **at most once every N ms**. Use for: scroll/resize handlers.

\`\`\`javascript
function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function throttle(fn, limit) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      return fn.apply(this, args)
    }
  }
}
\`\`\`

**In React:**
\`\`\`tsx
// Stable debounced handler (won't recreate on every render)
const handleSearch = useMemo(
  () => debounce((q: string) => dispatch(search(q)), 300),
  [dispatch]
)

// Throttled scroll listener with cleanup
useEffect(() => {
  const onScroll = throttle(() => setY(window.scrollY), 100)
  window.addEventListener('scroll', onScroll)
  return () => window.removeEventListener('scroll', onScroll)
}, [])
\`\`\``,
  },

  {
    title: "What is the prototype chain in JavaScript?",
    tagIds: [JS],
    markdown: `Every JS object has a hidden \`[[Prototype]]\` link to another object. Property lookup **walks the chain** until found or \`null\` is reached.

\`\`\`javascript
const animal = { breathes: true }
const dog = Object.create(animal)
dog.bark = () => 'woof'

dog.bark()     // 'woof' — own property
dog.breathes   // true  — found on prototype
dog.fly        // undefined — not in chain

dog.hasOwnProperty('breathes')  // false
dog.hasOwnProperty('bark')      // true

// Chain: dog → animal → Object.prototype → null
\`\`\`

**ES6 classes are syntactic sugar:**
\`\`\`javascript
class Animal { breathes = true }
class Dog extends Animal {
  bark() { return 'woof' }
}
// Dog.prototype.__proto__ === Animal.prototype

const rex = new Dog()
rex instanceof Dog     // true
rex instanceof Animal  // true — walks the chain
rex instanceof Object  // true
\`\`\``,
  },

  {
    title: "Array higher-order methods — map, filter, reduce and friends",
    tagIds: [JS],
    markdown: `All return a new value without mutating the original array.

\`\`\`javascript
const users = [
  { id: 1, name: 'Filip', active: true,  score: 80 },
  { id: 2, name: 'Ivan',  active: false, score: 55 },
  { id: 3, name: 'Ana',   active: true,  score: 90 },
]

// map — transform every element (same length)
users.map(u => u.name)                    // ['Filip', 'Ivan', 'Ana']

// filter — keep matching elements
users.filter(u => u.active)              // [Filip, Ana]

// reduce — accumulate to any single value
users.reduce((sum, u) => sum + u.score, 0)  // 225

// Chaining
users
  .filter(u => u.active)
  .map(u => u.name)                       // ['Filip', 'Ana']

// reduce to lookup object (common pattern)
const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {})

// find / findIndex
users.find(u => u.score > 85)            // Ana
users.findIndex(u => u.id === 2)         // 1

// some / every
users.some(u => u.score > 85)           // true
users.every(u => u.score > 50)          // true

// flat / flatMap
[[1, 2], [3, 4]].flat()                  // [1, 2, 3, 4]
users.flatMap(u => [u.id, u.name])       // [1,'Filip', 2,'Ivan', ...]
\`\`\``,
  },

  {
    title: "What is event delegation?",
    tagIds: [JS],
    markdown: `Attach **one listener on a parent** and use \`event.target\` to identify which child was clicked, instead of attaching N individual listeners.

\`\`\`javascript
// ❌ N listeners — doesn't work for dynamically added items
document.querySelectorAll('li').forEach(li =>
  li.addEventListener('click', handleClick)
)

// ✅ 1 listener — works for current AND future items
document.querySelector('ul').addEventListener('click', (e) => {
  const li = e.target.closest('li')
  if (!li) return
  handleClick(li.dataset.id)
})
\`\`\`

**Benefits:**
- Less memory (1 vs N listeners)
- Works for dynamically added elements
- Single place to manage the logic

**In React:** React already delegates all synthetic events to the root container internally, so you rarely need this pattern explicitly — but understanding it is a classic interview topic.`,
  },

  {
    title: "== vs === in JavaScript (type coercion)",
    tagIds: [JS],
    markdown: `\`==\` **coerces** types before comparing. \`===\` checks value AND type — no coercion.

\`\`\`javascript
// == surprises
0     == false     // true  (false → 0)
''    == false     // true  (both → 0)
null  == undefined // true  (special rule)
null  == false     // false (null only == null/undefined)
'5'   == 5         // true  (string → number)
[]    == false     // true  ([] → '' → 0)

// === never coerces
0     === false    // false
null  === undefined // false
'5'   === 5        // false
\`\`\`

**Rule:** always use \`===\`. The one common exception:

\`\`\`javascript
// Check for null OR undefined in one shot
if (value == null) { ... }
// equivalent to: value === null || value === undefined
\`\`\``,
  },

  // ─── React ───────────────────────────────────────────────────────────────────
  {
    title: "What is the Virtual DOM and how does React reconciliation work?",
    tagIds: [REACT],
    markdown: `The **Virtual DOM** is a lightweight JS object tree mirroring the real DOM. React keeps the previous and next trees in memory.

**Reconciliation flow on state change:**
1. React renders a new Virtual DOM tree
2. **Diffing** — compares new vs previous tree (O(n) heuristic algorithm)
3. Calculates the minimal set of real DOM mutations
4. **Commit phase** — applies those mutations to the actual DOM

**Diffing heuristics:**
- Different element types → tear down old tree, build new one
- Same type element → update only changed attributes/props
- \`key\` prop → identifies list items across renders

\`\`\`jsx
// key lets React reuse DOM nodes on reorder — without it React rebuilds the list
const list = items.map(item => <Item key={item.id} {...item} />)
\`\`\`

**React Fiber (v16+):** reconciliation is **interruptible**. Long renders can be paused and prioritised, enabling Concurrent Mode features (\`startTransition\`, \`useDeferredValue\`, Suspense).`,
  },

  {
    title: "Controlled vs uncontrolled components",
    tagIds: [REACT],
    markdown: `**Controlled** — React state is the single source of truth. Every keystroke goes through \`onChange → state → re-render\`.

\`\`\`tsx
function Controlled() {
  const [value, setValue] = useState('')
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}
\`\`\`

**Uncontrolled** — the DOM manages the value, accessed via \`ref\` when needed.

\`\`\`tsx
function Uncontrolled() {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSubmit = () => console.log(inputRef.current?.value)
  return <input ref={inputRef} defaultValue="" />
}
\`\`\`

| | Controlled | Uncontrolled |
|---|---|---|
| Instant validation | ✅ | ❌ harder |
| Conditional disable | ✅ | ❌ harder |
| File inputs | ❌ not possible | ✅ required |
| Re-render on every keystroke | yes | no |

**Rule:** use controlled for almost everything. Uncontrolled for file inputs or non-React library integration.`,
  },

  {
    title: "useEffect — dependencies, cleanup, and common mistakes",
    tagIds: [REACT],
    markdown: `\`useEffect\` runs **after** the render is committed to the DOM. Used for: fetching, subscriptions, DOM mutations.

\`\`\`tsx
useEffect(() => { ... })              // every render
useEffect(() => { ... }, [])          // mount only
useEffect(() => { ... }, [userId])    // when userId changes

// Cleanup — runs before next effect and on unmount
useEffect(() => {
  const sub = subscribeToUser(userId, setUser)
  return () => sub.unsubscribe()
}, [userId])
\`\`\`

**Common mistakes:**

\`\`\`tsx
// ❌ Missing dependency — stale userId
useEffect(() => { fetchUser(userId) }, [])

// ❌ Object in deps — infinite loop (new reference each render)
useEffect(() => { ... }, [{ id: userId }])
// Fix: use primitive: [userId]

// ✅ Abort fetch to prevent race conditions + state updates on unmounted component
useEffect(() => {
  const controller = new AbortController()
  fetch(\`/api/user/\${userId}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(e => { if (e.name !== 'AbortError') setError(e) })
  return () => controller.abort()
}, [userId])
\`\`\`

**React 18 Strict Mode** runs effects twice in dev to surface cleanup bugs.`,
  },

  {
    title: "useMemo vs useCallback — when do they actually help?",
    tagIds: [REACT],
    markdown: `\`\`\`tsx
// useMemo — memoizes a computed VALUE
const filteredItems = useMemo(
  () => items.filter(i => i.active && i.name.includes(search)),
  [items, search]   // recalculates only when these change
)

// useCallback — memoizes a FUNCTION REFERENCE
const handleDelete = useCallback(
  (id: string) => dispatch(deleteItem(id)),
  [dispatch]        // dispatch from RTK is always stable
)
\`\`\`

**They only help when combined with \`React.memo\`:**

\`\`\`tsx
// ❌ New function on every render → React.memo is useless
function Parent() {
  const handleClick = (id) => deleteItem(id)   // new ref each render
  return <ItemList items={items} onDelete={handleClick} />
}

// ✅ Stable refs → React.memo actually prevents re-render
function Parent() {
  const handleClick = useCallback((id) => deleteItem(id), [])
  const sorted = useMemo(() => [...items].sort(), [items])
  return <ItemList items={sorted} onDelete={handleClick} />
}

const ItemList = React.memo(({ items, onDelete }) => { ... })
\`\`\`

**Don't over-use.** Both have a cost. Only add them when you have a measurable performance problem.`,
  },

  {
    title: "useRef — beyond DOM access (persisting values without re-render)",
    tagIds: [REACT],
    markdown: `\`useRef\` returns \`{ current: value }\`. Mutating \`current\` does **not trigger a re-render**.

\`\`\`tsx
// 1. DOM access
const inputRef = useRef<HTMLInputElement>(null)
useEffect(() => { inputRef.current?.focus() }, [])
return <input ref={inputRef} />

// 2. Persisting interval/timer IDs
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
const start = () => { intervalRef.current = setInterval(tick, 1000) }
const stop  = () => { clearInterval(intervalRef.current!) }

// 3. Storing previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => { ref.current = value })  // writes AFTER render
  return ref.current                         // reads from PREVIOUS render
}

// 4. Stable ref to latest callback (avoids stale closure in long-lived effects)
function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value   // always current, no stale closure, no dep needed
  return ref
}
\`\`\`

Key distinction: \`useState\` triggers re-render on change, \`useRef\` does not.`,
  },

  {
    title: "Why is the key prop important? What goes wrong with array index as key?",
    tagIds: [REACT],
    markdown: `\`key\` is React's hint for identifying list elements across renders during reconciliation.

\`\`\`tsx
// ❌ Index as key — breaks when list filters, sorts, or deletes
['Apple', 'Banana', 'Cherry'].map((item, i) => <li key={i}>{item}</li>)

// Delete 'Apple':
// Before: Apple(0) Banana(1) Cherry(2)
// After:  Banana(0) Cherry(1)
// React sees key=0 still exists → reuses Apple's DOM node, just changes text
// → wrong component state, broken focus, incorrect animations
\`\`\`

\`\`\`tsx
// ✅ Stable unique ID
items.map(item => <Item key={item.id} {...item} />)
\`\`\`

**Index key is OK only when:**
- List is static (never reorders, filters, or deletes)
- Items have no local state or animations

**Force full remount with key:**
\`\`\`tsx
// Change key to completely reset all state inside the component
<UserProfile key={userId} userId={userId} />
\`\`\``,
  },

  {
    title: "Custom hooks — rules, patterns, and practical example",
    tagIds: [REACT],
    markdown: `Custom hooks extract **reusable stateful logic** from components.

**Rules:**
1. Name must start with \`use\`
2. Can call other hooks
3. Cannot be called conditionally

\`\`\`typescript
// useFetch — reusable data fetching with abort on cleanup
function useFetch<T>(url: string) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}

// useToggle — simple reusable boolean
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle]
}

// Usage
function UserProfile({ id }: { id: string }) {
  const { data: user, loading } = useFetch<User>(\`/api/users/\${id}\`)
  const [expanded, toggleExpanded] = useToggle()
  if (loading) return <Spinner />
  return <div onClick={toggleExpanded}>{user?.name}</div>
}
\`\`\``,
  },

  {
    title: "Context API — how it works and when to use it vs Redux",
    tagIds: [REACT],
    markdown: `Context passes data deeply without prop drilling.

\`\`\`tsx
// 1. Create
const ThemeContext = createContext<'light' | 'dark'>('light')

// 2. Provide
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  )
}

// 3. Consume
function Button() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Click</button>
}
\`\`\`

**Performance caveat:** ALL consumers re-render when context value changes.

\`\`\`tsx
// ❌ One big context — everything re-renders on any change
<AppContext.Provider value={{ user, theme, cart }}>

// ✅ Split by update frequency
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
\`\`\`

**Context vs Redux:**
| Scenario | Choice |
|---|---|
| Auth, theme, locale (rarely changes) | Context |
| Complex state with many actions | Redux |
| High-frequency updates | Redux |
| Need DevTools / time-travel | Redux |
| Just avoiding prop drilling | Context |`,
  },

  {
    title: "useReducer — when to prefer it over useState",
    tagIds: [REACT],
    markdown: `\`useReducer\` is better when multiple pieces of state always change together, or logic is complex.

\`\`\`typescript
type State = {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: User[] | null
  error: string | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR';   payload: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading', data: null, error: null }
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload, error: null }
    case 'FETCH_ERROR':
      return { status: 'error', data: null, error: action.payload }
  }
}

function UserList() {
  const [state, dispatch] = useReducer(reducer, {
    status: 'idle', data: null, error: null
  })

  useEffect(() => {
    dispatch({ type: 'FETCH_START' })
    fetchUsers()
      .then(d  => dispatch({ type: 'FETCH_SUCCESS', payload: d }))
      .catch(e => dispatch({ type: 'FETCH_ERROR',   payload: e.message }))
  }, [])

  if (state.status === 'loading') return <Spinner />
  if (state.status === 'error')   return <Error msg={state.error!} />
  return <List users={state.data!} />
}
\`\`\`

\`dispatch\` is always stable — no need for \`useCallback\` when passing it down.`,
  },

  {
    title: "Error Boundaries — what they catch and what they miss",
    tagIds: [REACT],
    markdown: `Error Boundaries catch errors during **render, lifecycle methods, and constructors** of child components.

\`\`\`tsx
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logToSentry(error, info.componentStack)
  }

  render() {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}

<ErrorBoundary fallback={<div>Something broke. Try refreshing.</div>}>
  <UserProfile userId={id} />
</ErrorBoundary>
\`\`\`

**Does NOT catch:**
- Event handlers → use \`try/catch\`
- Async code (\`setTimeout\`, \`fetch\` callbacks)
- Server-side rendering
- Errors within the boundary itself

**Practical tip:** use the \`react-error-boundary\` npm package for a hook-friendly API:
\`\`\`tsx
import { ErrorBoundary } from 'react-error-boundary'
<ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) =>
  <div>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>Retry</button>
  </div>
}>
  <App />
</ErrorBoundary>
\`\`\``,
  },

  {
    title: "React.lazy and Suspense — code splitting strategy",
    tagIds: [REACT],
    markdown: `Lazy loading lets you split your app into smaller chunks loaded **on demand**.

\`\`\`tsx
// Without lazy — everything in one bundle
import HeavyDashboard from './HeavyDashboard'

// With lazy — chunk downloaded only when component renders
const HeavyDashboard = React.lazy(() => import('./HeavyDashboard'))

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <HeavyDashboard />
    </Suspense>
  )
}
\`\`\`

**Route-level splitting (most impact):**
\`\`\`tsx
const Home     = React.lazy(() => import('./pages/Home'))
const Settings = React.lazy(() => import('./pages/Settings'))
const Profile  = React.lazy(() => import('./pages/Profile'))

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile"  element={<Profile />} />
      </Routes>
    </Suspense>
  )
}
\`\`\`

**Tips:**
- Preload on hover: \`const preload = () => import('./HeavyChart')\`
- Don't split tiny components — network round-trip overhead may outweigh savings
- Measure bundle impact with \`vite-bundle-analyzer\` or webpack-bundle-analyzer`,
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────────
  {
    title: "interface vs type — differences and when to use each",
    tagIds: [TS],
    markdown: `\`\`\`typescript
// Both describe object shapes — key differences at the edges:

// interface — extendable, supports declaration merging
interface User {
  id: number
  name: string
}
interface Admin extends User { role: 'admin' }

// Declaration merging (only interfaces)
interface Window { analytics: Analytics }  // augments existing Window

// type — more expressive for complex type expressions
type ID            = string | number                 // union
type ReadonlyUser  = Readonly<User>                  // utility
type Keys          = keyof User                      // 'id' | 'name'
type Callback      = (id: number) => void            // function
type Pair<T>       = [T, T]                          // tuple
type UserOrAdmin   = User | Admin                    // union of objects
\`\`\`

**Rule of thumb:**
- \`interface\` — public API shapes, class contracts (easier to extend later)
- \`type\` — everything else: unions, intersections, mapped types, utility types, function signatures
- React props: either works; \`type\` is more common in practice`,
  },

  {
    title: "Generics in TypeScript — basic and advanced patterns",
    tagIds: [TS],
    markdown: `Generics let you write **type-safe code that works with multiple types**.

\`\`\`typescript
// Basic
function identity<T>(value: T): T { return value }
identity<string>('hello')   // T = string
identity(42)                // T inferred as number

// Constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
getProperty({ name: 'Filip', age: 25 }, 'name')  // string ✅
getProperty({ name: 'Filip', age: 25 }, 'foo')   // ❌ compile error

// Generic React component
type ListProps<T extends { id: string }> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T extends { id: string }>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(item => <li key={item.id}>{renderItem(item)}</li>)}</ul>
}

// Generic API response wrapper
type ApiResponse<T> = {
  data: T
  status: number
  message: string
}
type UsersResponse = ApiResponse<User[]>
\`\`\``,
  },

  {
    title: "any vs unknown vs never — when to use each",
    tagIds: [TS],
    markdown: `\`\`\`typescript
// any — disables ALL type checking (avoid)
let x: any = fetchSomething()
x.foo.bar.nonExistent()  // no error — TypeScript opts out completely

// unknown — safe alternative: must NARROW before use
let y: unknown = fetchSomething()
y.toUpperCase()  // ❌ Error
if (typeof y === 'string')    y.toUpperCase()   // ✅
if (y instanceof Error)       y.message         // ✅

// never — value that can NEVER exist (bottom type)

// 1. Functions that never return
function throwError(msg: string): never {
  throw new Error(msg)
}

// 2. Exhaustive check — compile error when new variant added without handling
type Shape = 'circle' | 'square' | 'triangle'

function area(shape: Shape): number {
  switch (shape) {
    case 'circle':   return Math.PI
    case 'square':   return 1
    case 'triangle': return 0.5
    default:
      const _check: never = shape  // compile error if Shape grows without update
      return _check
  }
}
\`\`\`

**Summary:** use \`unknown\` instead of \`any\` for unsafe values. Use \`never\` for exhaustive type checks.`,
  },

  {
    title: "Utility types — Partial, Pick, Omit, Record, ReturnType and friends",
    tagIds: [TS],
    markdown: `\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

type UpdateUser  = Partial<User>              // all optional  — for PATCH
type CreateUser  = Omit<User, 'id'>           // exclude id    — for POST
type UserCard    = Pick<User, 'id' | 'name'>  // select subset — for display
type StrictUser  = Required<Partial<User>>    // all required

type RoleMap = Record<'admin' | 'user', string[]>
// { admin: string[]; user: string[] }

type ImmutableUser = Readonly<User>           // all props readonly

// ReturnType, Parameters, Awaited
function fetchUser(id: number, token: string): Promise<User> {
  return fetch('/user').then(r => r.json())
}
type FetchReturn = Awaited<ReturnType<typeof fetchUser>>  // User
type FetchParams = Parameters<typeof fetchUser>            // [number, string]

// NonNullable
type MaybeUser = User | null | undefined
type DefiniteUser = NonNullable<MaybeUser>  // User
\`\`\``,
  },

  {
    title: "Type narrowing — typeof, instanceof, in, discriminated unions",
    tagIds: [TS],
    markdown: `Type narrowing refines a broad type to a specific one based on a runtime check.

\`\`\`typescript
// typeof
function process(value: string | number) {
  if (typeof value === 'string') return value.toUpperCase()
  return value.toFixed(2)
}

// instanceof
function handleError(error: unknown): string {
  if (error instanceof Error)        return error.message
  if (typeof error === 'string')     return error
  return 'Unknown error'
}

// in — check for property existence
type Cat = { meow(): void }
type Dog = { bark(): void }

function makeSound(animal: Cat | Dog) {
  if ('meow' in animal) animal.meow()
  else                  animal.bark()
}

// Discriminated union — most powerful pattern
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error';   error: string }

function render<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'loading': return <Spinner />
    case 'success': return <List data={state.data} />  // TS knows data: T
    case 'error':   return <Err msg={state.error} />   // TS knows error: string
    case 'idle':    return null
  }
}
\`\`\``,
  },

  {
    title: "TypeScript with React — typing props, events, refs, and hooks",
    tagIds: [TS, REACT],
    markdown: `\`\`\`typescript
// Props
type ButtonProps = {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary'
  children?: React.ReactNode
  disabled?: boolean
}

function Button({ label, onClick, variant = 'primary', children }: ButtonProps) {
  return <button className={variant} onClick={onClick}>{children ?? label}</button>
}

// Events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => e.target.value
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault() }
const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submit() }

// Refs
const inputRef = useRef<HTMLInputElement>(null)
// inputRef.current is HTMLInputElement | null

// State
const [user, setUser] = useState<User | null>(null)
const [ids, setIds]   = useState<string[]>([])

// Generic hook
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle]
}

// forwardRef
const Input = React.forwardRef<HTMLInputElement, { label: string }>(
  ({ label }, ref) => <label>{label}<input ref={ref} /></label>
)
\`\`\``,
  },

  {
    title: "Conditional types and the `infer` keyword",
    tagIds: [TS],
    markdown: `Conditional types choose a type based on a condition: \`T extends U ? X : Y\`

\`\`\`typescript
// Basic
type IsString<T> = T extends string ? true : false
type A = IsString<string>  // true
type B = IsString<number>  // false

// Built-in conditional types
type C = NonNullable<string | null | undefined>  // string
type D = Extract<'a' | 'b' | 1 | 2, string>     // 'a' | 'b'
type E = Exclude<'a' | 'b' | 1 | 2, string>     // 1 | 2

// infer — extract a type from within another
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

function greet(name: string): string { return 'Hi ' + name }
type R = MyReturnType<typeof greet>  // string

// Unwrap Promise
type Awaited<T> = T extends Promise<infer R> ? R : T
type User = Awaited<Promise<{ id: number }>>  // { id: number }

// Unwrap array items
type ItemOf<T> = T extends (infer Item)[] ? Item : never
type Num = ItemOf<number[]>  // number

// Extract component props
type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never
type BtnProps = PropsOf<typeof Button>
\`\`\``,
  },

  // ─── Redux / RTK ─────────────────────────────────────────────────────────────
  {
    title: "Redux — three core principles",
    tagIds: [REDUX],
    markdown: `**1. Single source of truth**
The entire app state lives in one object tree inside one store.

\`\`\`javascript
store.getState()
// { user: {...}, cart: {...}, notifications: [...] }
\`\`\`

**2. State is read-only**
The only way to change state is to dispatch a plain action object.

\`\`\`javascript
state.user.name = 'Ivan'                     // ❌ never mutate directly
dispatch({ type: 'user/setName', payload: 'Ivan' })  // ✅
\`\`\`

**3. Changes via pure reducer functions**
Reducers are pure: \`(previousState, action) => newState\`. No side effects, no mutation.

\`\`\`javascript
function reducer(state = initialState, action) {
  switch (action.type) {
    case 'user/setName':
      return { ...state, user: { ...state.user, name: action.payload } }
    default:
      return state
  }
}
\`\`\`

**Why these rules?**
- Predictability — same action + state = same result
- DevTools — time-travel debugging, action replay
- Testability — pure functions are trivially testable
- React integration — reference equality checks work correctly`,
  },

  {
    title: "createSlice — Redux Toolkit pattern explained",
    tagIds: [REDUX, TS],
    markdown: `\`createSlice\` combines action creators, action types, and reducer into one object.

\`\`\`typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartState {
  items: { id: string; qty: number }[]
  total: number
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 } as CartState,
  reducers: {
    addItem(state, action: PayloadAction<{ id: string; price: number }>) {
      // Immer — "mutation" syntax produces immutable update under the hood
      state.items.push({ id: action.payload.id, qty: 1 })
      state.total += action.payload.price
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    clearCart(state) {
      state.items = []
      state.total = 0
    },
  },
})

export const { addItem, removeItem, clearCart } = cartSlice.actions
// Auto-generated types: 'cart/addItem', 'cart/removeItem', 'cart/clearCart'
export default cartSlice.reducer
\`\`\`

\`\`\`typescript
// configureStore
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: { cart: cartSlice.reducer, user: userSlice.reducer }
})

export type RootState  = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
\`\`\``,
  },

  {
    title: "createAsyncThunk — handling async operations in RTK",
    tagIds: [REDUX, TS],
    markdown: `\`\`\`typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// 1. Define the thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      return (await res.json()) as User[]
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  }
)

// 2. Handle lifecycle actions in the slice
const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [] as User[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// 3. Dispatch from component
function UserList() {
  const dispatch = useAppDispatch()
  useEffect(() => { dispatch(fetchUsers()) }, [dispatch])
}
\`\`\`

The thunk auto-dispatches \`pending\`, \`fulfilled\`, and \`rejected\` action types.`,
  },

  {
    title: "RTK Query — data fetching and cache invalidation",
    tagIds: [REDUX, TS],
    markdown: `RTK Query replaces manual async thunk + loading/error state boilerplate.

\`\`\`typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, Omit<User, 'id'>>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],  // auto-refetches getUsers after create
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: \`/users/\${id}\`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
})

export const { useGetUsersQuery, useCreateUserMutation, useDeleteUserMutation } = usersApi

// Component — no useEffect / useState needed
function UserList() {
  const { data: users = [], isLoading, error } = useGetUsersQuery()
  const [deleteUser] = useDeleteUserMutation()

  if (isLoading) return <Spinner />
  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>
          {u.name} <button onClick={() => deleteUser(u.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
\`\`\``,
  },

  {
    title: "Immer — how it enables mutable syntax in Redux Toolkit",
    tagIds: [REDUX],
    markdown: `Immer uses **JavaScript Proxies** to track changes and produce a new immutable object without you having to spread everything manually.

\`\`\`javascript
// Without Immer — nested state is painful
case 'UPDATE_CITY':
  return {
    ...state,
    user: {
      ...state.user,
      address: {
        ...state.user.address,
        city: action.payload,
      },
    },
  }

// With Immer (RTK createSlice uses it automatically)
reducers: {
  updateCity(state, action) {
    state.user.address.city = action.payload  // looks like mutation — it's safe!
  },
  addTag(state, action) {
    state.tags.push(action.payload)  // push is fine
  },
}
\`\`\`

**Rules:**
1. Either **mutate** the \`state\` draft
2. Or **return** a new value — never both

\`\`\`javascript
// ❌ Both mutation AND return — Immer throws
updateName(state, action) {
  state.name = action.payload
  return state              // Error!
}

// ✅ Mutation only
updateName(state, action) { state.name = action.payload }

// ✅ Return only
updateName(state, action) { return { ...state, name: action.payload } }
\`\`\`

RTK bundles Immer — no separate install needed.`,
  },

  {
    title: "Selector memoization with createSelector",
    tagIds: [REDUX, TS],
    markdown: `\`useSelector\` re-runs on **every Redux state change**. Memoize expensive selectors with \`createSelector\`.

\`\`\`typescript
import { createSelector } from '@reduxjs/toolkit'

// Without memoization — filter + sort on every dispatch
const selectActive = (state: RootState) =>
  state.users.list.filter(u => u.active).sort((a, b) => a.name.localeCompare(b.name))

// With createSelector — recalculates only when list changes
const selectActiveSorted = createSelector(
  (state: RootState) => state.users.list,   // input selector (memoized input)
  (list) =>                                   // result function
    [...list].filter(u => u.active).sort((a, b) => a.name.localeCompare(b.name))
)

// Component
const users = useAppSelector(selectActiveSorted)

// Parameterized selector (factory pattern)
const makeSelectById = (id: string) =>
  createSelector(
    (state: RootState) => state.users.list,
    (list) => list.find(u => u.id === id)
  )

function UserItem({ id }: { id: string }) {
  // Each instance creates its own memoized selector
  const selectUser = useMemo(() => makeSelectById(id), [id])
  const user = useAppSelector(selectUser)
}
\`\`\`

Without memoization, computed lists force re-renders across the tree on every unrelated dispatch.`,
  },
]
