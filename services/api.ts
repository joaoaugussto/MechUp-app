const API_URL = 'https://mechup-app.onrender.com/api'

export const api = {
  // Clients
  getClients: async () => {
    const res = await fetch(`${API_URL}/clients`)
    return res.json()
  },  

  getClient: async (id: string) => {
    const res = await fetch(`${API_URL}/clients/${id}`)
    return res.json()
  },

  createClient: async (data: any) => {
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Cars
  getCars: async () => {
    const res = await fetch(`${API_URL}/cars`)
    return res.json()
  },

  getCar: async (id: string) => {
    const res = await fetch(`${API_URL}/cars/${id}`)
    return res.json()
  },

  createCar: async (data: any) => {
    const res = await fetch(`${API_URL}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // Services
  getServices: async () => {
    const res = await fetch(`${API_URL}/services`)
    return res.json()
  },

  getService: async (id: string) => {
    const res = await fetch(`${API_URL}/services/${id}`)
    return res.json()
  },

  createService: async (data: any) => {
    const res = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  updateService: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },
}