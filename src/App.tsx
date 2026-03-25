import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
