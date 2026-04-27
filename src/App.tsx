import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import TopPage from './pages/TopPage'
import ResultPage from './pages/ResultPage'
import FamilyPage from './pages/FamilyPage'
import IncomePage from './pages/IncomePage'
import ExpensePage from './pages/ExpensePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route element={<AppLayout />}>
          <Route path="/result" element={<ResultPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
