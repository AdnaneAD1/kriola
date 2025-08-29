'use client'

/**
 * Hook et utilitaires pour gérer l'upload de fichiers vers Cloudinary
 * Supporte les images, documents, vidéos et autres types de fichiers
 */

import { useCallback, useState } from 'react'

// ----------------------
// Utilitaires génériques
// ----------------------

/**
 * Formater la taille d'un fichier en format lisible (ex: "1.5 MB")
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtenir les informations détaillées d'un fichier uploadé
 * @param {File} file
 */
export function getFileInfo(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    isImage: file.type.startsWith('image/'),
    isVideo: file.type.startsWith('video/'),
    isDocument: !file.type.startsWith('image/') && !file.type.startsWith('video/'),
    sizeFormatted: formatFileSize(file.size),
  }
}

/**
 * Valider un fichier avant upload
 * @param {File} file
 * @param {number} [maxSize] Taille maximale en bytes (défaut: 10MB)
 * @param {string[]} [allowedTypes] Types mime acceptés (préfixes: 'image/', 'video/', etc.)
 */
export function validateFile(file, maxSize = 10 * 1024 * 1024, allowedTypes) {
  if (file.size > maxSize) {
    throw new Error(`Le fichier est trop volumineux. Taille maximale: ${formatFileSize(maxSize)}`)
  }
  if (allowedTypes && !allowedTypes.some((t) => file.type.startsWith(t))) {
    throw new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`)
  }
  return true
}

// ----------------------
// Uploads Cloudinary (fetch direct)
// ----------------------

function requireCloudinaryEnv() {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  if (!cloud || !preset) {
    throw new Error('Configuration Cloudinary manquante. Vérifiez NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME et NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.')
  }
  return { cloud, preset }
}

/**
 * Upload une image sur Cloudinary et retourne l'URL sécurisée
 * @param {File} imageFile
 * @returns {Promise<string>}
 */
export async function uploadImageToCloudinary(imageFile) {
  const { cloud, preset } = requireCloudinaryEnv()
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`

  const data = new FormData()
  data.append('file', imageFile)
  data.append('upload_preset', preset)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data })
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)
  const cloudinary = await res.json()
  if (!cloudinary.secure_url) throw new Error("Échec de l'upload de l'image - URL manquante")
  return cloudinary.secure_url
}

/**
 * Upload un fichier (PDF, docx, zip, etc.) sur Cloudinary (resource_type: 'raw')
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadFileToCloudinary(file) {
  const { cloud, preset } = requireCloudinaryEnv()
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloud}/raw/upload`

  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', preset)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data })
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)
  const cloudinary = await res.json()
  if (!cloudinary.secure_url) throw new Error("Échec de l'upload du fichier - URL manquante")
  return cloudinary.secure_url
}

/**
 * Upload une vidéo sur Cloudinary
 * @param {File} videoFile
 * @returns {Promise<string>}
 */
export async function uploadVideoToCloudinary(videoFile) {
  const { cloud, preset } = requireCloudinaryEnv()
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloud}/video/upload`

  const data = new FormData()
  data.append('file', videoFile)
  data.append('upload_preset', preset)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data })
  if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)
  const cloudinary = await res.json()
  if (!cloudinary.secure_url) throw new Error("Échec de l'upload de la vidéo - URL manquante")
  return cloudinary.secure_url
}

/**
 * Upload automatique basé sur le type de fichier
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadToCloudinary(file) {
  const fileType = file.type
  if (fileType.startsWith('image/')) return uploadImageToCloudinary(file)
  if (fileType.startsWith('video/')) return uploadVideoToCloudinary(file)
  return uploadFileToCloudinary(file)
}

// ----------------------
// Hook React réutilisable
// ----------------------

/**
 * Hook pour uploader un fichier vers Cloudinary avec état de chargement et progression simulée
 * Retourne: { upload, uploading, progress, error, reset }
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  // Note: l'API fetch n'expose pas la progression nativement.
  // On simule une progression pour l'UX, et on achève à 100% quand l'appel se termine.
  const simulateProgress = useCallback(() => {
    setProgress(10)
    const step1 = setTimeout(() => setProgress(35), 200)
    const step2 = setTimeout(() => setProgress(65), 600)
    const step3 = setTimeout(() => setProgress(85), 1000)
    return () => {
      clearTimeout(step1)
      clearTimeout(step2)
      clearTimeout(step3)
    }
  }, [])

  const upload = useCallback(async (file, options = {}) => {
    setError(null)
    setUploading(true)
    setProgress(0)
    const stopSim = simulateProgress()
    try {
      if (!file) throw new Error('Aucun fichier fourni')
      if (options.validate) validateFile(file, options.maxSize, options.allowedTypes)
      const url = await uploadToCloudinary(file)
      setProgress(100)
      return url
    } catch (e) {
      setError(e?.message || "Erreur lors de l'upload")
      throw e
    } finally {
      if (typeof stopSim === 'function') stopSim()
      setUploading(false)
    }
  }, [simulateProgress])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return { upload, uploading, progress, error, reset }
}
