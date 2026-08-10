import { BrowserRouter, MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, LazyMotion, domAnimation } from 'motion/react';
import { IS_DEMO } from './lib/demo';
import SmoothScroll from './components/SmoothScroll';
import CursorGlow from './components/CursorGlow';
import Preloader from './components/Preloader';
import Grain from './components/Grain';
import { EnquiryProvider } from './components/EnquiryModal';
import Landing from './pages/Landing';
import Schedule from './pages/Schedule';
import ThankYou from './pages/ThankYou';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  // file:// has no history API, so the offline preview routes in memory.
  const Router = IS_DEMO ? MemoryRouter : BrowserRouter;

  return (
    // LazyMotion + the `m` components ship only the features this site uses,
    // which is roughly half the weight of importing `motion` everywhere.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <Router>
            <EnquiryProvider>
              <Preloader />
              <Grain />
              <CursorGlow />
              <AnimatedRoutes />
            </EnquiryProvider>
          </Router>
        </SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  );
}
