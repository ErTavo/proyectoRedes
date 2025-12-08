import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.MODE === 'production' ? '/api' : 'http://192.168.1.4:3000/api'

export default function App(){
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadItems(){
    try{
      const res = await fetch(`${API_BASE}/items`)
      const data = await res.json()
      setItems(data)
    }catch(err){
      console.error(err)
    }
  }

  useEffect(()=>{ loadItems() }, [])

  async function handleSubmit(e){
    e.preventDefault()
    if(!name || !email) return alert('Nombre y email son requeridos')
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })
      if(!res.ok){
        const err = await res.json()
        alert(err.error || 'Error')
      }else{
        setName('')
        setEmail('')
        setMessage('')
        await loadItems()
      }
    }catch(err){
      console.error(err)
      alert('Error al conectar con backend')
    }finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <h1>Enviar datos</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>Nombre<br/>
          <input value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label>Email<br/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>Mensaje<br/>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</button>
      </form>

      <h2>Registros</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Mensaje</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td>{it.name}</td>
              <td>{it.email}</td>
              <td>{it.message}</td>
              <td>{it.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
