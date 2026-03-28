import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';

const SignUpPage = lazy(() => import('./pages/SignUpPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout headerVariant="light">
            <HomePage />
          </Layout>
        } />
        <Route path="/how-it-works" element={
          <Layout headerVariant="dark">
            <HowItWorksPage />
          </Layout>
        } />
        <Route path="/sign-up" element={
          <Layout headerVariant="light">
            <Suspense
              fallback={
                <p style={{ textAlign: 'center', margin: '48px auto', color: '#64748b' }}>Loading…</p>
              }
            >
              <SignUpPage />
            </Suspense>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
