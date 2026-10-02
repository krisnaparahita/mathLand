import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { profilesApi, type Profile } from '@/lib/api'

const STORAGE_KEY = 'mathland.profileId'

interface ProfileContextValue {
  profiles: Profile[]
  profile: Profile | null
  loading: boolean
  needsSetup: boolean
  error: string | null
  selectProfile: (id: number) => void
  createProfile: (input: {
    name: string
    avatar: string
    color: string
    grade: number
  }) => Promise<Profile>
  updateProfile: (input: Partial<Profile> & { id: number }) => Promise<Profile>
  deleteProfile: (id: number) => Promise<void>
  refresh: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeId, setActiveId] = useState<number | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const list = await profilesApi.list()
      setProfiles(list)
      setError(null)
      setActiveId((current) => {
        if (current && list.some((p) => p.id === current)) return current
        const fallback = list[0]?.id ?? null
        if (fallback) localStorage.setItem(STORAGE_KEY, String(fallback))
        else localStorage.removeItem(STORAGE_KEY)
        return fallback
      })
    } catch {
      setError('无法连接服务器，成绩暂时不能保存')
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const selectProfile = useCallback((id: number) => {
    localStorage.setItem(STORAGE_KEY, String(id))
    setActiveId(id)
  }, [])

  const createProfile = useCallback<ProfileContextValue['createProfile']>(async (input) => {
    const created = await profilesApi.create(input)
    localStorage.setItem(STORAGE_KEY, String(created.id))
    setActiveId(created.id)
    await refresh()
    return created
  }, [refresh])

  const updateProfile = useCallback<ProfileContextValue['updateProfile']>(async (input) => {
    const updated = await profilesApi.update(input)
    await refresh()
    return updated
  }, [refresh])

  const deleteProfile = useCallback<ProfileContextValue['deleteProfile']>(
    async (id) => {
      await profilesApi.remove(id)
      localStorage.removeItem(STORAGE_KEY)
      setActiveId(null)
      await refresh()
    },
    [refresh]
  )

  const profile = useMemo(
    () => profiles.find((p) => p.id === activeId) ?? null,
    [profiles, activeId]
  )

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles,
      profile,
      loading,
      needsSetup: !loading && profiles.length === 0,
      error,
      selectProfile,
      createProfile,
      updateProfile,
      deleteProfile,
      refresh,
    }),
    [
      profiles,
      profile,
      loading,
      error,
      selectProfile,
      createProfile,
      updateProfile,
      deleteProfile,
      refresh,
    ]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile 必须在 ProfileProvider 内部使用')
  return ctx
}
