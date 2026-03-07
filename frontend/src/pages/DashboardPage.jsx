import { useEffect, useState, useCallback } from "react"
import { api } from "../services/api"
import { getSocket } from "../services/socket"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export function DashboardPage() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalRevenue: 0,
    activeWorkers: 0,
    activeMachines: 0,
    dailyTrend: [],
    monthlyRevenue: [],
    inventory: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStats = useCallback(async () => {
    try {
      const data = await api.get("/dashboard/stats")
      setStats({
        todaySales: data.todaySales ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
        activeWorkers: data.activeWorkers ?? 0,
        activeMachines: data.activeMachines ?? 0,
        dailyTrend: data.dailyTrend ?? [],
        monthlyRevenue: data.monthlyRevenue ?? [],
        inventory: data.inventory ?? [],
      })
      setError("")
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onSale = () => loadStats()
    const onTanker = () => loadStats()
    socket.on("sale:created", onSale)
    socket.on("tanker:created", onTanker)
    return () => {
      socket.off("sale:created", onSale)
      socket.off("tanker:created", onTanker)
    }
  }, [loadStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500 dark:text-slate-400">Loading dashboard…</div>
      </div>
    )
  }

  const cards = [
    { title: "Today’s sales (₹)", value: Number(stats.todaySales).toLocaleString("en-IN"), accent: "indigo" },
    { title: "Total revenue (₹)", value: Number(stats.totalRevenue).toLocaleString("en-IN"), accent: "emerald" },
    { title: "Active workers", value: stats.activeWorkers, accent: "amber" },
    { title: "Active machines", value: stats.activeMachines, accent: "sky" },
  ]

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const chartData = (stats.dailyTrend || []).map((d) => ({ date: d.date, total: d.total, count: d.count }))
  const monthlyData = (stats.monthlyRevenue || [])
    .map((m) => ({ name: `${monthNames[m.month]} ${m.year}`, total: m.total }))
    .reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Live analytics and operational overview
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50"
          >
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {card.title}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Daily sales (last 7 days)
          </h2>
          <div className="mt-4 h-56">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-slate-600 dark:text-slate-400" />
                  <YAxis tick={{ fontSize: 11 }} className="text-slate-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--tw-border-color)",
                    }}
                    formatter={(value) => [`₹ ${Number(value).toLocaleString("en-IN")}`, "Sales"]}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sales (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Monthly revenue
          </h2>
          <div className="mt-4 h-56">
            {monthlyData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-slate-600 dark:text-slate-400" />
                  <YAxis tick={{ fontSize: 11 }} className="text-slate-600 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--tw-border-color)",
                    }}
                    formatter={(value) => [`₹ ${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Inventory overview
        </h2>
        <div className="mt-4">
          {!stats.inventory || stats.inventory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Add fuel types in Fuel Types to see stock levels here.
            </div>
          ) : (
            <ul className="space-y-3">
              {stats.inventory.map((item) => (
                <li
                  key={item.name}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    item.isLow
                      ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {item.currentStockLiters.toLocaleString()} L
                    {item.lowStockThreshold > 0 && (
                      <span className="ml-2 text-slate-400 dark:text-slate-500">
                        (low alert: {item.lowStockThreshold} L)
                      </span>
                    )}
                  </span>
                  {item.isLow && (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                      Low stock
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
