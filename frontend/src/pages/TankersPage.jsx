import { useEffect, useState } from "react"
import { api } from "../services/api"

export function TankersPage() {

  const [fuelTypes,setFuelTypes] = useState([])
  const [tankers,setTankers] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")
  const [submitting,setSubmitting] = useState(false)

  const [fuelTypeId,setFuelTypeId] = useState("")
  const [supplierName,setSupplierName] = useState("")
  const [tankerNumber,setTankerNumber] = useState("")
  const [quantityDeliveredLiters,setQuantityDeliveredLiters] = useState("")
  const [pricePerLiter,setPricePerLiter] = useState("")
  const [deliveryDate,setDeliveryDate] = useState(
    new Date().toISOString().slice(0,10)
  )

  const [editingTanker,setEditingTanker] = useState(null)

  useEffect(()=>{

    async function load(){

      setError("")
      setLoading(true)

      try{

        const [fuelsRes,tankersRes] = await Promise.all([
          api.get("/fuel-types"),
          api.get("/tankers")
        ])

        setFuelTypes(fuelsRes.items ?? [])
        setTankers(tankersRes.items ?? [])

      }catch(err){

        setError(err?.response?.data?.message || err?.message || "Failed to load")

      }finally{

        setLoading(false)

      }

    }

    load()

  },[])


  async function addTanker(){

    setError("")

    if(!fuelTypeId || !supplierName?.trim() || !tankerNumber?.trim()){
      setError("Please fill Fuel, Supplier and Tanker number")
      return
    }

    const qty = Number(quantityDeliveredLiters)
    const price = Number(pricePerLiter)

    if(!qty || qty <= 0){
      setError("Quantity must be greater than 0")
      return
    }

    if(price < 0 || isNaN(price)){
      setError("Invalid price")
      return
    }

    setSubmitting(true)

    try{

      await api.post("/tankers",{
        fuelTypeId,
        supplierName: supplierName.trim(),
        tankerNumber: tankerNumber.trim(),
        quantityDeliveredLiters: qty,
        pricePerLiter: price,
        deliveryDate: new Date(deliveryDate).toISOString()
      })

      const tankersRes = await api.get("/tankers")
      setTankers(tankersRes.items ?? [])

      setFuelTypeId("")
      setSupplierName("")
      setTankerNumber("")
      setQuantityDeliveredLiters("")
      setPricePerLiter("")
      setDeliveryDate(new Date().toISOString().slice(0,10))

    }catch(err){

      setError(err?.response?.data?.message || err?.message || "Failed to add delivery")

    }finally{

      setSubmitting(false)

    }

  }


  async function deleteTanker(id){

    if(!confirm("Delete this delivery?")) return

    try{

      await api.del(`/tankers/${id}`)
      const res = await api.get("/tankers")
      setTankers(res.items ?? [])

    }catch(err){

      setError(err?.response?.data?.message || err?.message)

    }

  }


  if(loading){

    return(
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    )

  }


  return(

    <div className="space-y-6">

      {/* header */}

      <div>

        <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
          Tanker Deliveries
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Manage fuel deliveries
        </p>

      </div>


      {/* add tanker */}

      <div className="rounded-xl border bg-white/90 p-4 dark:bg-slate-950/80">

        <h2 className="text-sm sm:text-base font-semibold">
          Add Delivery
        </h2>


        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">


          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={fuelTypeId}
            onChange={(e)=>setFuelTypeId(e.target.value)}
          >

            <option value="">Fuel</option>

            {fuelTypes.map(f=>(
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}

          </select>


          <input
            placeholder="Supplier"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={supplierName}
            onChange={(e)=>setSupplierName(e.target.value)}
          />


          <input
            placeholder="Tanker #"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={tankerNumber}
            onChange={(e)=>setTankerNumber(e.target.value)}
          />


          <input
            type="number"
            placeholder="Quantity"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={quantityDeliveredLiters}
            onChange={(e)=>setQuantityDeliveredLiters(e.target.value)}
          />


          <input
            type="number"
            placeholder="Price/L"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={pricePerLiter}
            onChange={(e)=>setPricePerLiter(e.target.value)}
          />


          <input
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={deliveryDate}
            onChange={(e)=>setDeliveryDate(e.target.value)}
          />

        </div>


        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}


        <button
          onClick={addTanker}
          disabled={submitting}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add Delivery"}
        </button>

      </div>


      {/* table */}

      <div className="rounded-xl border bg-white/90 p-4 dark:bg-slate-950/80">

        <h2 className="text-sm sm:text-base font-semibold">
          Delivery History
        </h2>

        <div className="mt-4 overflow-x-auto">

          <table className="w-full min-w-[640px] text-sm">

            <thead>

              <tr className="border-b dark:border-slate-700">

                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Fuel</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Supplier</th>
                <th className="p-2 text-left">Tanker</th>
                <th className="p-2 text-left">Actions</th>

              </tr>

            </thead>

            <tbody>

              {tankers.length === 0 ? (

                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No deliveries yet
                  </td>
                </tr>

              ) : (

                tankers.map(t=>(
                  <tr key={t._id} className="border-b dark:border-slate-800">

                    <td className="p-2">
                      {new Date(t.deliveryDate ?? t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-2">
                      {t.fuelType?.name}
                    </td>

                    <td className="p-2">
                      {t.quantityDeliveredLiters} L
                    </td>

                    <td className="p-2">
                      {t.supplierName}
                    </td>

                    <td className="p-2">
                      {t.tankerNumber}
                    </td>

                    <td className="p-2 flex gap-2">

                      <button
                        onClick={()=>openEditTanker(t)}
                        className="rounded bg-indigo-100 px-2 py-1 text-xs dark:bg-indigo-900"
                      >
                        Edit
                      </button>

                      <button
                        onClick={()=>deleteTanker(t._id)}
                        className="rounded bg-red-100 px-2 py-1 text-xs dark:bg-red-900"
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

      </div>

    </div>

  )

}