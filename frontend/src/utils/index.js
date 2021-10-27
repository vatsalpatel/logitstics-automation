import axios from 'axios'

export const myaxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': "application/json",
    }
})

myaxios.interceptors.request.use((config) => {
    if (checkAuth()) {
        config.headers.Authorization = `Token ${localStorage.getItem('user-token')}`
    }
    return config
})


export const checkAuth = () => {
    if(localStorage.getItem('user-token')) {
        return true
    }
    return false
}
