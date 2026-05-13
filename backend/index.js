import express from "express"
import pg from "pg"
const { Pool, Client } = pg

const app = express()
const port = 3000

const pool = new Pool(
  "postgresql://postgres:postgres@localhost:5432/recallstack",
)
const res = await pool.query("SELECT NOW()")
await pool.end()

const res = await client.query("SELECT NOW()")
await client.end()
const timeLog = (req, res, next) => {
  console.log("time: ", Date.now())
  next()
}
app.use(express.json())
app.use(timeLog)
app.get("/", (req, res) => {
  res.json({ status: 200, message: "OK" })
})
app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() })
})
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
