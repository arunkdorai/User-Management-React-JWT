import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from "react-router-dom";
import Home from './Users/Home/Home.jsx';
import Login from './Users/Login/Login.jsx';
import Signup from './Users/Signup/Signup.jsx';
import Admlogin from './Admin/Login/Login.jsx'
import Admhome from './Admin/Home/Admhome.jsx';
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
    <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
<Route path='/admin' element={<Admlogin/>}   />
<Route path='/home' element={<Admhome/>}   />
      </Routes>
     
    </div>
  )
}

export default App
