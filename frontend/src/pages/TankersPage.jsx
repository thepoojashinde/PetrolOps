import { useEffect, useState } from "react"
import { api } from "../services/api"

export function TankersPage() {
  const [fuelTypes, setFuelTypes] = useState([])
  const [tankers, setTankers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [fuelTypeId, setFuelTypeId] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [tankerNumber, setTankerNumber] = useState("")
  const [quantityDeliveredLiters, setQuantityDeliveredLiters] = useState("")
  const [pricePerLiter, setPricePerLiter] = useState("")
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [editingTanker, setEditingTanker] = useState(null)

  useEffect(() => {
    async function load() {
      setError("")
      setLoading(true)
      try {
        const [fuelsRes, tankersRes] = await Promise.all([
          api.get("/fuel-types"),
          api.get("/tankers"),
        ])
        setFuelTypes(fuelsRes.items ?? [])
        setTankers(tankersRes.items ?? [])
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function addTanker() {
    setError("")
    if (!fuelTypeId || !supplierName?.trim() || !tankerNumber?.trim()) {
      setError("Please fill Fuel, Supplier, and Tanker number")
      return
    }
    const qty = Number(quantityDeliveredLiters)
    const price = Number(pricePerLiter)
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0")
      return
    }
    if (price < 0 || isNaN(price)) {
      setError("Price per liter must be a valid number")
      return
    }
    if (!deliveryDate) {
      setError("Delivery date is required")
      return
    }
    setSubmitting(true)
    try {
      await api.post("/tankers", {
        fuelTypeId,
        supplierName: supplierName.trim(),
        tankerNumber: tankerNumber.trim(),
        quantityDeliveredLiters: qty,
        pricePerLiter: price,
        deliveryDate: new Date(deliveryDate).toISOString(),
      })
      const tankersRes = await api.get("/tankers")
      setTankers(tankersRes.items ?? [])
      setFuelTypeId("")
      setSupplierName("")
      setTankerNumber("")
      setQuantityDeliveredLiters("")
      setPricePerLiter("")
      setDeliveryDate(new Date().toISOString().slice(0, 10))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to add delivery")
    } finally {
      setSubmitting(false)
    }
  }

  async function updateTanker() {
    if (!editingTanker) return
    setError("")
    if (!fuelTypeId || !supplierName?.trim() || !tankerNumber?.trim()) {
      setError("Please fill Fuel, Supplier, and Tanker number")
      return
    }
    const qty = Number(quantityDeliveredLiters)
    const price = Number(pricePerLiter)
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0")
      return
    }
    if (price < 0 || isNaN(price)) {
      setError("Price per liter must be a valid number")
      return
    }
    if (!deliveryDate) {
      setError("Delivery date is required")
      return
    }
    setSubmitting(true)
    try {
      await api.put(`/tankers/${editingTanker._id}`, {
        fuelTypeId,
        supplierName: supplierName.trim(),
        tankerNumber: tankerNumber.trim(),
        quantityDeliveredLiters: qty,
        pricePerLiter: price,
        deliveryDate: new Date(deliveryDate).toISOString(),
      })
      const tankersRes = await api.get("/tankers")
      setTankers(tankersRes.items ?? [])
      setEditingTanker(null)
      setFuelTypeId("")
      setSupplierName("")
      setTankerNumber("")
      setQuantityDeliveredLiters("")
      setPricePerLiter("")
      setDeliveryDate(new Date().toISOString().slice(0, 10))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update delivery")
    } finally {
      setSubmitting(false)
    }
  }

  function openEditTanker(t) {
    setEditingTanker(t)
    setFuelTypeId(t.fuelType?._id ?? t.fuelType ?? "")
    setSupplierName(t.supplierName ?? t.supplier ?? "")
    setTankerNumber(t.tankerNumber ?? "")
    setQuantityDeliveredLiters(String(t.quantityDeliveredLiters ?? t.quantity ?? ""))
    setPricePerLiter(String(t.pricePerLiter ?? ""))
    setDeliveryDate(t.deliveryDate ? new Date(t.deliveryDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
    setError("")
  }

  async function deleteTanker(id) {
    if (!confirm("Delete this delivery? Fuel stock will be reduced.")) return
    setError("")
    try {
      await api.del(`/tankers/${id}`)
      const tankersRes = await api.get("/tankers")
      setTankers(tankersRes.items ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete delivery")
    }
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
          Tankers &amp; Deliveries
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Record fuel deliveries and view history
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          Add delivery
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Fuel type
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={fuelTypeId}
              onChange={(e) => setFuelTypeId(e.target.value)}
            >
              <option value="">Select fuel</option>
              {fuelTypes.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Supplier
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Supplier name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Tanker number
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. TN-01"
              value={tankerNumber}
              onChange={(e) => setTankerNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Quantity (L)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Liters"
              value={quantityDeliveredLiters}
              onChange={(e) => setQuantityDeliveredLiters(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Price/L (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="0.00"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Delivery date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={addTanker}
          disabled={submitting}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add delivery"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          Delivery history
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Date
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Fuel
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Quantity
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Supplier
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Tanker #
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tankers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No deliveries yet. Add one above.
                  </td>
                </tr>
              ) : (
                tankers.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {new Date(t.deliveryDate ?? t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {t.fuelType?.name ?? "—"}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {t.quantityDeliveredLiters ?? t.quantity ?? 0} L
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {t.supplierName ?? t.supplier ?? "—"}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {t.tankerNumber ?? "—"}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openEditTanker(t)}
                        className="mr-2 rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTanker(t._id)}
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

      {editingTanker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Edit delivery</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Fuel type</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={fuelTypeId}
                  onChange={(e) => setFuelTypeId(e.target.value)}
                >
                  <option value="">Select fuel</option>
                  {fuelTypes.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Supplier</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Supplier name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Tanker #</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="e.g. TN-01"
                  value={tankerNumber}
                  onChange={(e) => setTankerNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Quantity (L)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={quantityDeliveredLiters}
                  onChange={(e) => setQuantityDeliveredLiters(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Price/L (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Delivery date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
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
                onClick={() => { setEditingTanker(null); setError(""); }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateTanker}
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
