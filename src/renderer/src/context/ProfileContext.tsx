import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { ModProfileLimits, ModProfileSummary } from '../../../shared/modProfiles'

interface ProfileContextValue {
  profiles: ModProfileSummary[]
  limits: ModProfileLimits | null
  selectedProfileId: string | null
  activeProfileId: string
  setSelectedProfileId: (profileId: string | null) => void
  refreshProfiles: () => Promise<void>
  selectedProfile: ModProfileSummary | null
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [profiles, setProfiles] = useState<ModProfileSummary[]>([])
  const [limits, setLimits] = useState<ModProfileLimits | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [activeProfileId, setActiveProfileId] = useState('')

  const refreshProfiles = useCallback(async (): Promise<void> => {
    const [nextProfiles, nextLimits, activeId] = await Promise.all([
      window.api.profiles.list(),
      window.api.profiles.getLimits(),
      window.api.profiles.getActiveId()
    ])
    setProfiles(nextProfiles)
    setLimits(nextLimits)
    setActiveProfileId(activeId)
    setSelectedProfileId((current) => {
      if (current && nextProfiles.some((profile) => profile.id === current)) {
        return current
      }
      return nextProfiles[0]?.id ?? null
    })
  }, [])

  useEffect(() => {
    void refreshProfiles()
    return window.api.profiles.onChanged((nextProfiles) => {
      setProfiles(nextProfiles)
      void window.api.profiles.getLimits().then(setLimits)
      void window.api.profiles.getActiveId().then(setActiveProfileId)
      setSelectedProfileId((current) => {
        if (current && nextProfiles.some((profile) => profile.id === current)) {
          return current
        }
        return nextProfiles[0]?.id ?? null
      })
    })
  }, [refreshProfiles])

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  )

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles,
      limits,
      selectedProfileId,
      activeProfileId,
      setSelectedProfileId,
      refreshProfiles,
      selectedProfile
    }),
    [profiles, limits, selectedProfileId, activeProfileId, refreshProfiles, selectedProfile]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfiles(): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within ProfileProvider.')
  }
  return context
}
