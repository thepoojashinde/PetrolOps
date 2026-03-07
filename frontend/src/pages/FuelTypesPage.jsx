import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useToast } from "../context/toast.jsx"

export function FuelTypesPage() {

  const { toast } = useToast()
  const [fuelTypes, setFuelTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [editingFuel, setEditingFuel] = useState(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editLowStock, setEditLowStock] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetchFuelTypes() {
      setLoading(true)
      try {
        const data = await api.get("/fuel-types")
        if (!cancelled) setFuelTypes(data.items || data)
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message || "Failed to load fuel types")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFuelTypes()
    return () => { cancelled = true }
  }, [toast])

  async function addFuel() {
    if (!name?.trim()) { toast.error("Fuel name is required"); return }
    const p = Number(price)
    if (isNaN(p) || p < 0) { toast.error("Valid price per liter is required"); return }
    setSubmitting(true)
    try {
      await api.post("/fuel-types", { name: name.trim(), pricePerLiter: p })
      const data = await api.get("/fuel-types")
      setFuelTypes(data.items || data)
      setName(""); setPrice("")
      toast.success("Fuel type added")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add fuel type")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteFuel(id) {
    if (!confirm("Delete this fuel type?")) return
    try {
      await api.del(`/fuel-types/${id}`)
      const data = await api.get("/fuel-types")
      setFuelTypes(data.items || data)
      toast.success("Fuel type deleted")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete fuel type")
    }
  }

  function openEditFuel(f) {
    setEditingFuel(f)
    setEditName(f.name ?? "")
    setEditPrice(String(f.pricePerLiter ?? ""))
    setEditLowStock(String(f.lowStockThreshold ?? 0))
  }

  async function updateFuel() {
    if (!editingFuel) return
    if (!editName?.trim()) { toast.error("Fuel name is required"); return }
    const p = Number(editPrice)
    if (isNaN(p) || p < 0) { toast.error("Valid price is required"); return }
    setSubmitting(true)
    try {
      await api.put(`/fuel-types/${editingFuel._id}`, {
        name: editName.trim(),
        pricePerLiter: p,
        lowStockThreshold: Number(editLowStock) || 0,
      })
      const data = await api.get("/fuel-types")
      setFuelTypes(data.items || data)
      setEditingFuel(null)
      toast.success("Fuel type updated")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update fuel type")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border bg-white/90 p-4 dark:bg-slate-950/80">

        <div className="text-lg font-semibold tracking-tight ">
          Fuel Types
        </div>

        <div className="mt-4 flex gap-2">

          <input
            className="rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Fuel Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            className="rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Price / Liter"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
          />

          <button
            onClick={addFuel}
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add"}
          </button>

        </div>

        <div className="mt-6 space-y-2">
          {loading ? (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">Loading…</p>
          ) : fuelTypes.length === 0 ? (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">No fuel types yet. Add one above.</p>
          ) : (
          fuelTypes.map((fuel)=>(
            <div
              key={fuel._id}
              className="flex justify-between border p-3 rounded"
            >

              <div>
                <div className="font-medium">{fuel.name}</div>
                <div className="text-sm text-gray-500">
                  ₹ {fuel.pricePerLiter} / L
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditFuel(fuel)}
                  className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteFuel(fuel._id)}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800/50"
                >
                  Delete
                </button>
              </div>

            </div>
          )))}

        </div>

      </div>

      {editingFuel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-fuel-title"
          onKeyDown={(e) => e.key === "Escape" && setEditingFuel(null)}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 id="edit-fuel-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">Edit fuel type</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Fuel name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Price per liter (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="0.00"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Low stock threshold (L)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={editLowStock}
                  onChange={(e) => setEditLowStock(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingFuel(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateFuel}
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