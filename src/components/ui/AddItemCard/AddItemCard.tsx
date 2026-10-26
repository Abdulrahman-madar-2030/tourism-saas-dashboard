import React from 'react'
import { IoAdd } from 'react-icons/io5'

export default function AddItemCard({ setShowCreateModal, label = "اضافة عنصر جديد" }: { setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>, label?: string }) {
  return (
    <button
      onClick={() => setShowCreateModal(true)}
      className="group relative flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

      <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
        <IoAdd className="text-xl" />
      </div>

      <span className="font-semibold tracking-wide relative z-10">{label}</span>
    </button>
  )
}
