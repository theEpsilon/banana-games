import './App.css'
import Wordle from './pages/Wordle'
import Home from './pages/Home'
import { Route, Routes } from "react-router"

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wordle" element={<Wordle />}/>
    </Routes>
  )
}

export default App
