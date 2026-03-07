import { useEffect, useState } from "react"
import { api } from "../services/api"

export function ReportsPage() {
  const [sales, setSales] = useState([])
  const [workers, setWorkers] = useState([])
  const [machines, setMachines] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingSale, setEditingSale] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [worker, setWorker] = useState("")
  const [machine, setMachine] = useState("")
  const [fuel, setFuel] = useState("")
  const [quantity, setQuantity] = useState("")

  useEffect(() => {
    async function load() {
      setError("")
      setLoading(true)
      try {
        const [salesRes, workersRes, machinesRes, fuelsRes] = await Promise.all([
          api.get("/sales"),
          api.get("/workers"),
          api.get("/machines"),
          api.get("/fuel-types"),
        ])
        setSales(salesRes.items ?? salesRes ?? [])
        setWorkers(workersRes.items ?? [])
        setMachines(machinesRes.items ?? [])
        setFuelTypes(fuelsRes.items ?? [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load sales data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function updateSale() {
    if (!editingSale) return
    setError("")
    if (!worker || !machine || !fuel) {
      setError("Please select worker, machine, and fuel type")
      return
    }
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0")
      return
    }
    setSubmitting(true)
    try {
      await api.put(`/sales/${editingSale._id}`, {
        workerId: worker,
        machineId: machine,
        fuelTypeId: fuel,
        quantityLiters: qty,
      })
      const data = await api.get("/sales")
      setSales(data.items ?? data ?? [])
      setEditingSale(null)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update sale")
    } finally {
      setSubmitting(false)
    }
  }

  function openEditSale(s) {
    setEditingSale(s)
    setWorker(s.worker?._id ?? s.worker ?? "")
    setMachine(s.machine?._id ?? s.machine ?? "")
    setFuel(s.fuelType?._id ?? s.fuelType ?? "")
    setQuantity(String(s.quantityLiters ?? s.quantity ?? ""))
    setError("")
  }

  async function deleteSale(id) {
    if (!confirm("Delete this sale? Fuel stock will be restored.")) return
    setError("")
    try {
      await api.del(`/sales/${id}`)
      const data = await api.get("/sales")
      setSales(data.items ?? data ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete sale")
    }
  }

  function exportCSV() {
    const headers = ["Date", "Worker", "Machine", "Fuel", "Quantity (L)", "Amount (₹)"]
    const rows = sales.map((s) => [
      new Date(s.createdAt).toLocaleDateString(),
      s.worker?.name ?? "",
      s.machine?.name ?? "",
      s.fuelType?.name ?? "",
      s.quantityLiters ?? s.quantity ?? "",
      s.amount ?? "",
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sales-report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500 dark:text-slate-400">Loading…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View sales data and export to CSV
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-200">
            Sales report
          </h2>
          <button
            type="button"
            onClick={exportCSV}
            disabled={sales.length === 0}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Worker</th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Machine</th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Fuel</th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Quantity</th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No sales data to show.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{s.worker?.name ?? "—"}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{s.machine?.name ?? "—"}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{s.fuelType?.name ?? "—"}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {s.quantityLiters ?? s.quantity ?? "—"}
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">₹ {s.amount ?? 0}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openEditSale(s)}
                        className="mr-2 rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSale(s._id)}
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800/50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Edit report entry</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Worker</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={worker}
                  onChange={(e) => setWorker(e.target.value)}
                >
                  <option value="">Select worker</option>
                  {workers.filter((w) => w.isActive !== false).map((w) => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Machine</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                >
                  <option value="">Select machine</option>
                  {machines.filter((m) => m.isActive !== false).map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Fuel type</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                >
                  <option value="">Select fuel</option>
                  {fuelTypes.filter((f) => f.isActive !== false).map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Quantity (L)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {error}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEditingSale(null); setError(""); }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateSale}
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
