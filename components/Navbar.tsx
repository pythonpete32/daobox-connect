import dynamic from 'next/dynamic'
import Link from 'next/link'

const ConnectButton = dynamic(() => import('./WalletConnector'), {
  ssr: false,
})

export function Navbar() {
  return (
    <div className="navbar bg-base-100  ">
      <div className="navbar-start justify-between w-full ">
        <div className="flex ">
          <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">DAO Box 🗳️</a>
          </Link>
            <div className="form-control">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered"
            />
          </div>
        </div>

        <div className="flex">
          <Link href="/aragon">
          <button className="btn btn-ghost">Aragon</button>
        </Link>
        </div>

        <div className="flex gap-2 px-2">
          <ConnectButton />
        </div>
      </div>
    </div>
  )
}
