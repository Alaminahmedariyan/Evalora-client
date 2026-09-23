import { ofetch } from "ofetch"

const BASE_URL = process.env.Next_PUBLIC_BASE_URL || "http://localhost:5000"

const apiClient  = ofetch.create({
    baseURL: BASE_URL
})

export default apiClient