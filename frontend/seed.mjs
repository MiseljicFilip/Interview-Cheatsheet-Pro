const API_KEY = "AIzaSyCHDDcf_xQ9kir8lDISuyh1UTQlj5DoMbI"
const DB_URL = "https://interview-cheatsheet-pro-default-rtdb.europe-west1.firebasedatabase.app"

const TAGS = [
  { id: "tag-nodejs", label: "Node.js" },
  { id: "tag-express", label: "Express" },
  { id: "tag-sql", label: "SQL" },
  { id: "tag-postgresql", label: "PostgreSQL" },
]

const NOTES = [
  // ── Node.js ────────────────────────────────────────────────────────────────
  {
    title: "Explain the Node.js event loop and its phases",
    tagIds: ["tag-nodejs"],
    markdown: `The event loop is what allows Node.js to perform non-blocking I/O despite JavaScript being single-threaded. It offloads operations to the OS kernel whenever possible.

**Phases (in order):**
1. **timers** – executes \`setTimeout\` and \`setInterval\` callbacks
2. **pending callbacks** – I/O callbacks deferred to the next loop iteration
3. **idle, prepare** – internal use only
4. **poll** – retrieves new I/O events; execute I/O callbacks
5. **check** – \`setImmediate\` callbacks run here
6. **close callbacks** – e.g. \`socket.on('close', ...)\`

Between each phase, Node.js checks for \`process.nextTick\` and microtask (Promise) queues and drains them first.

\`\`\`js
setTimeout(() => console.log('timeout'), 0)
setImmediate(() => console.log('immediate'))
process.nextTick(() => console.log('nextTick'))
Promise.resolve().then(() => console.log('promise'))
// Output: nextTick → promise → timeout → immediate
\`\`\``,
  },
  {
    title: "Difference between process.nextTick(), setImmediate(), and setTimeout(0)",
    tagIds: ["tag-nodejs"],
    markdown: `| | Queue | When it runs |
|---|---|---|
| \`process.nextTick(cb)\` | nextTick queue | Before any I/O, before next event loop phase |
| \`Promise.then(cb)\` | microtask queue | After nextTick, before next phase |
| \`setImmediate(cb)\` | check phase | After poll phase, in the same iteration |
| \`setTimeout(cb, 0)\` | timers phase | In the next iteration (or same if timers fire early) |

**Rule of thumb:** \`nextTick\` > Promises > \`setImmediate\` ≈ \`setTimeout(0)\`

Use \`process.nextTick\` to defer something within the current operation but before I/O.
Use \`setImmediate\` to run after I/O callbacks.`,
  },
  {
    title: "What are Streams in Node.js and what are the four types?",
    tagIds: ["tag-nodejs"],
    markdown: `Streams are objects that let you read or write data continuously instead of loading it all into memory.

**Four types:**
- **Readable** – source of data (\`fs.createReadStream\`)
- **Writable** – destination for data (\`fs.createWriteStream\`)
- **Duplex** – both readable and writable (\`net.Socket\`)
- **Transform** – duplex that transforms data as it passes through (\`zlib.createGzip\`)

\`\`\`js
const { Transform } = require('stream')

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

process.stdin.pipe(upperCase).pipe(process.stdout)
\`\`\`

**Why use streams?** Memory efficiency — process a 10 GB file with constant ~few MB memory usage.`,
  },
  {
    title: "How does clustering work in Node.js and when do you use it?",
    tagIds: ["tag-nodejs"],
    markdown: `Node.js runs in a single thread, so by default it uses only one CPU core. The \`cluster\` module (or worker processes via PM2) lets you fork multiple processes that all share the same port.

\`\`\`js
const cluster = require('cluster')
const os = require('os')

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker) => {
    console.log(\`Worker \${worker.process.pid} died, restarting...\`)
    cluster.fork()
  })
} else {
  require('./server') // each worker runs the HTTP server
}
\`\`\`

**Use when:** CPU-bound workloads, maximizing multi-core utilization.
**Alternative:** Worker Threads (shared memory), PM2 cluster mode (production).`,
  },
  {
    title: "What are Worker Threads and how do they differ from child_process?",
    tagIds: ["tag-nodejs"],
    markdown: `**Worker Threads** (v10.5+) run JavaScript in parallel threads within the same process, sharing memory via \`SharedArrayBuffer\`.

**child_process** spawns a completely separate OS process with its own V8 and memory.

| | Worker Threads | child_process |
|---|---|---|
| Memory | Shared (\`SharedArrayBuffer\`) | Separate |
| IPC | \`postMessage\`, \`Atomics\` | stdin/stdout/IPC channel |
| Use case | CPU-heavy JS (crypto, image processing) | Shell commands, other runtimes |
| Overhead | Lower | Higher |

\`\`\`js
const { Worker, isMainThread, parentPort } = require('worker_threads')

if (isMainThread) {
  const worker = new Worker(__filename)
  worker.on('message', (result) => console.log(result))
} else {
  // heavy computation
  parentPort.postMessage(fibonacci(40))
}
\`\`\``,
  },
  {
    title: "How do you handle errors in async Node.js code?",
    tagIds: ["tag-nodejs"],
    markdown: `**Three patterns:**

1. **Callbacks** – error-first convention
\`\`\`js
fs.readFile('file.txt', (err, data) => {
  if (err) return handleError(err)
  // use data
})
\`\`\`

2. **Promises / async-await**
\`\`\`js
async function readConfig() {
  try {
    const data = await fs.promises.readFile('config.json', 'utf8')
    return JSON.parse(data)
  } catch (err) {
    throw new Error(\`Config load failed: \${err.message}\`)
  }
}
\`\`\`

3. **Global uncaught handlers (last resort)**
\`\`\`js
process.on('uncaughtException', (err) => {
  logger.error(err)
  process.exit(1) // always exit — state is unknown
})

process.on('unhandledRejection', (reason) => {
  throw reason
})
\`\`\`

**Never** ignore errors or swallow them silently.`,
  },
  {
    title: "What is the Node.js module system? CommonJS vs ESM",
    tagIds: ["tag-nodejs"],
    markdown: `**CommonJS (CJS)** – default in Node.js
\`\`\`js
const express = require('express')
module.exports = { handler }
\`\`\`
- Synchronous, loads at runtime
- \`require\` can be called anywhere (conditionally)
- \`.js\` files default to CJS

**ESM (ES Modules)**
\`\`\`js
import express from 'express'
export const handler = () => {}
\`\`\`
- Asynchronous, statically analyzed
- Tree-shakeable
- Requires \`"type": "module"\` in package.json or \`.mjs\` extension

**Key differences:**
| | CJS | ESM |
|---|---|---|
| \`__dirname\` | ✅ | ❌ (use \`import.meta.url\`) |
| Top-level await | ❌ | ✅ |
| Dynamic import | \`require()\` | \`import()\` |
| Named exports analysis | Runtime | Static |`,
  },
  {
    title: "How do you prevent memory leaks in Node.js?",
    tagIds: ["tag-nodejs"],
    markdown: `**Common causes:**
- Global variables accumulating data
- Event listeners not removed (\`emitter.on\` without \`off\`)
- Closures holding references
- Caches that grow unboundedly
- Unclosed database connections / streams

**Detection:**
\`\`\`bash
node --inspect app.js
# Open chrome://inspect → Heap snapshot → compare snapshots over time
\`\`\`

\`\`\`js
// Track listener count
emitter.setMaxListeners(20)
process.on('warning', (w) => {
  if (w.name === 'MaxListenersExceededWarning') console.error(w)
})
\`\`\`

**Tools:** \`clinic.js\`, \`heapdump\`, \`--expose-gc\` + manual GC, \`memwatch-next\`

**Fix pattern:**
\`\`\`js
// Always remove listeners when done
const handler = (data) => process(data)
emitter.on('data', handler)
// cleanup
emitter.off('data', handler)
\`\`\``,
  },

  // ── Express ────────────────────────────────────────────────────────────────
  {
    title: "How does middleware work in Express?",
    tagIds: ["tag-express"],
    markdown: `Middleware are functions with the signature \`(req, res, next)\`. They form a chain — each calls \`next()\` to pass control to the next middleware.

\`\`\`js
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`)
  next() // pass to next middleware
})

// Error middleware has 4 params
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message })
})
\`\`\`

**Execution order:** top to bottom as registered. Route handlers are just middleware that typically don't call \`next()\`.

**Types:**
- Application-level: \`app.use()\`
- Router-level: \`router.use()\`
- Error-handling: 4 params \`(err, req, res, next)\`
- Built-in: \`express.json()\`, \`express.static()\`
- Third-party: \`cors\`, \`helmet\`, \`morgan\``,
  },
  {
    title: "What is the difference between req.params, req.query, and req.body?",
    tagIds: ["tag-express"],
    markdown: `\`\`\`
GET /users/42/posts?page=2&limit=10
POST /users  { "name": "Ana" }
\`\`\`

| | Source | Example |
|---|---|---|
| \`req.params\` | URL path segments | \`/users/:id\` → \`req.params.id === '42'\` |
| \`req.query\` | Query string | \`?page=2\` → \`req.query.page === '2'\` |
| \`req.body\` | Request body | JSON/form data, requires \`express.json()\` middleware |

\`\`\`js
app.get('/users/:id/posts', (req, res) => {
  const userId = req.params.id      // '42'
  const page = req.query.page       // '2'
  const limit = req.query.limit     // '10'
  res.json({ userId, page, limit })
})

app.post('/users', express.json(), (req, res) => {
  const { name } = req.body         // 'Ana'
  res.status(201).json({ name })
})
\`\`\``,
  },
  {
    title: "How do you handle errors in Express?",
    tagIds: ["tag-express"],
    markdown: `Express has a built-in error handler, but you should define your own with **4 parameters**.

\`\`\`js
// Wrap async handlers to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await db.findUser(req.params.id)
  if (!user) throw Object.assign(new Error('Not found'), { status: 404 })
  res.json(user)
}))

// Central error handler — must be last app.use()
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  res.status(status).json({
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})
\`\`\`

**Key:** error middleware must have exactly 4 params or Express ignores it.`,
  },
  {
    title: "How do you structure a large Express application?",
    tagIds: ["tag-express"],
    markdown: `\`\`\`
src/
├── app.js            # Express app setup (no listen)
├── server.js         # HTTP server, port binding
├── routes/
│   ├── index.js      # mounts all routers
│   ├── users.js
│   └── posts.js
├── controllers/      # request/response logic
├── services/         # business logic (no req/res)
├── models/           # DB queries / ORM
├── middleware/
│   ├── auth.js
│   ├── validate.js
│   └── errorHandler.js
└── config/           # env, db connection
\`\`\`

\`\`\`js
// routes/users.js
const router = express.Router()
router.get('/', UsersController.list)
router.post('/', validate(createUserSchema), UsersController.create)
router.get('/:id', UsersController.get)
module.exports = router

// app.js
app.use('/api/users', require('./routes/users'))
\`\`\`

**Key principle:** controllers are thin, services hold business logic, models handle data access.`,
  },
  {
    title: "How do you implement JWT authentication in Express?",
    tagIds: ["tag-express"],
    markdown: `\`\`\`js
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET

// Generate token on login
app.post('/auth/login', async (req, res) => {
  const user = await User.findByCredentials(req.body)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token })
})

// Auth middleware
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).end()

  try {
    req.user = jwt.verify(header.slice(7), SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Protected route
app.get('/profile', requireAuth, (req, res) => {
  res.json({ userId: req.user.userId })
})
\`\`\`

**Best practices:** short-lived access tokens + refresh tokens, store refresh in httpOnly cookie.`,
  },
  {
    title: "What security headers and practices should every Express app have?",
    tagIds: ["tag-express"],
    markdown: `\`\`\`js
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cors = require('cors')

// Security headers (CSP, X-Frame-Options, etc.)
app.use(helmet())

// CORS — whitelist specific origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
}))

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
}))

// Body size limit (prevents payload attacks)
app.use(express.json({ limit: '10kb' }))

// Never expose stack traces in production
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal error' : err.message
  })
})
\`\`\`

**Checklist:** \`helmet\`, CORS whitelist, rate limiting, input validation (\`zod\`/\`joi\`), parameterized queries, HTTPS only.`,
  },

  // ── SQL ────────────────────────────────────────────────────────────────────
  {
    title: "Explain the different types of SQL JOINs",
    tagIds: ["tag-sql"],
    markdown: `\`\`\`sql
-- INNER JOIN: only rows with a match in BOTH tables
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id

-- LEFT JOIN: all rows from left, matched rows from right (NULL if no match)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id

-- RIGHT JOIN: all rows from right, matched from left
-- FULL OUTER JOIN: all rows from both, NULL where no match
-- CROSS JOIN: cartesian product (every row × every row)
-- SELF JOIN: join a table with itself
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
\`\`\`

**Rule of thumb:** use INNER when you only want matched records, LEFT when you want all from the primary entity regardless of related data.`,
  },
  {
    title: "What are indexes, how do they work, and what are the trade-offs?",
    tagIds: ["tag-sql"],
    markdown: `An index is a separate data structure (usually a B-tree) that allows the DB to find rows without a full table scan.

\`\`\`sql
-- Single column
CREATE INDEX idx_users_email ON users(email);

-- Composite — order matters, left-most prefix rule
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Unique
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Partial (PostgreSQL) — only index a subset
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
\`\`\`

**Trade-offs:**
| Benefit | Cost |
|---|---|
| Fast reads (SELECT, WHERE, JOIN) | Slower writes (INSERT/UPDATE/DELETE must update index) |
| ORDER BY / GROUP BY speed | Extra disk space |

**When NOT to index:** small tables, columns with low cardinality (e.g. boolean), columns rarely used in WHERE.`,
  },
  {
    title: "Explain ACID properties",
    tagIds: ["tag-sql"],
    markdown: `ACID guarantees that database transactions are processed reliably.

**A – Atomicity:** All operations in a transaction succeed or all are rolled back. No partial updates.
\`\`\`sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- or ROLLBACK on error
\`\`\`

**C – Consistency:** A transaction brings the DB from one valid state to another. Constraints (FK, CHECK) are always enforced.

**I – Isolation:** Concurrent transactions don't see each other's partial changes. Isolation levels:
- READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE

**D – Durability:** Once committed, data survives crashes (written to disk/WAL).

**In interviews:** give the bank transfer example, mention that NoSQL databases often sacrifice some ACID properties for availability/performance (CAP theorem).`,
  },
  {
    title: "What is database normalization? 1NF, 2NF, 3NF",
    tagIds: ["tag-sql"],
    markdown: `Normalization eliminates data redundancy and ensures integrity.

**1NF – First Normal Form**
- Each column holds atomic (indivisible) values
- No repeating groups
\`\`\`
BAD:  user_id | phones
      1       | 555-1234, 555-5678

GOOD: user_id | phone
      1       | 555-1234
      1       | 555-5678
\`\`\`

**2NF – Second Normal Form** (requires 1NF)
- Every non-key column depends on the **whole** primary key (no partial dependency)
- Relevant when you have composite keys

**3NF – Third Normal Form** (requires 2NF)
- No transitive dependencies (non-key column depends on another non-key column)
\`\`\`
BAD:  order_id | customer_id | customer_city
      (city depends on customer, not on order)

GOOD: separate customers table with city
\`\`\`

**In practice:** design to 3NF, then **denormalize intentionally** for read performance.`,
  },
  {
    title: "What is the difference between WHERE and HAVING?",
    tagIds: ["tag-sql"],
    markdown: `\`\`\`sql
-- WHERE filters rows BEFORE aggregation
SELECT department, COUNT(*) AS emp_count
FROM employees
WHERE active = true          -- filters individual rows first
GROUP BY department
HAVING COUNT(*) > 5          -- filters groups AFTER aggregation

-- You CANNOT use aggregate functions in WHERE:
-- WHERE COUNT(*) > 5  ← ERROR

-- You CAN reference column aliases in HAVING (PostgreSQL allows it)
HAVING emp_count > 5
\`\`\`

**Execution order:**
1. FROM / JOIN
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
6. ORDER BY
7. LIMIT

This is why you can't use SELECT aliases in WHERE (they don't exist yet).`,
  },
  {
    title: "What are window functions and when do you use them?",
    tagIds: ["tag-sql"],
    markdown: `Window functions perform calculations across a set of rows related to the current row **without collapsing them** (unlike GROUP BY).

\`\`\`sql
SELECT
  employee_id,
  department,
  salary,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS overall_rank,
  LAG(salary) OVER (PARTITION BY department ORDER BY hire_date) AS prev_salary
FROM employees;
\`\`\`

**Key functions:**
- \`ROW_NUMBER()\` – unique sequential number
- \`RANK()\` / \`DENSE_RANK()\` – ranking with/without gaps on ties
- \`LAG()\` / \`LEAD()\` – access previous/next row value
- \`SUM()\` / \`AVG()\` – running totals

**Use when:** rankings, running totals, comparing rows to group averages, pagination.`,
  },
  {
    title: "How do subqueries work and when to use them vs JOINs?",
    tagIds: ["tag-sql"],
    markdown: `\`\`\`sql
-- Subquery in WHERE
SELECT name FROM users
WHERE id IN (
  SELECT user_id FROM orders WHERE total > 1000
)

-- Correlated subquery (references outer query — runs once per row, can be slow)
SELECT name, salary
FROM employees e
WHERE salary > (
  SELECT AVG(salary) FROM employees WHERE department = e.department
)

-- Subquery as derived table (in FROM)
SELECT dept, avg_sal
FROM (
  SELECT department AS dept, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department
) AS dept_stats
WHERE avg_sal > 70000
\`\`\`

**Subquery vs JOIN:**
- JOIN is usually faster and more readable
- Use subqueries for: EXISTS checks, when you need to aggregate before joining, when the logic reads more clearly
- Correlated subqueries are slow — consider rewriting as JOIN or CTE`,
  },

  // ── PostgreSQL ────────────────────────────────────────────────────────────
  {
    title: "What is JSONB in PostgreSQL and when do you use it?",
    tagIds: ["tag-postgresql"],
    markdown: `PostgreSQL has two JSON types:
- \`json\` – stores raw text, validates JSON, preserves whitespace/key order
- \`jsonb\` – stores binary parsed format, **indexed**, supports operators, slightly slower on write

\`\`\`sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  attributes JSONB
);

INSERT INTO products VALUES (1, 'Laptop', '{"ram": 16, "gpu": "RTX 4070", "tags": ["gaming"]}');

-- Query JSONB
SELECT * FROM products WHERE attributes->>'gpu' = 'RTX 4070';
SELECT * FROM products WHERE attributes @> '{"ram": 16}';

-- GIN index for fast JSONB queries
CREATE INDEX idx_products_attrs ON products USING GIN(attributes);

-- Extract nested value
SELECT attributes->'tags'->0 FROM products WHERE id = 1; -- "gaming"
\`\`\`

**Use JSONB when:** schema is flexible/unknown, storing semi-structured data, need querying. Avoid replacing properly normalized columns.`,
  },
  {
    title: "What are CTEs (Common Table Expressions) and when do you use them?",
    tagIds: ["tag-postgresql"],
    markdown: `A CTE (WITH clause) is a named temporary result set scoped to a single query.

\`\`\`sql
-- Basic CTE for readability
WITH active_users AS (
  SELECT id, name, email
  FROM users
  WHERE active = true AND created_at > NOW() - INTERVAL '30 days'
),
user_orders AS (
  SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
  FROM orders
  GROUP BY user_id
)
SELECT u.name, u.email, COALESCE(o.order_count, 0) AS orders
FROM active_users u
LEFT JOIN user_orders o ON u.id = o.user_id
ORDER BY o.total_spent DESC NULLS LAST;

-- Recursive CTE (org chart, tree structures)
WITH RECURSIVE subordinates AS (
  SELECT id, name, manager_id FROM employees WHERE id = 1  -- anchor
  UNION ALL
  SELECT e.id, e.name, e.manager_id
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id              -- recursive
)
SELECT * FROM subordinates;
\`\`\`

**Use CTEs for:** breaking complex queries into readable steps, recursive data (trees), reusing a subquery multiple times.`,
  },
  {
    title: "How do you read and use EXPLAIN ANALYZE in PostgreSQL?",
    tagIds: ["tag-postgresql"],
    markdown: `\`\`\`sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true
GROUP BY u.id;
\`\`\`

**Sample output:**
\`\`\`
HashAggregate (cost=1234.00..1250.00 rows=800 width=40)
              (actual time=45.2..46.1 rows=800 loops=1)
  ->  Hash Left Join (cost=... actual time=20.1..40.5 rows=3200 loops=1)
        Hash Cond: (o.user_id = u.id)
        ->  Seq Scan on orders (cost=... actual time=...)
        ->  Hash (cost=... actual time=...)
              ->  Index Scan on users (cost=... actual time=...)
                    Index Cond: (active = true)
\`\`\`

**Key things to look for:**
- **Seq Scan** on large tables → missing index
- **cost=X..Y** – estimated; **actual time** – real
- **rows** estimate vs actual – big difference means stale statistics (\`ANALYZE\` table)
- **loops** – how many times a node executed
- **Nested Loop** on large sets → consider Hash Join

Run \`ANALYZE tablename;\` to refresh statistics when estimates are off.`,
  },
  {
    title: "How does PostgreSQL MVCC work and what are its implications?",
    tagIds: ["tag-postgresql"],
    markdown: `**MVCC (Multi-Version Concurrency Control)** allows readers and writers to not block each other.

**How it works:**
- Each row has \`xmin\` (transaction that created it) and \`xmax\` (transaction that deleted it)
- A SELECT sees the version of a row that was committed at the time its transaction started
- UPDATE = INSERT new version + mark old version with \`xmax\`
- DELETE = mark row with \`xmax\`

\`\`\`sql
-- Transaction A: reads balance = 1000
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- sees 1000

-- Transaction B: updates to 1200, commits
UPDATE accounts SET balance = 1200 WHERE id = 1;
COMMIT;

-- Transaction A: still sees 1000 (REPEATABLE READ or SERIALIZABLE)
SELECT balance FROM accounts WHERE id = 1;  -- still 1000
COMMIT;
\`\`\`

**Implication – dead tuples:** Old row versions aren't immediately removed. **VACUUM** reclaims space. \`autovacuum\` runs automatically but may need tuning on high-write tables.

**Table bloat** is a real issue in high-update tables. Monitor with \`pg_stat_user_tables\`.`,
  },
  {
    title: "What are PostgreSQL indexes beyond B-tree?",
    tagIds: ["tag-postgresql"],
    markdown: `\`\`\`sql
-- B-tree (default) — equality, range, ORDER BY
CREATE INDEX ON users(email);

-- GIN (Generalized Inverted Index) — arrays, JSONB, full-text search
CREATE INDEX ON products USING GIN(attributes);         -- JSONB
CREATE INDEX ON articles USING GIN(to_tsvector('english', body)); -- FTS

-- GiST — geometric types, full-text, ranges
CREATE INDEX ON events USING GIST(tsrange(start_at, end_at));

-- BRIN (Block Range Index) — huge tables with natural ordering (logs, time-series)
-- Very small index, fast writes, approximate (good for timestamp on append-only tables)
CREATE INDEX ON logs USING BRIN(created_at);

-- Hash — only equality checks, slightly faster than B-tree for =
CREATE INDEX ON sessions USING HASH(token);

-- Partial — only index a subset of rows
CREATE INDEX ON orders(user_id) WHERE status = 'pending';

-- Expression — index on a computation
CREATE INDEX ON users(lower(email));  -- for case-insensitive lookups
\`\`\`

**GIN** is the go-to for JSONB and full-text. **BRIN** for time-series. **Partial** indexes save space and are faster when queries filter on a specific value.`,
  },
  {
    title: "How do you implement full-text search in PostgreSQL?",
    tagIds: ["tag-postgresql"],
    markdown: `\`\`\`sql
-- tsvector: normalized document representation
-- tsquery: search query

SELECT title
FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'nodejs & performance');

-- Store pre-computed tsvector for performance
ALTER TABLE articles ADD COLUMN search_vector TSVECTOR;

UPDATE articles
SET search_vector = to_tsvector('english', title || ' ' || body);

-- Auto-update with trigger
CREATE TRIGGER update_search_vector
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', title, body);

-- GIN index for fast search
CREATE INDEX ON articles USING GIN(search_vector);

-- With ranking
SELECT title, ts_rank(search_vector, query) AS rank
FROM articles, to_tsquery('english', 'nodejs') query
WHERE search_vector @@ query
ORDER BY rank DESC;
\`\`\`

**For fuzzy/typo-tolerant search:** use \`pg_trgm\` extension with GIN/GIST index on trigrams.`,
  },
  {
    title: "What are transactions and savepoints in PostgreSQL?",
    tagIds: ["tag-postgresql"],
    markdown: `\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;

SAVEPOINT before_credit;  -- partial rollback point

UPDATE accounts SET balance = balance + 500 WHERE id = 2;

-- If something goes wrong with the credit:
ROLLBACK TO SAVEPOINT before_credit;
-- can retry just the credit part without losing the debit

UPDATE accounts SET balance = balance + 500 WHERE id = 3;

COMMIT;
\`\`\`

**Isolation levels in PostgreSQL:**
\`\`\`sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- or SERIALIZABLE for full protection against phantom reads
\`\`\`

| Level | Dirty Read | Non-repeatable Read | Phantom Read |
|---|---|---|---|
| READ COMMITTED (default) | ✗ | possible | possible |
| REPEATABLE READ | ✗ | ✗ | ✗ (PG handles this) |
| SERIALIZABLE | ✗ | ✗ | ✗ |

**In Node.js with pg:**
\`\`\`js
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('UPDATE ...')
  await client.query('COMMIT')
} catch (err) {
  await client.query('ROLLBACK')
  throw err
} finally {
  client.release()
}
\`\`\``,
  },
  {
    title: "How do you connect PostgreSQL from Node.js and manage connection pools?",
    tagIds: ["tag-nodejs", "tag-postgresql"],
    markdown: `Use the \`pg\` (node-postgres) library.

\`\`\`js
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,          // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Simple query (auto-acquires and releases connection)
const { rows } = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)

// Transaction (manual connection management)
const client = await pool.connect()
try {
  await client.query('BEGIN')
  const { rows: [user] } = await client.query(
    'INSERT INTO users(name, email) VALUES($1,$2) RETURNING *',
    [name, email]
  )
  await client.query('COMMIT')
  return user
} catch (err) {
  await client.query('ROLLBACK')
  throw err
} finally {
  client.release()  // always release back to pool
}
\`\`\`

**Always use parameterized queries (\`$1, $2\`)** — prevents SQL injection.`,
  },
]

async function signIn(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? "Sign-in failed")
  return { idToken: data.idToken, uid: data.localId }
}

async function dbPut(path, data, idToken) {
  const res = await fetch(`${DB_URL}/${path}.json?auth=${idToken}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DB write failed at ${path}: ${err}`)
  }
}

async function dbPatch(path, data, idToken) {
  const res = await fetch(`${DB_URL}/${path}.json?auth=${idToken}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DB patch failed at ${path}: ${err}`)
  }
}

async function seed(email, password) {
  console.log(`Signing in as ${email}...`)
  const { idToken, uid } = await signIn(email, password)
  console.log(`Signed in, uid: ${uid}`)

  const root = `users/${uid}`

  // Write tags
  const tagsObj = {}
  TAGS.forEach(t => { tagsObj[t.id] = t })
  await dbPatch(`${root}/tags`, tagsObj, idToken)
  console.log(`✓ ${TAGS.length} tags written`)

  // Write notes
  const notesObj = {}
  NOTES.forEach((note, i) => {
    const id = `seed-note-${String(i).padStart(3, "0")}`
    notesObj[id] = {
      title: note.title,
      markdown: note.markdown,
      tagIds: note.tagIds,
      updatedAt: Date.now() - (NOTES.length - i) * 60000,
    }
  })
  await dbPatch(`${root}/notes`, notesObj, idToken)
  console.log(`✓ ${NOTES.length} notes written`)

  console.log("\nDone! Breakdown:")
  const byTag = {}
  NOTES.forEach(n => n.tagIds.forEach(t => { byTag[t] = (byTag[t] ?? 0) + 1 }))
  TAGS.forEach(t => console.log(`  ${t.label}: ${byTag[t.id] ?? 0} pitanja`))
}

// Try both email variants
const emails = ["fullstack@recallstack.com", "fullstack@recalstack.com"]
const password = "fullstack"

let success = false
for (const email of emails) {
  try {
    await seed(email, password)
    success = true
    break
  } catch (err) {
    console.log(`  ${email} → ${err.message}`)
  }
}
if (!success) {
  console.error("Failed with both email variants. Check credentials.")
  process.exit(1)
}
