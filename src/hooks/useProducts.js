'use client'

import useSWR from 'swr'
import axios from '@/lib/axios'

export function useProducts() {
  const { data: products, error, mutate } = useSWR('/api/products', () =>
    axios.get('/api/products').then(res => res.data)
  )

  const createProduct = async (formData) => {
    const response = await axios.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    mutate()
    return response.data
  }

  const updateProduct = async (id, formData) => {
    formData.append('_method', 'PUT')
    const response = await axios.post(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    mutate()
    return response.data
  }

  const deleteProduct = async (id) => {
    await axios.delete(`/api/products/${id}`)
    mutate()
  }

  return {
    products,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading: !error && !products
  }
}
