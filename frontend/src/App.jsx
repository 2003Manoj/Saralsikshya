import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar/Navbar"
import Home from "./pages/Home/Home"
import Courses from "./pages/Courses/Courses"
import CourseDetail from "./pages/CourseDetail/CourseDetail"
import Books from "./pages/Books/Books"
import About from "./pages/About/About"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import Footer from "./components/Footer/Footer"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/books" element={<Books />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
