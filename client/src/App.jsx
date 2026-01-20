import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Navbar,Welcome,Services,Transactions,Footer} from "./components";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className = "min-h-screen">
        <div className = "gradient-bg-welcome">
          <Navbar />
          <Welcome />
        </div>
        <Services  />
        <Transactions />
        <Footer />
      </div>
    </>
  )
}

export default App
