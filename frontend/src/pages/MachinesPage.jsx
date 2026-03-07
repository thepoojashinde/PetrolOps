import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useToast } from "../context/toast.jsx"

export function MachinesPage(){

  const { toast } = useToast()
  const [machines, setMachines] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [selectedFuels, setSelectedFuels] = useState([])
  const [editingMachine, setEditingMachine] = useState(null)
  const [editName, setEditName] = useState("")
  const [editSelectedFuels, setEditSelectedFuels] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [machinesRes, fuelsRes] = await Promise.all([
          api.get("/machines"),
          api.get("/fuel-types"),
        ])
        if (!cancelled) {
          setMachines(machinesRes.items || machinesRes)
          setFuelTypes(fuelsRes.items || fuelsRes)
        }
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message || "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [toast])

  function toggleFuel(id){

    if(selectedFuels.includes(id)){
      setSelectedFuels(selectedFuels.filter(f=>f !== id))
    }else{
      setSelectedFuels([...selectedFuels,id])
    }

  }

  async function addMachine() {
    if (!name?.trim()) { toast.error("Machine name required"); return }
    if (selectedFuels.length === 0) { toast.error("Select at least one fuel type"); return }
    setSubmitting(true)
    try {
      await api.post("/machines", { name: name.trim(), supportedFuelTypes: selectedFuels })
      const res = await api.get("/machines")
      setMachines(res.items || res)
      setName(""); setSelectedFuels([])
      toast.success("Machine added")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add machine")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteMachine(id) {
    if (!confirm("Delete this machine?")) return
    try {
      await api.del(`/machines/${id}`)
      const res = await api.get("/machines")
      setMachines(res.items || res)
      toast.success("Machine deleted")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete machine")
    }
  }

  function openEditMachine(m) {
    setEditingMachine(m)
    const ids = (m.supportedFuelTypes || []).map(f => f._id || f)
    setEditName(m.name ?? "")
    setEditSelectedFuels(ids)
  }

  function toggleEditFuel(id) {
    setEditSelectedFuels(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  async function updateMachine() {
    if (!editingMachine) return
    if (!editName?.trim()) { toast.error("Machine name is required"); return }
    if (editSelectedFuels.length === 0) { toast.error("Select at least one fuel type"); return }
    setSubmitting(true)
    try {
      await api.put(`/machines/${editingMachine._id}`, {
        name: editName.trim(),
        supportedFuelTypes: editSelectedFuels,
      })
      const res = await api.get("/machines")
      setMachines(res.items || res)
      setEditingMachine(null)
      toast.success("Machine updated")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update machine")
    } finally {
      setSubmitting(false)
    }
  }

  return (

    <div className="space-y-6">

      <div className="rounded-2xl border bg-white/90 p-4 dark:bg-slate-950/80">

        <div className="text-lg font-semibold tracking-tight">
          Machines
        </div>

        {/* CREATE MACHINE */}

        <div className="mt-4 space-y-3">

          <input
            className="w-full rounded-xl p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Machine Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <div className="flex gap-3 flex-wrap">

            {fuelTypes.map(fuel=>(
              <label key={fuel._id} className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={selectedFuels.includes(fuel._id)}
                  onChange={()=>toggleFuel(fuel._id)}
                />

                {fuel.name}

              </label>
            ))}

          </div>

          <button
            onClick={addMachine}
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Machine"}
          </button>

        </div>

        {/* MACHINE LIST */}

        <div className="mt-6 space-y-2">
          {loading ? (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">Loading…</p>
          ) : machines.length === 0 ? (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">No machines yet. Add one above.</p>
          ) : (
          machines.map(machine=>(
            <div
              key={machine._id}
              className="flex justify-between border p-3 rounded"
            >

              <div>

                <div className="font-medium">
                  {machine.name}
                </div>

                <div className="text-sm text-gray-500">

                  {machine.supportedFuelTypes?.map(f=>f.name).join(", ")}

                </div>

              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditMachine(machine)}
                  className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMachine(machine._id)}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800/50"
                >
                  Delete
                </button>
              </div>

            </div>
          )))}

        </div>

      </div>

      {editingMachine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-machine-title"
          onKeyDown={(e) => e.key === "Escape" && setEditingMachine(null)}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 id="edit-machine-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">Edit machine</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">Machine name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Machine name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Supported fuel types</label>
                <div className="flex flex-wrap gap-3">
                  {fuelTypes.map(fuel => (
                    <label key={fuel._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editSelectedFuels.includes(fuel._id)}
                        onChange={() => toggleEditFuel(fuel._id)}
                      />
                      {fuel.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMachine(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateMachine}
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