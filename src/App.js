import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <CustomCursor />
      <AnimatedBackground />
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route index element={<Home/>} />
      {/* <Route path='login' element={<Login/>} /> */}

    </Routes>
    <BackToTop/>
    <Footer/>
    </BrowserRouter>     
    </ThemeProvider>
  );
}

export default App;
