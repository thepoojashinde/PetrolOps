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


  useEffect(()=>{

    async function load(){

      setError("")
      setLoading(true)

      try{

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

      }catch(err){
        setError(err?.response?.data?.message || err?.message || "Failed to load sales data")
      }finally{
        setLoading(false)
      }

    }

    load()

  },[])


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
        quantityLiters: qty
      })

      const data = await api.get("/sales")

      setSales(data.items ?? data ?? [])

      setEditingSale(null)

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

      const data = await api.get("/sales")

      setSales(data.items ?? data ?? [])

    }catch(err){

      setError(err?.response?.data?.message || err?.message || "Failed to delete sale")

    }

  }


  function exportCSV(){

    const headers = ["Date","Worker","Machine","Fuel","Quantity (L)","Amount (₹)"]

    const rows = sales.map(s=>[
      new Date(s.createdAt).toLocaleDateString(),
      s.worker?.name ?? "",
      s.machine?.name ?? "",
      s.fuelType?.name ?? "",
      s.quantityLiters ?? s.quantity ?? "",
      s.amount ?? ""
    ])

    const csv = [headers,...rows].map(r=>r.join(",")).join("\n")

    const blob = new Blob([csv],{ type:"text/csv" })

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    a.href = url
    a.download = "sales-report.csv"

    a.click()

    URL.revokeObjectURL(url)

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
          Reports
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          View sales data and export CSV
        </p>

      </div>



      {/* TABLE CARD */}

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
            Sales report
          </h2>

          <button
            onClick={exportCSV}
            disabled={sales.length === 0}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs sm:text-sm text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            Export CSV
          </button>

        </div>


        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}


        {/* TABLE */}

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
                    No sales data
                  </td>

                </tr>

              ) : (

                sales.map(s=>(
                  <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800">

                    <td className="p-2">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-2">
                      {s.worker?.name ?? "—"}
                    </td>

                    <td className="p-2">
                      {s.machine?.name ?? "—"}
                    </td>

                    <td className="p-2">
                      {s.fuelType?.name ?? "—"}
                    </td>

                    <td className="p-2">
                      {s.quantityLiters ?? s.quantity ?? "—"}
                    </td>

                    <td className="p-2 font-medium">
                      ₹ {s.amount ?? 0}
                    </td>

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