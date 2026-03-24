import { HashRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Project from './pages/Project';

export default function App() {
  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:name" element={<Project />} />
      </Routes>
    </HashRouter>
  );
}
