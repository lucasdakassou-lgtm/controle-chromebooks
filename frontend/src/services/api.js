import axios from "axios"

const api = axios.create({
    baseURL: "https://sistemaproati.onrender.com"
})

console.log("[API] Axios configurado.")
console.log("[API] Base URL:", api.defaults.baseURL)

export default api