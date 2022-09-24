import { useLazyQuery, useMutation } from '@apollo/client'
import {
  AUTHENTICATE_MUTATION,
  CHALLENGE_QUERY,
} from '../src/gql/Authentication'
import { GET_PROFILES } from '../src/gql/User'
import Cookies from 'js-cookie'
import React, { FC, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import { useAppPersistStore, useAppStore } from '../src/store/app'
import { Profile } from 'next-auth'
import resetAuthData from '../src/lib/resetAuthData'

const TOAST = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
}

const WARNING = {
  ...TOAST,
  icon: 'ℹ️',
}

const SUCCESS = {
  ...TOAST,
  icon: '✅',
}

const ERROR = {
  ...TOAST,
  icon: '❌',
}

const WalletConnector: FC = () => {
  // zustand
  const profiles = useAppStore((state) => state.profiles)
  const currentProfile = useAppStore((state) => state.currentProfile)
  const authenticated = useAppStore((state) => state.authenticated)
  const setProfiles = useAppStore((state) => state.setProfiles)
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile)
  const setProfileId = useAppPersistStore((state) => state.setProfileId)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)
  // wagmi
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync, isLoading: signLoading } = useSignMessage({
    onError(error) {
      toast(error?.message, ERROR)
    },
  })

  const [
    loadChallenge,
    { error: errorChallenege, loading: challenegeLoading },
  ] = useLazyQuery(CHALLENGE_QUERY, {
    fetchPolicy: 'no-cache',
  })

  const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
    useMutation(AUTHENTICATE_MUTATION, {
      onCompleted: (data) => {
        console.log('Authenticated: ', data)
        toast('Authenticated', SUCCESS)
        setAuthenticated(true)
        // state.isAuthenticated = true
      },
    })

  const [getProfiles, { error: errorProfiles, loading: profilesLoading }] =
    useLazyQuery(GET_PROFILES, {
      onCompleted() {
        console.log('Get Profiles', `Got Profiles: maybe should be set here`)
      },
    })

  const handleSign = async () => {
    try {
      const challenge = await loadChallenge({
        variables: { request: { address } },
      })

      if (!challenge?.data?.challenge?.text)
        return toast('Something went wrong', ERROR)

      const signature = await signMessageAsync({
        message: challenge?.data?.challenge?.text,
      })

      const auth = await authenticate({
        variables: { request: { address, signature } },
      })

      if (auth?.data?.authenticate?.token !== null) {
        // state.isAuthenticated = true
        setAuthenticated(true)
        // TODO: Remove cookies in `resetAuthData.ts`
        Cookies.set('accessToken', auth.data.authenticate.accessToken)
        Cookies.set('refreshToken', auth.data.authenticate.refreshToken)
      }

      const request = { ownedBy: address }
      const { data: profilesData } = await getProfiles({
        variables: { request },
      })

      if (profilesData?.profiles?.items?.length === 0) {
        // state.profiles = []
        setProfiles([])
        toast("Wallet doesn't a Lens profile", WARNING)
      } else {
        const profiles = profilesData?.profiles?.items
          ?.slice()
          ?.sort((a: Profile, b: Profile) => Number(a.id) - Number(b.id))
          ?.sort((a: Profile, b: Profile) =>
            !(a.isDefault !== b.isDefault) ? 0 : a.isDefault ? -1 : 1
          )
        // state.profiles = profiles
        setProfiles(profiles)
        setCurrentProfile(profiles[0])
        console.log('Current Profile', profiles[0])
        setProfileId(profiles[0].id)
      }
    } catch (error) {
      toast(error?.message, ERROR)
      console.log(error)
    }
  }

  const handleDisconnect = async () => {
    disconnect()
    resetAuthData()
    setAuthenticated(false)
  }

  useEffect(() => {
    if (authenticated) {
      ;(async function () {
        try {
          const { data: profilesData } = await getProfiles({
            variables: { request: { ownedBy: address } },
          })
          if (profilesData?.profiles?.items?.length === 0) {
            console.log('No profiles')
            setProfiles([])
            // state.profiles = []
          } else {
            const profiles = profilesData?.profiles?.items
              ?.slice()
              ?.sort((a: Profile, b: Profile) => Number(a.id) - Number(b.id))
              ?.sort((a: Profile, b: Profile) =>
                !(a.isDefault !== b.isDefault) ? 0 : a.isDefault ? -1 : 1
              )
            console.log('Profiles DATA (sorted)', profiles)
            // state.profiles = profiles
            // state.currentUser = profiles[0]
            if (profiles !== undefined) {
              setProfiles(profiles)
              setCurrentProfile(profiles[0])
            }
          }
        } catch (e) {
          console.log('Fetch profile Error', e)
        }
      })()
    }
  }, [authenticated, address])

  if (!authenticated) {
    return (
      <div className="flex gap-4 flex-col sm:flex-row items-center justify-center">
        {signLoading || challenegeLoading || authLoading || profilesLoading ? (
          <button
            className="btn btn-md glass btn-secondary rounded-lg h-0.5 loading"
            disabled
            onClick={handleSign}
          >
            Sign in 🗳️
          </button>
        ) : (
          <button
            className="btn btn-md h shadow-lg glass btn-secondary rounded-lg "
            // disabled
            onClick={handleSign}
          >
            Sign in 🗳️
          </button>
        )}

        <ConnectButton
          chainStatus="none"
          accountStatus="full"
          showBalance={false}
        />
      </div>
    )
  } else {
    return (
      <div className="flex gap-4 flex-col sm:flex-row items-center justify-center">
        <button
          className="btn btn-md h shadow-lg glass btn-secondary rounded-lg "
          // disabled
          onClick={handleDisconnect}
        >
          Sign Out
        </button>

        <ConnectButton
          chainStatus="none"
          accountStatus="full"
          showBalance={false}
        />
      </div>
    )
  }
}

export default WalletConnector
