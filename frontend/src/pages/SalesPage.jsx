import { useEffect, useState } from "react"
import { api } from "../services/api"

export function SalesPage() {

  const [workers, setWorkers] = useState([])
  const [machines, setMachines] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [sales, setSales] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingSale, setEditingSale] = useState(null)

  const [worker, setWorker] = useState("")
  const [machine, setMachine] = useState("")
  const [fuel, setFuel] = useState("")
  const [quantity, setQuantity] = useState("")

  useEffect(() => {

    async function load(){

      setError("")
      setLoading(true)

      try{

        const [workersRes, machinesRes, fuelsRes, salesRes] = await Promise.all([
          api.get("/workers"),
          api.get("/machines"),
          api.get("/fuel-types"),
          api.get("/sales"),
        ])

        setWorkers(workersRes.items ?? [])
        setMachines(machinesRes.items ?? [])
        setFuelTypes(fuelsRes.items ?? [])
        setSales(salesRes.items ?? [])

      }catch(err){

        setError(err?.response?.data?.message || err?.message || "Failed to load")

      }finally{

        setLoading(false)

      }

    }

    load()

  },[])



  async function addSale(){

    setError("")

    if(!worker || !machine || !fuel){
      setError("Please select worker, machine, and fuel type")
      return
    }

    const qty = Number(quantity)

    if(!qty || qty <= 0){
      setError("Quantity must be greater than 0")
      return
    }

    setSubmitting(true)

    try{

      await api.post("/sales",{
        workerId: worker,
        machineId: machine,
        fuelTypeId: fuel,
        quantityLiters: qty,
      })

      const salesRes = await api.get("/sales")

      setSales(salesRes.items ?? [])

      setQuantity("")

    }catch(err){

      setError(err?.response?.data?.message || err?.message || "Failed to record sale")

    }finally{

      setSubmitting(false)

    }

  }



  async function updateSale(){

    if(!editingSale) return

    setError("")

    if(!worker || !machine || !fuel){
      setError("Please select worker, machine, and fuel type")
      return
    }

    const qty = Number(quantity)

    if(!qty || qty <= 0){
      setError("Quantity must be greater than 0")
      return
    }

    setSubmitting(true)

    try{

      await api.put(`/sales/${editingSale._id}`,{
        workerId: worker,
        machineId: machine,
        fuelTypeId: fuel,
        quantityLiters: qty,
      })

      const salesRes = await api.get("/sales")

      setSales(salesRes.items ?? [])

      setEditingSale(null)

      setWorker("")
      setMachine("")
      setFuel("")
      setQuantity("")

    }catch(err){

      setError(err?.response?.data?.message || err?.message || "Failed to update sale")

    }finally{

      setSubmitting(false)

    }

  }



  function openEditSale(s){

    setEditingSale(s)

    setWorker(s.worker?._id ?? s.worker ?? "")
    setMachine(s.machine?._id ?? s.machine ?? "")
    setFuel(s.fuelType?._id ?? s.fuelType ?? "")
    setQuantity(String(s.quantityLiters ?? s.quantity ?? ""))

    setError("")

  }



  async function deleteSale(id){

    if(!confirm("Delete this sale? Fuel stock will be restored.")) return

    setError("")

    try{

      await api.del(`/sales/${id}`)

      const salesRes = await api.get("/sales")

      setSales(salesRes.items ?? [])

    }catch(err){

      setError(err?.response?.data?.message || err?.message || "Failed to delete sale")

    }

  }



  if(loading){

    return(
      <div className="flex items-center justify-center py-10">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading…
        </div>
      </div>
    )

  }



  return(

    <div className="space-y-5">

      {/* HEADER */}

      <div>

        <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
          Sales
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Record sales and view history
        </p>

      </div>



      {/* RECORD SALE */}

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">

        <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
          Record sale
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={worker}
            onChange={(e)=>setWorker(e.target.value)}
          >
            <option value="">Worker</option>
            {workers.filter(w=>w.isActive !== false).map(w=>(
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={machine}
            onChange={(e)=>setMachine(e.target.value)}
          >
            <option value="">Machine</option>
            {machines.filter(m=>m.isActive !== false).map(m=>(
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={fuel}
            onChange={(e)=>setFuel(e.target.value)}
          >
            <option value="">Fuel</option>
            {fuelTypes.filter(f=>f.isActive !== false).map(f=>(
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>

          <input
            type="number"
            min="0.01"
            step="0.01"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            placeholder="Liters"
            value={quantity}
            onChange={(e)=>setQuantity(e.target.value)}
          />

        </div>


        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}


        <button
          onClick={addSale}
          disabled={submitting}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-xs sm:text-sm text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? "Recording…" : "Record sale"}
        </button>

      </section>



      {/* SALES TABLE */}

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">

        <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
          Sales history
        </h2>

        <div className="mt-4 overflow-x-auto">

          <table className="w-full min-w-[640px] text-xs sm:text-sm">

            <thead>

              <tr className="border-b border-slate-200 dark:border-slate-700">

                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Worker</th>
                <th className="p-2 text-left">Machine</th>
                <th className="p-2 text-left">Fuel</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Actions</th>

              </tr>

            </thead>

            <tbody>

              {sales.length === 0 ? (

                <tr>
                  <td colSpan={7} className="p-5 text-center text-slate-500 dark:text-slate-400">
                    No sales yet
                  </td>
                </tr>

              ) : (

                sales.map(s=>(
                  <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800">

                    <td className="p-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">{s.worker?.name ?? "—"}</td>
                    <td className="p-2">{s.machine?.name ?? "—"}</td>
                    <td className="p-2">{s.fuelType?.name ?? "—"}</td>
                    <td className="p-2">{(s.quantityLiters ?? s.quantity ?? 0)} L</td>
                    <td className="p-2 font-medium">₹ {s.amount ?? 0}</td>

                    <td className="p-2">

                      <button
                        onClick={()=>openEditSale(s)}
                        className="mr-2 rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={()=>deleteSale(s._id)}
                        className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
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

    </div>

  )

}