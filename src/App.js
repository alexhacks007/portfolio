import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

function App() {
  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path='/' element={<Home/>} />
      {/* <Route path='login' element={<Login/>} /> */}

    </Routes>
    <BackToTop/>
    <Footer/>
    </BrowserRouter>     
    </>
  );
}

export default App;
