import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Eye, EyeOff, LogIn, UserPlus, Lock, User, Building2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ToastProvider'

const shakeV = {
  idle:  { x: 0 },
  shake: { x: [0,-8,8,-6,6,-3,3,0], transition: { duration: 0.42 } },
}

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, shake, disabled }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <motion.div variants={shakeV} animate={shake ? 'shake' : 'idle'}>
      <label className="label-text">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }} />
        )}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field"
          style={{ paddingLeft: Icon ? '2.25rem' : undefined,
                   paddingRight: isPassword ? '2.5rem' : undefined,
                   border: shake ? '1px solid rgba(248,113,113,0.7)' : undefined }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} tabIndex={-1}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function LoginPage() {
  const { login, signup } = useAuth()
  const { addToast } = useToast()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    username: '', password: '', fullName: '', department: '', role: 'STUDENT',
  })
  const [shaking, setShaking] = useState({
    username: false, password: false, fullName: false,
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const triggerShake = fields => {
    setShaking(s => { const n = { ...s }; fields.forEach(f => { n[f] = true }); return n })
    setTimeout(() =>
      setShaking(s => { const n = { ...s }; fields.forEach(f => { n[f] = false }); return n })
    , 480)
  }

  const handleSubmit = async () => {
    const missing = []
    if (!form.username.trim()) missing.push('username')
    if (!form.password.trim()) missing.push('password')
    if (mode === 'signup' && !form.fullName.trim()) missing.push('fullName')
    if (missing.length) {
      triggerShake(missing)
      addToast({ type: 'error', title: 'Missing Fields', message: 'Please fill in all required fields.' })
      return
    }

    setLoading(true)
    try {
      const result = mode === 'login'
        ? await login(form.username.trim(), form.password)
        : await signup(form.username.trim(), form.password, form.fullName.trim(), form.department.trim(), form.role)

      if (!result?.success) {
        addToast({ type: 'error', title: mode === 'login' ? 'Login Failed' : 'Signup Failed',
          message: result?.message || 'Something went wrong.' })
      }
      // On success — AuthProvider sets user → App re-renders to show dashboard
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.uiMessage || 'Could not connect to server.' })
    } finally {
      setLoading(false)
    }
  }

  const handleKey = e => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg-base)' }}>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(67,56,202,0.3) 0%, transparent 70%)', opacity: 0.5 }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', opacity: 0.4 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
        className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                       boxShadow: '0 0 24px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
              <Cpu size={26} className="text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#050516] animate-pulse-slow" />
          </div>
          <h1 className="font-display font-bold text-2xl leading-none tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            Campus<span style={{ color: 'var(--text-muted)' }}>Hub</span>
          </h1>
          <p className="text-xs font-body mt-1.5 tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}>
            Resource Management System
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex p-1 rounded-xl mb-6"
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)' }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200"
              style={mode === m
                ? { background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: 'white',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.35)' }
                : { color: 'var(--text-muted)' }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{    opacity: 0, x: mode === 'login' ?  12 : -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
            onKeyDown={handleKey}
          >
            {mode === 'signup' && (
              <Field label="Full Name *" icon={User}
                value={form.fullName} onChange={set('fullName')}
                placeholder="Your full name" shake={shaking.fullName} disabled={loading} />
            )}

            <Field label="Username *" icon={User}
              value={form.username} onChange={set('username')}
              placeholder="Enter username" shake={shaking.username} disabled={loading} />

            <Field label="Password *" icon={Lock} type="password"
              value={form.password} onChange={set('password')}
              placeholder="Enter password" shake={shaking.password} disabled={loading} />

            {mode === 'signup' && (
              <>
                <Field label="Department" icon={Building2}
                  value={form.department} onChange={set('department')}
                  placeholder="e.g. Computer Science" disabled={loading} />

                <div>
                  <label className="label-text flex items-center gap-1.5">
                    <ShieldCheck size={10} /> Role
                  </label>
                  <select value={form.role} onChange={set('role')}
                    className="input-field appearance-none" disabled={loading}>
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <p className="text-[10px] mt-1.5 font-body" style={{ color: 'var(--text-muted)' }}>
                    Admin role only works if no admin exists yet.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Submit */}
        <motion.button onClick={handleSubmit} disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-5">
          {loading
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
            : mode === 'login'
              ? <><LogIn size={15} /> Sign In</>
              : <><UserPlus size={15} /> Create Account</>
          }
        </motion.button>

        {/* Default credentials hint */}
        {mode === 'login' && (
          <div className="mt-4 rounded-xl px-3 py-2.5 text-center"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-[10px] font-body" style={{ color: 'var(--text-muted)' }}>
              Default admin: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>admin</span>
              {' / '}
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>admin123</span>
            </p>
            <p className="text-[10px] font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Default student: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>student1</span>
              {' / '}
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>pass123</span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
