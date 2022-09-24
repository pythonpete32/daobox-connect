import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Navbar } from './Navbar'

const Layout = ({ children }) => {
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />
      {children}
    </>
  )
}

export default Layout
