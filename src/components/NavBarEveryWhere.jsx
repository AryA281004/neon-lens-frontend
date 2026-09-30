import React from 'react'

const NavBarEveryWhere = () => {
  return (
    <motion.nav 
      className='fixed top-0 left-1/2 mt-4 -translate-x-1/2 h-20 w-[90vw] border border-white/20 bg-white/10 backdrop-blur-lg rounded-full  flex items-center  justify-between px-10 z-50 shadow-lg'
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Section */}
      <div className='flex items-center gap-2.5 cursor-pointer'>
        <motion.div 
          className='flex flex-col'
          whileHover={{ scale: 1.05 }}
        >
          <h1 className='logo-p1'>Neon</h1>
          <h1 className='logo-p2'>Lens</h1>
        </motion.div>
      </div>

      </motion.nav>
  )
}

export default NavBarEveryWhere