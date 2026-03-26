import React from 'react'

const date = new Date()

const footer = () => {
  return (
    <footer className="bg-white border-t border-[rgba(15,23,42,0.04)]">
        <div className="max-w-300 mx-auto px-4 py-8">
            <p className="text-[#64748b] text-sm text-center">© {date.getFullYear()} PlayZone. All rights reserved.</p>
        </div>
    </footer>
  )
}

export default footer