import axios from 'axios'
import config from '@/config'

const api = axios.create({
  baseURL: config.SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface Language {
  id?: number
  code: string
  enabled: boolean
  name?: string
  translations?: Record<number, { name: string }>
  created_at?: string
  updated_at?: string
}

export interface LanguageFormData {
  code: string
  enabled: boolean
  native_name?: string
  translations: Record<number, { name: string }>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters?: {
    search?: string
    sort?: string
    direction?: string
  }
}

export interface SingleResponse<T> {
  data: T
}

export const languageService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<Language>>('/api/admin/languages', { params })
  },
  getById(id: number | string) {
    return api.get<SingleResponse<Language>>(`/api/admin/languages/${id}`)
  },
  getCreateData() {
    return api.get<{ availableLanguages: Language[] }>('/api/admin/languages/create')
  },
  getEditData(id: number | string) {
    return api.get<{ data: Language; availableLanguages: Language[] }>(`/api/admin/languages/${id}/edit`)
  },
  create(language: LanguageFormData) {
    return api.post<Language>('/api/admin/languages', language)
  },
  update(id: number | string, language: LanguageFormData) {
    return api.put<Language>(`/api/admin/languages/${id}`, language)
  },
  delete(id: number | string) {
    return api.delete(`/api/admin/languages/${id}`)
  },
}
