import { useEffect, useState, useRef } from "react"
import { api } from "../services/api"
import { useToast } from "../context/toast.jsx"

export function WorkersPage(){

  const { toast } = useToast()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [editingWorker, setEditingWorker] = useState(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)
  const modalRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function loadWorkers() {
      setLoading(true)
      try {
        const data = await api.get("/workers")
        if (!cancelled) setWorkers(data.items || data)
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message || "Failed to load workers")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadWorkers()
    return () => { cancelled = true }
  }, [toast])

  async function addWorker() {
    if (!name?.trim()) { toast.error("Name is required"); return }
    if (!phone?.trim()) { toast.error("Phone is required"); return }
    if (!password) { toast.error("Password is required"); return }
    setSubmitting(true)
    try {
      await api.post("/workers", { name: name.trim(), phone: phone.trim(), password })
      const data = await api.get("/workers")
      setWorkers(data.items || data)
      setName(""); setPhone(""); setPassword("")
      toast.success("Worker added")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add worker")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteWorker(id) {
    if (!confirm("Delete this worker?")) return
    try {
      await api.del(`/workers/${id}`)
      const data = await api.get("/workers")
      setWorkers(data.items || data)
      toast.success("Worker deleted")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete worker")
    }
  }

  function openEditWorker(w) {
    setEditingWorker(w)
    setEditName(w.name ?? "")
    setEditPhone(w.phone ?? "")
    setEditPassword("")
    setEditIsActive(w.isActive !== false)
  }

  async function updateWorker() {
    if (!editingWorker) return
    if (!editName?.trim()) { toast.error("Name is required"); return }
    if (!editPhone?.trim()) { toast.error("Phone is required"); return }
    setSubmitting(true)
    try {
      const body = { name: editName.trim(), phone: editPhone.trim(), isActive: editIsActive }
      if (editPassword) body.password = editPassword
      await api.put(`/workers/${editingWorker._id}`, body)
      const data = await api.get("/workers")
      setWorkers(data.items || data)
      setEditingWorker(null)
      toast.success("Worker updated")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update worker")
    } finally {
      setSubmitting(false)
    }
  }

  return (

    <div className="space-y-6">

      <div className="rounded-2xl border bg-white/90 p-4 dark:bg-slate-950/80">

        <div className="text-lg font-semibold tracking-tight">
          Workers
        </div>

        {/* ADD WORKER */}

        <div className="mt-4 flex gap-2 flex-wrap">

          <input
            className="rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Worker Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            className="rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Phone"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <input
            className="rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            onClick={addWorker}
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Worker"}
          </button>

        </div>

        {/* WORKER LIST */}

        <div className="mt-6 space-y-2">
          {loading ? (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">Loading…</p>
          ) : workers.length === 0 ? (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">No workers yet. Add one above.</p>
          ) : (
          workers.map(worker=>(
            <div
              key={worker._id}
              className="flex justify-between border p-3 rounded"
            >

              <div>

                <div className="font-medium">
                  {worker.name}
                </div>

                <div className="text-sm text-gray-500">
                  {worker.phone}
                </div>

              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditWorker(worker)}
                  className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteWorker(worker._id)}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800/50"
                >
                  Delete
                </button>
              </div>

            </div>
          )))}

        </div>

      </div>

      {editingWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-worker-title"
          onKeyDown={(e) => e.key === "Escape" && setEditingWorker(null)}
        >
          <div ref={modalRef} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 id="edit-worker-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">Edit worker</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Worker name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">New password (leave blank to keep)</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Optional"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} />
                <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateWorker}
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