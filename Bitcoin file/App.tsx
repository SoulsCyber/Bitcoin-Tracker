import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'

interface Coin {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  market_cap: number
  market_cap_rank: number
  market_cap_change_percentage_24h?: number
  total_volume: number
  high_24h: number
  low_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number | null
  ath: number
  ath_date: string
  atl: number
  atl_date: string
  image: string
  description?: string
}

function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              sparkline: false,
            },
          }
        )
        setCoins(response.data)
      } catch (error) {
        console.error('Error fetching coins:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
    const interval = setInterval(fetchCoins, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    )
  }

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CoinCard = ({ coin }: { coin: Coin }) => (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold">{coin.name}</h2>
            <p className="text-gray-400 uppercase">#{coin.market_cap_rank} {coin.symbol}</p>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite(coin.id)}
          className="text-yellow-500 hover:text-yellow-400"
        >
          <StarIcon className={`w-6 h-6 ${favorites.includes(coin.id) ? 'fill-current' : 'stroke-current fill-none'}`} />
        </button>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">
          ${coin.current_price.toLocaleString()}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center">
            {coin.price_change_percentage_1h_in_currency > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-1 text-sm ${coin.price_change_percentage_1h_in_currency > 0 ? 'text-green-500' : 'text-red-500'}`}>
              1h: {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center">
            {coin.price_change_percentage_24h > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-1 text-sm ${coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
              24h: {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-gray-400 text-sm">
            Market Cap: ${(coin.market_cap / 1000000).toFixed(2)}M
          </p>
          <p className="text-gray-400 text-sm">
            Volume 24h: ${(coin.total_volume / 1000000).toFixed(2)}M
          </p>
          <p className="text-gray-400 text-sm">
            Supply: {(coin.circulating_supply / 1000000).toFixed(2)}M / {coin.max_supply ? (coin.max_supply / 1000000).toFixed(2) + 'M' : '∞'}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate(`/coin/${coin.id}`)}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        View Details
      </button>
    </div>
  )

  const CoinDetail = ({ coinId }: { coinId: string }) => {
    const [coin, setCoin] = useState<Coin | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchCoinDetail = async () => {
        try {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}`
          )
          setCoin(response.data)
        } catch (error) {
          console.error('Error fetching coin details:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchCoinDetail()
    }, [coinId])

    if (loading) {
      return <div className="text-white text-2xl">Loading...</div>
    }

    if (!coin) {
      return <div className="text-white text-2xl">Coin not found</div>
    }

    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-full" />
          <div>
            <h1 className="text-3xl font-bold">{coin.name}</h1>
            <p className="text-gray-400 uppercase">#{coin.market_cap_rank} {coin.symbol}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Price Information</h2>
              <p className="text-3xl font-bold mb-2">
                ${coin.current_price?.toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">1h Change</p>
                  <p className={coin.price_change_percentage_1h_in_currency > 0 ? 'text-green-500' : 'text-red-500'}>
                    {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">24h Change</p>
                  <p className={coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}>
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">7d Change</p>
                  <p className={coin.price_change_percentage_7d_in_currency > 0 ? 'text-green-500' : 'text-red-500'}>
                    {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">30d Change</p>
                  <p className={coin.price_change_percentage_30d_in_currency > 0 ? 'text-green-500' : 'text-red-500'}>
                    {coin.price_change_percentage_30d_in_currency?.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Market Data</h2>
              <div className="space-y-2">
                <p className="text-gray-400">
                  Market Cap: <span className="text-white">${(coin.market_cap / 1000000).toFixed(2)}M</span>
                </p>
                <p className="text-gray-400">
                  Market Cap Change 24h: <span className={coin.market_cap_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}>
                    {coin.market_cap_change_percentage_24h?.toFixed(2)}%
                  </span>
                </p>
                <p className="text-gray-400">
                  24h Volume: <span className="text-white">${(coin.total_volume / 1000000).toFixed(2)}M</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Supply Information</h2>
              <div className="space-y-2">
                <p className="text-gray-400">
                  Circulating Supply: <span className="text-white">{(coin.circulating_supply / 1000000).toFixed(2)}M</span>
                </p>
                <p className="text-gray-400">
                  Total Supply: <span className="text-white">{(coin.total_supply / 1000000).toFixed(2)}M</span>
                </p>
                <p className="text-gray-400">
                  Max Supply: <span className="text-white">{coin.max_supply ? (coin.max_supply / 1000000).toFixed(2) + 'M' : '∞'}</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">All Time Stats</h2>
              <div className="space-y-2">
                <p className="text-gray-400">
                  All Time High: <span className="text-white">${coin.ath?.toLocaleString()}</span>
                  <br />
                  <span className="text-sm">({new Date(coin.ath_date).toLocaleDateString()})</span>
                </p>
                <p className="text-gray-400">
                  All Time Low: <span className="text-white">${coin.atl?.toLocaleString()}</span>
                  <br />
                  <span className="text-sm">({new Date(coin.atl_date).toLocaleDateString()})</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to List
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <h1 className="text-4xl font-bold">🚀 Meme Coin Tracker</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg pl-10 w-full md:w-64"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoins.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </div>
            }
          />
          <Route path="/coin/:coinId" element={<CoinDetail coinId={window.location.pathname.split('/').pop() || ''} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 