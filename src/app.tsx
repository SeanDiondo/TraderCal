import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Contact from "./components/contact";
import Footer from "./components/footer";
import ForexCalculator from "./components/forexCalculator";
import LeverageCalculator from "./components/leverageCalculator";
import News from "./components/news";
import Journal from "./components/journal";
import Login from "./components/login";
import Register from "./components/register";
import ProtectedRoute from "./components/protectedRoute";

const Home: React.FC = () => (
  <>
    <Hero />
  </>
);

const App: React.FC = () => {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leverage-calculator" element={<LeverageCalculator />} />
          <Route path="/calculator" element={<ForexCalculator />} />
          <Route path="/news" element={<News />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
