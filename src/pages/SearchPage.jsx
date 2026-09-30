import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  checkIfFollowing,
  followUser as followUserApi,
  searchUsers,
  unfollowUser as unfollowUserApi,
} from '../api/api.js'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 12

const INITIAL_PAGINATION = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'photographer', label: 'Photographers' },
  { value: 'studio', label: 'Studios' },
]

const formatCount = (value) => {
  const num = Number(value || 0)
  if (!Number.isFinite(num)) return '0'
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}

const getInitials = (user) => {
  const first = user?.firstName?.[0] || ''
  const last = user?.lastName?.[0] || ''

  if (first || last) return `${first}${last}`.toUpperCase()

  return (user?.username?.[0] || 'U').toUpperCase()
}

const buildDisplayName = (user) => {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  return fullName || user?.username || 'Unknown user'
}

const SearchPage = () => {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user.user)
  const currentUserId = String(currentUser?.id || currentUser?._id || '')
  const currentUsername = String(currentUser?.username || '').trim().toLowerCase()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [role, setRole] = useState('all')

  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [pagination, setPagination] = useState({ ...INITIAL_PAGINATION })

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [followStatusMap, setFollowStatusMap] = useState({})
  const [followLoadingMap, setFollowLoadingMap] = useState({})

  const requestIdRef = useRef(0)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 350)

    return () => clearTimeout(timerId)
  }, [query])

  const fetchUsers = useCallback(async ({ targetPage = 1, append = false } = {}) => {
    const isLoadMore = append && targetPage > 1

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError('')
    }

    const requestId = ++requestIdRef.current

    try {
      const response = await searchUsers(debouncedQuery, {
        page: targetPage,
        limit: PAGE_SIZE,
        role: role === 'all' ? undefined : role,
      })

      if (requestId !== requestIdRef.current) return

      const incomingUsers = Array.isArray(response?.users) ? response.users : []

      if (append) {
        setUsers((prev) => {
          const merged = [...prev]
          const seen = new Set(prev.map((item) => String(item?._id)))

          for (const user of incomingUsers) {
            const id = String(user?._id)
            if (!seen.has(id)) {
              seen.add(id)
              merged.push(user)
            }
          }

          return merged
        })
      } else {
        setUsers(incomingUsers)
      }

      setPagination({
        total: Number(response?.pagination?.total || 0),
        page: Number(response?.pagination?.page || targetPage),
        limit: Number(response?.pagination?.limit || PAGE_SIZE),
        totalPages: Number(response?.pagination?.totalPages || 0),
        hasNextPage: Boolean(response?.pagination?.hasNextPage),
        hasPrevPage: Boolean(response?.pagination?.hasPrevPage),
      })

      setMeta(response?.meta || null)
      setError('')
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch users'
      setError(message)
      if (!append) {
        setUsers([])
        setPagination({ ...INITIAL_PAGINATION })
      }
    } finally {
      if (requestId !== requestIdRef.current) return
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }, [debouncedQuery, role])

  useEffect(() => {
    if (!debouncedQuery) {
      requestIdRef.current += 1
      setUsers([])
      setMeta(null)
      setPagination({ ...INITIAL_PAGINATION })
      setError('')
      setLoading(false)
      setLoadingMore(false)
      return
    }

    fetchUsers({ targetPage: 1, append: false })
  }, [debouncedQuery, fetchUsers])

  useEffect(() => {
    if (!currentUserId || users.length === 0 || !debouncedQuery) return

    let isCancelled = false

    const usersToCheck = users.filter((candidate) => {
      const targetId = String(candidate?._id || '')
      if (!targetId || targetId === currentUserId) return false
      return typeof followStatusMap[targetId] !== 'boolean'
    })

    if (usersToCheck.length === 0) return

    const loadFollowStatuses = async () => {
      const responses = await Promise.allSettled(
        usersToCheck.map(async (candidate) => {
          const targetId = String(candidate?._id || '')

          try {
            const response = await checkIfFollowing(targetId)
            return { targetId, isFollowing: Boolean(response?.isFollowing) }
          } catch {
            return { targetId, isFollowing: false }
          }
        })
      )

      if (isCancelled) return

      setFollowStatusMap((prev) => {
        const next = { ...prev }

        for (const item of responses) {
          if (item.status === 'fulfilled' && item.value?.targetId) {
            next[item.value.targetId] = item.value.isFollowing
          }
        }

        return next
      })
    }

    loadFollowStatuses()

    return () => {
      isCancelled = true
    }
  }, [currentUserId, debouncedQuery, followStatusMap, users])


  const handleViewProfile = (username) => {
    const normalizedUsername = String(username || '').trim().toLowerCase()
    if (!normalizedUsername) return

    if (normalizedUsername === currentUsername) {
      navigate('/profile/me')
      return
    }

    navigate(`/profile/${normalizedUsername}`)
  }

  const handleFollowToggle = useCallback(async (targetUserId) => {
    const normalizedTargetId = String(targetUserId || '')

    if (!normalizedTargetId || !currentUserId || normalizedTargetId === currentUserId) return
    if (followLoadingMap[normalizedTargetId]) return

    const currentlyFollowing = Boolean(followStatusMap[normalizedTargetId])
    const nextFollowingState = !currentlyFollowing
    const delta = nextFollowingState ? 1 : -1

    setFollowLoadingMap((prev) => ({
      ...prev,
      [normalizedTargetId]: true,
    }))

    setFollowStatusMap((prev) => ({
      ...prev,
      [normalizedTargetId]: nextFollowingState,
    }))

    setUsers((prev) => prev.map((candidate) => {
      if (String(candidate?._id) !== normalizedTargetId) return candidate

      return {
        ...candidate,
        followersCount: Math.max(0, Number(candidate?.followersCount || 0) + delta),
      }
    }))

    try {
      if (nextFollowingState) {
        await followUserApi(normalizedTargetId)
      } else {
        await unfollowUserApi(normalizedTargetId)
      }
    } catch (err) {
      setFollowStatusMap((prev) => ({
        ...prev,
        [normalizedTargetId]: currentlyFollowing,
      }))

      setUsers((prev) => prev.map((candidate) => {
        if (String(candidate?._id) !== normalizedTargetId) return candidate

        return {
          ...candidate,
          followersCount: Math.max(0, Number(candidate?.followersCount || 0) - delta),
        }
      }))

      const message = err?.response?.data?.message || err?.message || 'Unable to update follow status'
      setError(message)
    } finally {
      setFollowLoadingMap((prev) => {
        const next = { ...prev }
        delete next[normalizedTargetId]
        return next
      })
    }
  }, [currentUserId, followLoadingMap, followStatusMap])

  const handleLoadMore = () => {
    if (loadingMore || loading || !pagination.hasNextPage) return
    fetchUsers({ targetPage: pagination.page + 1, append: true })
  }

  const hasSearchTerm = Boolean(debouncedQuery)
  const isSearchingText = hasSearchTerm
    ? (loading ? 'Searching...' : `${pagination.total} result${pagination.total === 1 ? '' : 's'}`)
    : 'Type to search'
  const heading = hasSearchTerm ? `Results for “${debouncedQuery}”` : 'Find creators by name'

  return (
    <div className="w-full min-h-screen text-white px-4 md:px-8 py-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-wide">Search Creators</h1>
          <p className="text-sm text-gray-400">Connect with photographers and studios.</p>
        </div>

        <div className="w-full flex flex-col 2xl:flex-row gap-4 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username, first name, or last name..."
            className="w-2/3 bg-black text-white px-6 py-4 placeholder:text-gray-500 border-2 border-white transition-all duration-300 outline-none hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[6px_6px_0_white]"
          />

        
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-1/3 bg-black text-white px-6 py-4 border-2 border-white outline-none hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[6px_6px_0_white] transition-all duration-300"
            >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        
            </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <p>{heading}</p>
          <p>{isSearchingText}</p>
        </div>

        {hasSearchTerm && meta?.mode === 'discovery' && (
          <p className="text-xs text-cyan-300/80">
            Discovery mode active: showing top creators by your current filters.
          </p>
        )}

        {hasSearchTerm && error && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {hasSearchTerm && loading && users.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-22 border border-white/15 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {hasSearchTerm && !loading && users.length === 0 && !error && (
          <div className="text-center py-14 border border-white/15 rounded-2xl bg-black/30">
            <p className="text-lg font-semibold">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try another keyword or loosen filters.</p>
          </div>
        )}

        {hasSearchTerm && users.length > 0 && (
          <div className="space-y-3">
            {users.map((user) => {
              const userId = String(user?._id || '')
              const isCurrentUserCard = Boolean(currentUserId) && userId === currentUserId
              const hasKnownFollowStatus = typeof followStatusMap[userId] === 'boolean'
              const isFollowing = Boolean(followStatusMap[userId])
              const isFollowActionLoading = Boolean(followLoadingMap[userId])
              const canFollow = Boolean(currentUserId) && !isCurrentUserCard

              let followLabel = 'Follow'

              if (!currentUserId) {
                followLabel = 'Sign in'
              } else if (!hasKnownFollowStatus && !isCurrentUserCard) {
                followLabel = 'Checking...'
              } else if (isCurrentUserCard) {
                followLabel = 'You'
              } else if (isFollowActionLoading) {
                followLabel = 'Please wait...'
              } else {
                followLabel = isFollowing ? 'Following' : 'Follow'
              }

              return (
              <div
              onClick={() => handleViewProfile(user.username)}
                      style={{ cursor: 'pointer' }}
                key={user._id}
                className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-white/20 bg-black/40 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all duration-200"
              >
                <div 
                
                className="flex items-center gap-4 min-w-0">
                  {user.profilePic ? (
                    <img
                      
                      src={user.profilePic}
                      alt={user.username}
                      className="w-14 h-14 rounded-full object-cover border border-white/40"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full border border-white/40 flex items-center justify-center text-base font-bold">
                      {getInitials(user)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold truncate">{buildDisplayName(user)}</p>
                      {user.role && (
                        <span className="text-[10px] px-2 py-0.5 border border-white/40 text-white/90 rounded-full capitalize">{user.role}</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 truncate">@{user.username}</p>

                    {user.bio && (
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-xl">{user.bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 md:gap-3 text-xs md:text-sm text-gray-300 flex-wrap">
                  <span className="border border-white/20 px-2 py-1 rounded-full">✨ NL {formatCount(user.nlScore)}</span>
                  

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleFollowToggle(userId)
                    }}
                    disabled={!canFollow || isFollowActionLoading || (!hasKnownFollowStatus && !isCurrentUserCard)}
                    className={`px-3 py-1  transition ${
                      isCurrentUserCard
                        ? 'border-white/20 text-gray-400 cursor-default rounded-full '
                        : isFollowing
                          ? 'border-2 border-white shadow-[4px_4px_0_white] text-white font-semibold'
                          : 'border-2 border-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[4px_4px_0_white] text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed'
                    }`}
                  >
                    {followLabel}
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {hasSearchTerm && pagination.hasNextPage && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading more...' : 'Load more users'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage