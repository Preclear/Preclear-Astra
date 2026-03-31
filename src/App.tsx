import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import GuidesPage from './pages/GuidesPage';
import { paths } from './routes';

const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={
          <Layout headerVariant="light">
            <HomePage />
          </Layout>
        } />
        <Route path={paths.product} element={
          <Layout headerVariant="dark" stickyHeader>
            <ProductPage />
          </Layout>
        } />
        <Route path={paths.howItWorks} element={
          <Layout headerVariant="dark" stickyHeader hiwHeroBackground>
            <HowItWorksPage />
          </Layout>
        } />
        <Route path={paths.features} element={
          <Layout headerVariant="dark" stickyHeader featuresPage>
            <FeaturesPage />
          </Layout>
        } />
        <Route path={paths.pricing} element={
          <Layout headerVariant="dark" stickyHeader pricingPage>
            <PricingPage />
          </Layout>
        } />
        <Route path={paths.guides} element={
          <Layout headerVariant="dark" stickyHeader hiwHeroBackground>
            <GuidesPage />
          </Layout>
        } />
        <Route path={paths.signUp} element={
          <Layout headerVariant="dark" signUpPage minimalHeader>
            <Suspense
              fallback={
                <p style={{ textAlign: 'center', margin: '48px auto', color: '#64748b' }}>Loading…</p>
              }
            >
              <SignUpPage />
            </Suspense>
          </Layout>
        } />
        <Route path={paths.signIn} element={
          <Layout headerVariant="dark" signUpPage minimalHeader>
            <Suspense
              fallback={
                <p style={{ textAlign: 'center', margin: '48px auto', color: '#64748b' }}>Loading…</p>
              }
            >
              <SignInPage />
            </Suspense>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
