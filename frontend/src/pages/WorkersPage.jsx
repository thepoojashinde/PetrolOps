import { useEffect, useState, useRef } from "react"
import { api } from "../services/api"
import { useToast } from "../context/toast.jsx"

export function WorkersPage(){

  const { toast } = useToast()

  const [workers,setWorkers] = useState([])
  const [loading,setLoading] = useState(true)
  const [submitting,setSubmitting] = useState(false)

  const [name,setName] = useState("")
  const [phone,setPhone] = useState("")
  const [password,setPassword] = useState("")

  const [editingWorker,setEditingWorker] = useState(null)
  const [editName,setEditName] = useState("")
  const [editPhone,setEditPhone] = useState("")
  const [editPassword,setEditPassword] = useState("")
  const [editIsActive,setEditIsActive] = useState(true)

  const modalRef = useRef(null)


  useEffect(()=>{

    let cancelled=false

    async function loadWorkers(){

      setLoading(true)

      try{

        const data = await api.get("/workers")

        if(!cancelled) setWorkers(data.items || data)

      }catch(err){

        if(!cancelled)
          toast.error(err?.response?.data?.message || "Failed to load workers")

      }finally{

        if(!cancelled) setLoading(false)

      }

    }

    loadWorkers()

    return()=>{ cancelled=true }

  },[toast])


  async function addWorker(){

    if(!name?.trim()){
      toast.error("Name required")
      return
    }

    if(!phone?.trim()){
      toast.error("Phone required")
      return
    }

    if(!password){
      toast.error("Password required")
      return
    }

    setSubmitting(true)

    try{

      await api.post("/workers",{
        name:name.trim(),
        phone:phone.trim(),
        password
      })

      const data = await api.get("/workers")
      setWorkers(data.items || data)

      setName("")
      setPhone("")
      setPassword("")

      toast.success("Worker added")

    }catch(err){

      toast.error(err?.response?.data?.message || "Failed to add worker")

    }finally{

      setSubmitting(false)

    }

  }


  async function deleteWorker(id){

    if(!confirm("Delete this worker?")) return

    try{

      await api.del(`/workers/${id}`)

      const data = await api.get("/workers")
      setWorkers(data.items || data)

      toast.success("Worker deleted")

    }catch(err){

      toast.error(err?.response?.data?.message || "Failed to delete worker")

    }

  }


  function openEditWorker(w){

    setEditingWorker(w)
    setEditName(w.name ?? "")
    setEditPhone(w.phone ?? "")
    setEditPassword("")
    setEditIsActive(w.isActive !== false)

  }


  async function updateWorker(){

    if(!editingWorker) return

    if(!editName?.trim()){
      toast.error("Name required")
      return
    }

    if(!editPhone?.trim()){
      toast.error("Phone required")
      return
    }

    setSubmitting(true)

    try{

      const body = {
        name:editName.trim(),
        phone:editPhone.trim(),
        isActive:editIsActive
      }

      if(editPassword) body.password = editPassword

      await api.put(`/workers/${editingWorker._id}`,body)

      const data = await api.get("/workers")
      setWorkers(data.items || data)

      setEditingWorker(null)

      toast.success("Worker updated")

    }catch(err){

      toast.error(err?.response?.data?.message || "Failed to update worker")

    }finally{

      setSubmitting(false)

    }

  }



  return(

    <div className="space-y-6">

      <div className="rounded-xl border bg-white/90 p-4 dark:bg-slate-950/80">

        <div className="text-base sm:text-lg font-semibold">
          Workers
        </div>


        {/* ADD WORKER */}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Worker Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Phone"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <input
            type="password"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            onClick={addWorker}
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Worker"}
          </button>

        </div>



        {/* WORKER LIST */}

        <div className="mt-6 space-y-2">

          {loading ? (

            <p className="py-6 text-center text-slate-500">
              Loading…
            </p>

          ) : workers.length === 0 ? (

            <p className="py-6 text-center text-slate-500">
              No workers yet
            </p>

          ) : (

            workers.map(worker=>(

              <div
                key={worker._id}
                className="flex items-center justify-between rounded-lg border p-3 dark:border-slate-700"
              >

                <div>

                  <div className="font-medium">
                    {worker.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {worker.phone}
                  </div>

                </div>


                <div className="flex gap-2">

                  <button
                    onClick={()=>openEditWorker(worker)}
                    className="rounded bg-indigo-100 px-2 py-1 text-xs dark:bg-indigo-900"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>deleteWorker(worker._id)}
                    className="rounded bg-red-100 px-2 py-1 text-xs dark:bg-red-900"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>



      {/* EDIT MODAL */}

      {editingWorker && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            ref={modalRef}
            className="w-full max-w-sm rounded-xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >

            <h3 className="text-base font-semibold">
              Edit Worker
            </h3>


            <div className="mt-4 space-y-3">

              <input
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                placeholder="Name"
                value={editName}
                onChange={(e)=>setEditName(e.target.value)}
              />

              <input
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                placeholder="Phone"
                value={editPhone}
                onChange={(e)=>setEditPhone(e.target.value)}
              />

              <input
                type="password"
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                placeholder="New password (optional)"
                value={editPassword}
                onChange={(e)=>setEditPassword(e.target.value)}
              />

              <label className="flex items-center gap-2 text-sm">

                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e)=>setEditIsActive(e.target.checked)}
                />

                Active

              </label>

            </div>


            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={()=>setEditingWorker(null)}
                className="rounded-lg border px-3 py-2 text-sm dark:border-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={updateWorker}
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-60"
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