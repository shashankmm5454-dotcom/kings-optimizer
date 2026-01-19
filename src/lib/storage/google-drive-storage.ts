// ===============================================
// GOOGLE DRIVE STORAGE SERVICE
// Persistent storage using Google Drive API
// ===============================================

// This service handles saving/loading data to Google Drive
// Requires Google OAuth authentication

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
}

interface StorageConfig {
  rootFolderId?: string
  rootFolderName: string
}

// Default folder structure
const DEFAULT_FOLDER_STRUCTURE = {
  root: 'kings-optimizer-data',
  subfolders: ['profiles', 'glass', 'hardware', 'window-types', 'quotes', 'settings'],
}

export class GoogleDriveStorage {
  private accessToken: string | null = null
  private rootFolderId: string | null = null

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null
  }

  // Set access token (call after OAuth)
  setAccessToken(token: string) {
    this.accessToken = token
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Make API request
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in with Google.')
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Google Drive API error')
    }

    return response.json()
  }

  // Initialize storage (create folder structure)
  async initialize(): Promise<string> {
    // Find or create root folder
    const rootFolder = await this.findOrCreateFolder(DEFAULT_FOLDER_STRUCTURE.root)
    this.rootFolderId = rootFolder.id

    // Create subfolders
    for (const subfolder of DEFAULT_FOLDER_STRUCTURE.subfolders) {
      await this.findOrCreateFolder(subfolder, rootFolder.id)
    }

    console.log('Google Drive storage initialized:', rootFolder.id)
    return rootFolder.id
  }

  // Find folder by name
  async findFolder(name: string, parentId?: string): Promise<DriveFile | null> {
    const query = parentId
      ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

    const result = await this.request(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`)
    return result.files?.[0] || null
  }

  // Create folder
  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    const metadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    }

    if (parentId) {
      metadata.parents = [parentId]
    }

    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify(metadata),
    })
  }

  // Find or create folder
  async findOrCreateFolder(name: string, parentId?: string): Promise<DriveFile> {
    const existing = await this.findFolder(name, parentId)
    if (existing) return existing
    return this.createFolder(name, parentId)
  }

  // Get subfolder ID by name
  async getSubfolderId(name: string): Promise<string> {
    if (!this.rootFolderId) {
      throw new Error('Storage not initialized. Call initialize() first.')
    }
    const folder = await this.findFolder(name, this.rootFolderId)
    if (!folder) {
      throw new Error(`Subfolder "${name}" not found`)
    }
    return folder.id
  }

  // Save JSON data to a file
  async saveJson<T>(filename: string, data: T, subfolder: string): Promise<DriveFile> {
    const folderId = await this.getSubfolderId(subfolder)
    
    // Check if file exists
    const existing = await this.findFile(filename, folderId)
    
    if (existing) {
      // Update existing file
      return this.updateFile(existing.id, data)
    } else {
      // Create new file
      return this.createFile(filename, data, folderId)
    }
  }

  // Load JSON data from a file
  async loadJson<T>(filename: string, subfolder: string): Promise<T | null> {
    const folderId = await this.getSubfolderId(subfolder)
    const file = await this.findFile(filename, folderId)
    
    if (!file) return null
    
    return this.getFileContent(file.id)
  }

  // Find file by name in folder
  async findFile(name: string, folderId: string): Promise<DriveFile | null> {
    const query = `name='${name}' and '${folderId}' in parents and trashed=false`
    const result = await this.request(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`)
    return result.files?.[0] || null
  }

  // Create new file
  private async createFile(name: string, data: any, folderId: string): Promise<DriveFile> {
    // Use multipart upload
    const metadata = {
      name,
      parents: [folderId],
      mimeType: 'application/json',
    }

    const boundary = '-------314159265358979323846'
    const body = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadata)}
--${boundary}
Content-Type: application/json

${JSON.stringify(data, null, 2)}
--${boundary}--`

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create file')
    }

    return response.json()
  }

  // Update existing file
  private async updateFile(fileId: string, data: any): Promise<DriveFile> {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name,mimeType,modifiedTime`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, null, 2),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update file')
    }

    return response.json()
  }

  // Get file content
  private async getFileContent<T>(fileId: string): Promise<T> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get file content')
    }

    return response.json()
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    await this.request(`/files/${fileId}`, { method: 'DELETE' })
  }

  // List files in a subfolder
  async listFiles(subfolder: string): Promise<DriveFile[]> {
    const folderId = await this.getSubfolderId(subfolder)
    const query = `'${folderId}' in parents and trashed=false`
    const result = await this.request(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc`)
    return result.files || []
  }
}

// ===============================================
// STORAGE HOOKS FOR REACT
// ===============================================

import { useState, useEffect, useCallback } from 'react'

// Local storage keys
const STORAGE_KEYS = {
  profiles: 'kings-optimizer-profiles',
  glass: 'kings-optimizer-glass',
  hardware: 'kings-optimizer-hardware',
  windowTypes: 'kings-optimizer-window-types',
  quotes: 'kings-optimizer-quotes',
  settings: 'kings-optimizer-settings',
}

// Hook for using storage (localStorage + optional Drive sync)
export function useStorage<T>(
  key: keyof typeof STORAGE_KEYS,
  defaultValue: T,
  driveStorage?: GoogleDriveStorage
) {
  const storageKey = STORAGE_KEYS[key]
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setData(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }
    setLoading(false)
  }, [storageKey])

  // Save to localStorage
  const saveLocal = useCallback((newData: T) => {
    setData(newData)
    localStorage.setItem(storageKey, JSON.stringify(newData))
  }, [storageKey])

  // Sync to Google Drive
  const syncToDrive = useCallback(async () => {
    if (!driveStorage?.isAuthenticated()) return

    setSyncing(true)
    try {
      await driveStorage.saveJson(`${key}.json`, data, key)
      setLastSynced(new Date().toISOString())
    } catch (err) {
      console.error('Error syncing to Drive:', err)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [driveStorage, data, key])

  // Load from Google Drive
  const loadFromDrive = useCallback(async () => {
    if (!driveStorage?.isAuthenticated()) return

    setSyncing(true)
    try {
      const driveData = await driveStorage.loadJson<T>(`${key}.json`, key)
      if (driveData) {
        setData(driveData)
        localStorage.setItem(storageKey, JSON.stringify(driveData))
        setLastSynced(new Date().toISOString())
      }
    } catch (err) {
      console.error('Error loading from Drive:', err)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [driveStorage, key, storageKey])

  return {
    data,
    setData: saveLocal,
    loading,
    syncing,
    lastSynced,
    syncToDrive,
    loadFromDrive,
  }
}

// ===============================================
// STORAGE CONTEXT
// ===============================================

import { createContext, useContext, ReactNode } from 'react'

interface StorageContextType {
  driveStorage: GoogleDriveStorage | null
  isAuthenticated: boolean
  setAccessToken: (token: string) => void
  initialize: () => Promise<void>
}

const StorageContext = createContext<StorageContextType>({
  driveStorage: null,
  isAuthenticated: false,
  setAccessToken: () => {},
  initialize: async () => {},
})

export function StorageProvider({ children }: { children: ReactNode }) {
  const [driveStorage] = useState(() => new GoogleDriveStorage())
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const setAccessToken = useCallback((token: string) => {
    driveStorage.setAccessToken(token)
    setIsAuthenticated(true)
  }, [driveStorage])

  const initialize = useCallback(async () => {
    if (isAuthenticated) {
      await driveStorage.initialize()
    }
  }, [driveStorage, isAuthenticated])

  return (
    <StorageContext.Provider value={{ driveStorage, isAuthenticated, setAccessToken, initialize }}>
      {children}
    </StorageContext.Provider>
  )
}

export function useStorageContext() {
  return useContext(StorageContext)
}

// ===============================================
// EXPORT ALL DATA TO DRIVE
// ===============================================

export async function exportAllToDrive(driveStorage: GoogleDriveStorage) {
  const data = {
    profiles: JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '[]'),
    glass: JSON.parse(localStorage.getItem(STORAGE_KEYS.glass) || '[]'),
    hardware: JSON.parse(localStorage.getItem(STORAGE_KEYS.hardware) || '[]'),
    windowTypes: JSON.parse(localStorage.getItem(STORAGE_KEYS.windowTypes) || '[]'),
    quotes: JSON.parse(localStorage.getItem(STORAGE_KEYS.quotes) || '[]'),
    settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}'),
  }

  for (const [key, value] of Object.entries(data)) {
    await driveStorage.saveJson(`${key}.json`, value, key as any)
  }

  return data
}

// ===============================================
// IMPORT ALL DATA FROM DRIVE
// ===============================================

export async function importAllFromDrive(driveStorage: GoogleDriveStorage) {
  const keys = Object.keys(STORAGE_KEYS) as (keyof typeof STORAGE_KEYS)[]
  const data: Record<string, any> = {}

  for (const key of keys) {
    const fileData = await driveStorage.loadJson(`${key}.json`, key)
    if (fileData) {
      data[key] = fileData
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(fileData))
    }
  }

  return data
}

// ===============================================
// USAGE EXAMPLE
// ===============================================
/*

// In your app layout or provider:
import { StorageProvider } from '@/lib/storage/google-drive-storage'

export default function RootLayout({ children }) {
  return (
    <StorageProvider>
      {children}
    </StorageProvider>
  )
}

// In a component:
import { useStorage, useStorageContext } from '@/lib/storage/google-drive-storage'

function ProfilesPage() {
  const { driveStorage, isAuthenticated, setAccessToken } = useStorageContext()
  
  const { 
    data: profiles, 
    setData: setProfiles, 
    loading, 
    syncing,
    syncToDrive,
    loadFromDrive 
  } = useStorage('profiles', [], driveStorage)

  // After Google OAuth callback:
  useEffect(() => {
    const token = getGoogleAccessToken() // from your OAuth flow
    if (token) {
      setAccessToken(token)
    }
  }, [])

  return (
    <div>
      {isAuthenticated && (
        <div>
          <button onClick={syncToDrive} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync to Drive'}
          </button>
          <button onClick={loadFromDrive} disabled={syncing}>
            Load from Drive
          </button>
        </div>
      )}
      
      {loading ? 'Loading...' : profiles.map(p => ...)}
    </div>
  )
}

*/

export default GoogleDriveStorage
