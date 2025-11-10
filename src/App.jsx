import { useEffect, useMemo, useState } from 'react'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
      <p className="text-xs uppercase tracking-wide text-indigo-600 font-medium">{label}</p>
      <p className="text-2xl font-bold text-indigo-900 mt-1">{value}</p>
    </div>
  )
}

function App() {
  const backendBase = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [status, setStatus] = useState('Checking...')

  // Tenants
  const [tenants, setTenants] = useState([])
  const [tenantForm, setTenantForm] = useState({ name: '', code: '' })

  // Students
  const [students, setStudents] = useState([])
  const [studentForm, setStudentForm] = useState({ tenant_id: '', student_number: '', first_name: '', last_name: '', grade_level: '' })

  // Classes
  const [classes, setClasses] = useState([])
  const [classForm, setClassForm] = useState({ tenant_id: '', name: '', code: '', subject: '', grade_level: '' })

  // Announcements
  const [announcements, setAnnouncements] = useState([])
  const [announcementForm, setAnnouncementForm] = useState({ tenant_id: '', title: '', message: '' })

  // Finance
  const [invoices, setInvoices] = useState([])
  const [invoiceForm, setInvoiceForm] = useState({ tenant_id: '', student_id: '', title: '', amount: '' })

  const fetchJson = async (path, opts = {}) => {
    const res = await fetch(`${backendBase}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    })
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
  }

  const loadAll = async () => {
    try {
      const hello = await fetchJson('/')
      setStatus(`✅ ${hello.message}`)
    } catch (e) {
      setStatus('❌ Backend not reachable')
    }

    try {
      const [t, s, c, a, inv] = await Promise.all([
        fetchJson('/tenants'),
        fetchJson('/students'),
        fetchJson('/classes'),
        fetchJson('/announcements'),
        fetchJson('/invoices'),
      ])
      setTenants(t); setStudents(s); setClasses(c); setAnnouncements(a); setInvoices(inv)
    } catch (e) {
      // ignore list errors to keep UI working
    }
  }

  useEffect(() => { loadAll() }, [])

  const createTenant = async (e) => {
    e.preventDefault()
    if (!tenantForm.name || !tenantForm.code) return
    await fetchJson('/tenants', { method: 'POST', body: JSON.stringify(tenantForm) })
    setTenantForm({ name: '', code: '' })
    loadAll()
  }

  const createStudent = async (e) => {
    e.preventDefault()
    const payload = { ...studentForm }
    if (!payload.tenant_id || !payload.student_number || !payload.first_name || !payload.last_name || !payload.grade_level) return
    await fetchJson('/students', { method: 'POST', body: JSON.stringify(payload) })
    setStudentForm({ tenant_id: '', student_number: '', first_name: '', last_name: '', grade_level: '' })
    loadAll()
  }

  const createClass = async (e) => {
    e.preventDefault()
    const payload = { ...classForm }
    if (!payload.tenant_id || !payload.name || !payload.code || !payload.subject || !payload.grade_level) return
    await fetchJson('/classes', { method: 'POST', body: JSON.stringify(payload) })
    setClassForm({ tenant_id: '', name: '', code: '', subject: '', grade_level: '' })
    loadAll()
  }

  const createAnnouncement = async (e) => {
    e.preventDefault()
    const payload = { ...announcementForm }
    if (!payload.tenant_id || !payload.title || !payload.message) return
    await fetchJson('/announcements', { method: 'POST', body: JSON.stringify(payload) })
    setAnnouncementForm({ tenant_id: '', title: '', message: '' })
    loadAll()
  }

  const createInvoice = async (e) => {
    e.preventDefault()
    const amount = parseFloat(invoiceForm.amount || '0')
    const payload = { ...invoiceForm, amount }
    if (!payload.tenant_id || !payload.student_id || !payload.title || !amount) return
    await fetchJson('/invoices', { method: 'POST', body: JSON.stringify(payload) })
    setInvoiceForm({ tenant_id: '', student_id: '', title: '', amount: '' })
    loadAll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white grid place-content-center font-bold">E</div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">EDmin</h1>
              <p className="text-xs text-gray-500">SaaS Student & Education Management</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">Backend: {status}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Stat label="Tenants" value={tenants.length} />
          <Stat label="Students" value={students.length} />
          <Stat label="Classes" value={classes.length} />
          <Stat label="Announcements" value={announcements.length} />
          <Stat label="Invoices" value={invoices.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Create Tenant">
            <form className="space-y-3" onSubmit={createTenant}>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Name" value={tenantForm.name} onChange={e=>setTenantForm(v=>({...v,name:e.target.value}))} />
                <input className="input" placeholder="Code" value={tenantForm.code} onChange={e=>setTenantForm(v=>({...v,code:e.target.value}))} />
              </div>
              <button className="btn-primary">Add Tenant</button>
            </form>
            <div className="mt-4 max-h-44 overflow-auto text-sm">
              {tenants.map((t,i)=> (
                <div key={i} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">Code: {t.code}</p>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded bg-indigo-100 text-indigo-700">{t.status || 'active'}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Create Class">
            <form className="space-y-3" onSubmit={createClass}>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={classForm.tenant_id} onChange={e=>setClassForm(v=>({...v,tenant_id:e.target.value}))}>
                  <option value="">Select Tenant</option>
                  {tenants.map(t=> <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <input className="input" placeholder="Name" value={classForm.name} onChange={e=>setClassForm(v=>({...v,name:e.target.value}))} />
                <input className="input" placeholder="Code" value={classForm.code} onChange={e=>setClassForm(v=>({...v,code:e.target.value}))} />
                <input className="input" placeholder="Subject" value={classForm.subject} onChange={e=>setClassForm(v=>({...v,subject:e.target.value}))} />
                <input className="input" placeholder="Grade Level" value={classForm.grade_level} onChange={e=>setClassForm(v=>({...v,grade_level:e.target.value}))} />
              </div>
              <button className="btn-primary">Add Class</button>
            </form>
            <div className="mt-4 max-h-44 overflow-auto text-sm">
              {classes.map((c,i)=> (
                <div key={i} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-800">{c.name} • {c.subject}</p>
                    <p className="text-xs text-gray-500">Code: {c.code} • Grade: {c.grade_level}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Register Student">
            <form className="space-y-3" onSubmit={createStudent}>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={studentForm.tenant_id} onChange={e=>setStudentForm(v=>({...v,tenant_id:e.target.value}))}>
                  <option value="">Select Tenant</option>
                  {tenants.map(t=> <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <input className="input" placeholder="Student Number" value={studentForm.student_number} onChange={e=>setStudentForm(v=>({...v,student_number:e.target.value}))} />
                <input className="input" placeholder="First Name" value={studentForm.first_name} onChange={e=>setStudentForm(v=>({...v,first_name:e.target.value}))} />
                <input className="input" placeholder="Last Name" value={studentForm.last_name} onChange={e=>setStudentForm(v=>({...v,last_name:e.target.value}))} />
                <input className="input" placeholder="Grade Level" value={studentForm.grade_level} onChange={e=>setStudentForm(v=>({...v,grade_level:e.target.value}))} />
              </div>
              <button className="btn-primary">Add Student</button>
            </form>
            <div className="mt-4 max-h-44 overflow-auto text-sm">
              {students.map((s,i)=> (
                <div key={i} className="py-2 border-b">
                  <p className="font-medium text-gray-800">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-gray-500">#{s.student_number} • Grade {s.grade_level}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Announcements">
            <form className="space-y-3" onSubmit={createAnnouncement}>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={announcementForm.tenant_id} onChange={e=>setAnnouncementForm(v=>({...v,tenant_id:e.target.value}))}>
                  <option value="">Select Tenant</option>
                  {tenants.map(t=> <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <input className="input" placeholder="Title" value={announcementForm.title} onChange={e=>setAnnouncementForm(v=>({...v,title:e.target.value}))} />
                <input className="input col-span-2" placeholder="Message" value={announcementForm.message} onChange={e=>setAnnouncementForm(v=>({...v,message:e.target.value}))} />
              </div>
              <button className="btn-primary">Publish</button>
            </form>
            <div className="mt-4 max-h-44 overflow-auto text-sm">
              {announcements.map((a,i)=> (
                <div key={i} className="py-2 border-b">
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.message}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Create Invoice">
            <form className="space-y-3" onSubmit={createInvoice}>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={invoiceForm.tenant_id} onChange={e=>setInvoiceForm(v=>({...v,tenant_id:e.target.value}))}>
                  <option value="">Select Tenant</option>
                  {tenants.map(t=> <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <select className="input" value={invoiceForm.student_id} onChange={e=>setInvoiceForm(v=>({...v,student_id:e.target.value}))}>
                  <option value="">Select Student</option>
                  {students.map(s=> <option key={s._id} value={s._id}>{s.first_name} {s.last_name}</option>)}
                </select>
                <input className="input" placeholder="Title" value={invoiceForm.title} onChange={e=>setInvoiceForm(v=>({...v,title:e.target.value}))} />
                <input className="input" placeholder="Amount" type="number" value={invoiceForm.amount} onChange={e=>setInvoiceForm(v=>({...v,amount:e.target.value}))} />
              </div>
              <button className="btn-primary">Create Invoice</button>
            </form>
            <div className="mt-4 max-h-44 overflow-auto text-sm">
              {invoices.map((inv,i)=> (
                <div key={i} className="py-2 border-b flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{inv.title}</p>
                    <p className="text-xs text-gray-500">Amount: {inv.amount} • Status: {inv.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Quick Links">
          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <a href="/test" className="px-3 py-2 bg-gray-900 text-white rounded-md">Backend & DB Test</a>
            <span className="text-gray-600">API Base: {backendBase}</span>
          </div>
        </Section>
      </main>

      <style>{`
        .input{ @apply w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500; }
        .btn-primary{ @apply inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 transition; }
      `}</style>
    </div>
  )
}

export default App
