import React from 'react'
import { useDebounce } from 'use-debounce'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
} from 'wagmi'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import DaoBoxTemplateABI from '../abis/DaoBoxTemplateABI.json'

// [DAO Box Voting Base](https://dashboard.tenderly.co/contract/mumbai/0x1fbc0e91aab655206ae7ecef345528edb571a91c)
// [DAO Box Factory](https://dashboard.tenderly.co/contract/mumbai/0x9AC4B1A42b32185bfC0dA828AA12f37769309bA0)
// [NFT Factory](https://dashboard.tenderly.co/contract/mumbai/0x6F1F888938a03432ca4AAB4503A971c301F605b3)

export function CreateDaoCard() {
  const { address } = useAccount()
  const [daoName, setDaoName] = React.useState('')
  const [tokenAddress, setTokenAddress] = React.useState('')
  const [tokenSymbol, setTokenSymbol] = React.useState('')
  const debouncedDaoName = useDebounce(daoName, 500)
  const debouncedTokenAddress = useDebounce(tokenAddress, 500)
  const debouncedTokenSymbol = useDebounce(tokenSymbol, 500)
  const addRecentTransaction = useAddRecentTransaction()

  // DAO Settings
  const FACTORY_ADDRESS = '0x9AC4B1A42b32185bfC0dA828AA12f37769309bA0'
  // const VOTING_TOKEN = '0x6f4bd5602d1e45e80190bdc43ba9e2bdff18759e'
  const ONE_TOKEN = ethers.utils.parseEther('1')
  const FIFTY_PERCENT = ethers.utils.parseEther('0.5')
  const FIVE_PERCENT = ethers.utils.parseEther('0.05')
  const THREE_MINUTES = 180
  const args = [
    tokenAddress,
    address,
    debouncedDaoName[0],
    [address],
    [ONE_TOKEN],
    [FIFTY_PERCENT, FIVE_PERCENT, THREE_MINUTES],
  ]

  const { config } = usePrepareContractWrite({
    addressOrName: FACTORY_ADDRESS,
    contractInterface: DaoBoxTemplateABI,
    functionName: 'newInstance',
    args,
    enabled: isReadyToTransact(),
  })
  const { data, writeAsync, error } = useContractWrite(config)

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log('success', data)
      toast.success('DAO Created')
      addRecentTransaction({
        hash: data.transactionHash,
        description: 'DAO Created',
      })
    },
    onError(error) {
      console.log('error', error)
      toast.error('Failed to create DAO')
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    logTxSettings()
    const promise = writeAsync?.()
    if (promise) {
      toast.promise(promise, {
        loading: 'Loading',
        success: 'Transaction Submitted',
        error: 'Transaction Submission failed',
      })
    }
  }

  return (
    <div className="card w-96 shadow-xl p-4">
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="flex flex-col py-10 justify-center align-middle space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">DAO NAME</span>
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full "
              value={daoName}
              onChange={(e) => setDaoName(e.target.value)}
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Follow NFT Address</span>
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
          <div className="flex align-middle justify-center w-full">
            <button
              disabled={!writeAsync || isLoading}
              className="btn btn-primary"
            >
              Create DAO
            </button>
          </div>
        </div>
      </form>
    </div>
  )

  function logTxSettings() {
    console.group('Create DAO')
    console.log('DAO Name:', debouncedDaoName[0])
    console.log('Token Address:', debouncedTokenAddress[0])
    console.log('Token Symbol:', debouncedTokenSymbol[0])
    console.log('Address:', address)
    console.log('error', error)
    console.groupEnd()
  }

  function isReadyToTransact(): boolean | undefined {
    return debouncedDaoName[0] && debouncedTokenAddress[0] && address
      ? true
      : false
  }
}
