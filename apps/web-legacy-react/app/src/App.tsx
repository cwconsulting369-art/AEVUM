import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import BusinessOS from './pages/services/BusinessOS'
import CommandCenter from './pages/services/CommandCenter'
import LeadEngine from './pages/services/LeadEngine'
import SalesOS from './pages/services/SalesOS'
import ECommerceOS from './pages/services/ECommerceOS'
import PersonalAgent from './pages/services/PersonalAgent'
import AutomationAudit from './pages/services/AutomationAudit'
import WebsiteCRM from './pages/services/WebsiteCRM'
import DatabaseSystem from './pages/services/DatabaseSystem'
import ContentEngine from './pages/services/ContentEngine'
import About from './pages/About'
import Contact from './pages/Contact'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/business-os" element={<BusinessOS />} />
        <Route path="/services/command-center" element={<CommandCenter />} />
        <Route path="/services/ai-lead-engine" element={<LeadEngine />} />
        <Route path="/services/sales-os" element={<SalesOS />} />
        <Route path="/services/ecommerce-os" element={<ECommerceOS />} />
        <Route path="/services/ai-personal-agent" element={<PersonalAgent />} />
        <Route path="/services/automation-audit" element={<AutomationAudit />} />
        <Route path="/services/website-crm" element={<WebsiteCRM />} />
        <Route path="/services/database-system" element={<DatabaseSystem />} />
        <Route path="/services/ai-content-engine" element={<ContentEngine />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Layout>
  )
}
