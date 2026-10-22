import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Mian from './pages/Mian.jsx';
import BusHop from './pages/BusHop.jsx';
import BananaShelfLife from './pages/BananaShelfLife.jsx';
import Aguila from './pages/Aguila.jsx';
import EegExoskeleton from './pages/EegExoskeleton.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import NotFound from './pages/NotFound.jsx';
import { isSpaPath, normalizePath } from './routes.js';

/** Old *.html URLs redirect to the clean path; anything else is a real 404. */
function CatchAll() {
  const { pathname, search, hash } = useLocation();
  const clean = normalizePath(pathname);
  if (clean !== pathname && isSpaPath(clean)) return <Navigate to={clean + search + hash} replace />;
  return <NotFound />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={null} />
        <Route path="/experience" element={null} />
        <Route path="/projects" element={null} />
        <Route path="/certifications" element={null} />
        <Route path="/mian" element={<Mian />} />
        <Route path="/bushop-project" element={<BusHop />} />
        <Route path="/banana-shelflife" element={<BananaShelfLife />} />
        <Route path="/aguila" element={<Aguila />} />
        <Route path="/eeg-exoskeleton" element={<EegExoskeleton />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<CatchAll />} />
      </Route>
    </Routes>
  );
}
