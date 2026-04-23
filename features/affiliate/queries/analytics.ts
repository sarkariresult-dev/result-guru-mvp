import { cache } from 'react'

export const getAffiliateAnalyticsSummary = cache(async () => {
    return {
        totalClicks: 0,
        uniqueProducts: 0,
        mostActiveNetwork: '-',
        deviceStats: [],
        clickGrowth: 0 
    }
})

export const getTopAffiliateProducts = cache(async (limit = 10) => {
    return []
})

export const getRecentAffiliateClicks = cache(async (limit = 50) => {
    return []
})

