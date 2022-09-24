/* eslint-disable no-unused-vars */
import { Profile } from './types'
import { persist, devtools } from 'zustand/middleware'
import create from 'zustand'

interface AppState {
  profiles: Profile[] | []
  setProfiles: (profiles: Profile[]) => void
  currentProfile: Profile | null
  setCurrentProfile: (currentProfile: Profile | null) => void
  authenticated: boolean
  setAuthenticated: (authenticated: boolean) => void
  userSigNonce: number
  setUserSigNonce: (userSigNonce: number) => void
  dao: string | null
  setDao: (dao: string | null) => void
  token: string | null
  setToken: (token: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  profiles: [],
  setProfiles: (profiles) => set(() => ({ profiles })),
  currentProfile: null,
  setCurrentProfile: (currentProfile) => set(() => ({ currentProfile })),
  authenticated: false,
  setAuthenticated: (authenticated) => set(() => ({ authenticated })),
  userSigNonce: 0,
  setUserSigNonce: (userSigNonce) => set(() => ({ userSigNonce })),
  dao: null,
  setDao: (dao) => set(() => ({ dao })),
  token: null,
  setToken: (token) => set(() => ({ token })),
}))

interface AppPersistState {
  profileId: string | null
  setProfileId: (profileId: string | null) => void
  authenticated: boolean
  setAuthenticated: (authenticated: boolean) => void
  notificationCount: number
  setNotificationCount: (notificationCount: number) => void
  dao: string | null
  setDao: (dao: string | null) => void
  token: string | null
  setToken: (token: string | null) => void
}

export const useAppPersistStore = create(
  persist<AppPersistState>(
    (set) => ({
      profileId: null,
      setProfileId: (profileId) => set(() => ({ profileId })),
      authenticated: false,
      setAuthenticated: (authenticated) => set(() => ({ authenticated })),
      dao: null,
      setDao: (dao) => set(() => ({ dao })),
      token: null,
      setToken: (token) => set(() => ({ token })),
      notificationCount: 0,
      setNotificationCount: (notificationCount) =>
        set(() => ({ notificationCount })),
    }),
    { name: 'daobox.store' }
  )
)
