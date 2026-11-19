import axios from 'axios'

/** Cliente HTTP único (README §4: as chamadas REST passam pelo Axios). */
export const http = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})
