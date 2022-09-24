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
import companyTemplateAbi from '../abis/companyTemplate.json'

export function CreateDaoCard() {
  const { address } = useAccount()
  const [daoName, setDaoName] = React.useState('')
  const [tokenName, setTokenName] = React.useState('')
  const [tokenSymbol, setTokenSymbol] = React.useState('')
  const debouncedDaoName = useDebounce(daoName, 500)
  const debouncedTokenName = useDebounce(tokenName, 500)
  const debouncedTokenSymbol = useDebounce(tokenSymbol, 500)
  const addRecentTransaction = useAddRecentTransaction()

  // DAO Settings
  const FACTORY_ADDRESS = '0xBc0BacC84F956Cd66399eeC8d974737FBB03755D'
  const ONE_TOKEN = ethers.utils.parseEther('1')
  const FIFTY_PERCENT = ethers.utils.parseEther('0.5')
  const FIVE_PERCENT = ethers.utils.parseEther('0.05')
  const THREE_MINUTES = 180
  const FINANCE_PERIOD = 0
  const AGENT = true
  const args = [
    debouncedTokenName[0],
    debouncedTokenSymbol[0],
    debouncedDaoName[0],
    [address],
    [ONE_TOKEN],
    [FIFTY_PERCENT, FIVE_PERCENT, THREE_MINUTES],
    FINANCE_PERIOD,
    AGENT,
  ]

  const { config } = usePrepareContractWrite({
    addressOrName: FACTORY_ADDRESS,
    contractInterface: companyTemplateAbi,
    functionName: 'newTokenAndInstance',
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
              <span className="label-text">Token Name</span>
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
          </div>
          <div className="form-control w-full ">
            <label className="label">
              <span className="label-text">Token Symbol</span>
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full "
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
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
    console.log('Token Name:', debouncedTokenName[0])
    console.log('Token Symbol:', debouncedTokenSymbol[0])
    console.log('Address:', address)
    console.log('error', error)
    console.groupEnd()
  }

  function isReadyToTransact(): boolean | undefined {
    return debouncedDaoName[0] &&
      debouncedTokenName[0] &&
      debouncedTokenSymbol[0] &&
      address
      ? true
      : false
  }
}
