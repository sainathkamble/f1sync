import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage.tsx";
import { Login } from "./pages/Login.tsx";
import { Register } from "./pages/Register.tsx";
import { Home } from "./pages/Home.tsx";
import { Profile } from "./pages/Profile.tsx";
import { Drivers } from "./pages/Drivers.tsx";
import { Constructors } from "./pages/Constructors.tsx";
import { Schedule } from "./pages/Schedule.tsx";
import { Stream } from "./pages/Stream.tsx";
import { Championship } from "./pages/Championship.tsx";

function App() {

  return (
    <main className="w-screen h-dvh">
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/home' element={<Home />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/drivers' element={<Drivers />}/>
        <Route path='/constructors' element={<Constructors />}/>
        <Route path='/championship' element={<Championship />}/>
        <Route path='/schedule' element={<Schedule />}/>
        <Route path='/stream' element={<Stream />}/>
      </Routes>
    </main>
  )
}

export default App
