import { useState } from 'react'
import './App.css'
import Wordle from './pages/Wordle'
import Home from './Home'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wordle" element={<Wordle />}/>
    </Routes>
  )
}

export default App
