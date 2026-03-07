import { useCallback, useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/auth"
import { getSocket } from "../services/socket"
import { useToast } from "../context/toast.jsx"

export function LiveTrackingPage(){

  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [workers, setWorkers] = useState([])
  const [machines, setMachines] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [activities, setActivities] = useState([])
  const [worker, setWorker] = useState("")
  const [machine, setMachine] = useState("")
  const [fuel, setFuel] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [w, m, f, a] = await Promise.all([
        api.get("/workers"),
        api.get("/machines"),
        api.get("/fuel-types"),
        api.get("/activities/active"),
      ])
      setWorkers(w.items || [])
      setMachines(m.items || [])
      setFuelTypes(f.items || [])
      setActivities(a.items || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load data")
    }
  }, [toast])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    loadData().finally(() => { if (!cancelled) setLoading(false) })
    const s = getSocket()
    if (s) {
      s.on("activity:started", loadData)
      s.on("activity:stopped", loadData)
      return () => {
        cancelled = true
        s.off("activity:started", loadData)
        s.off("activity:stopped", loadData)
      }
    }
    return () => { cancelled = true }
  }, [token, loadData])

  async function startActivity() {
    if (!worker || !machine || !fuel) {
      toast.error("Select worker, machine and fuel")
      return
    }
    setSubmitting(true)
    try {
      await api.post("/activities/start", { workerId: worker, machineId: machine, fuelTypeId: fuel })
      await loadData()
      toast.success("Activity started")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start activity")
    } finally {
      setSubmitting(false)
    }
  }

  async function stopActivity(id) {
    setSubmitting(true)
    try {
      await api.post(`/activities/${id}/stop`)
      await loadData()
      toast.success("Activity stopped")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to stop activity")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border p-4">

        <div className="text-lg font-semibold">
          Live Worker Tracking
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">

          <select
            className="w-full rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={worker}
            onChange={(e)=>setWorker(e.target.value)}
          >

            <option value="">Select Worker</option>

            {workers.map(w=>(
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}

          </select>

          <select
            className="w-full rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={machine}
            onChange={(e)=>setMachine(e.target.value)}
          >

            <option value="">Select Machine</option>

            {machines.map(m=>(
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}

          </select>

          <select
            className="w-full rounded-xl rounded p-2 border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={fuel}
            onChange={(e)=>setFuel(e.target.value)}
          >

            <option value="">Select Fuel</option>

            {fuelTypes.map(f=>(
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}

          </select>

        </div>

        <button
          onClick={startActivity}
          disabled={submitting}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
        >
          {submitting ? "Starting…" : "Start Activity"}
        </button>

      </div>

      <div className="rounded-2xl border p-4">

        <div className="text-lg font-semibold">
          Active Activities
        </div>

        <div className="mt-4 space-y-2">
          {activities.length === 0 ? (
            <p className="py-4 text-center text-slate-500 dark:text-slate-400">No active activities.</p>
          ) : (
          activities.map(a=>(
            <div
              key={a._id}
              className="flex justify-between border p-3 rounded dark:bg-slate-900/80"
            >

              <div>

                <div className="font-medium">
                  {a.worker?.name}
                </div>

                <div className="text-sm text-gray-500 ">
                  {a.machine?.name} • {a.fuelType?.name}
                </div>

              </div>

              <button
                onClick={()=>stopActivity(a._id)}
                disabled={submitting}
                className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-60"
              >
                Stop
              </button>

            </div>
          )))}

        </div>

      </div>

    </div>
  )
}