import Exa from 'exa-js'

let exaClient = null

export function getExaClient() {
  if (!exaClient) {
    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) throw new Error('EXA_API_KEY environment variable is not set')
    exaClient = new Exa(apiKey)
  }
  return exaClient
}

// Search for company information
export async function searchCompany(companyName, query) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(`${companyName} ${query}`, {
    type: 'auto',
    numResults: 5,
    text: { maxCharacters: 2000 },
    livecrawl: 'fallback',
  })
  return results.results || []
}

// Fetch and analyze a specific URL
export async function fetchUrl(url) {
  const exa = getExaClient()
  try {
    const results = await exa.getContents([url], {
      text: { maxCharacters: 5000 },
    })
    return results.results?.[0] || null
  } catch {
    return null
  }
}

// Search for company website
export async function findCompanyWebsite(companyName) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(`${companyName} official website healthcare`, {
    type: 'auto',
    numResults: 3,
    text: { maxCharacters: 1000 },
    livecrawl: 'fallback',
  })
  return results.results?.[0]?.url || null
}

// Search for LinkedIn company page
export async function searchLinkedIn(companyName) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(
    `site:linkedin.com/company ${companyName} healthcare`,
    {
      type: 'auto',
      numResults: 3,
      text: { maxCharacters: 2000 },
      livecrawl: 'fallback',
    }
  )
  return results.results || []
}

// Search for news and press coverage
export async function searchNews(companyName) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(`${companyName} healthcare news announcement`, {
    type: 'neural',
    numResults: 5,
    text: { maxCharacters: 1500 },
    livecrawl: 'fallback',
  })
  return results.results || []
}

// Search for podcast appearances
export async function searchPodcasts(companyName, ceoName) {
  const exa = getExaClient()
  const query = ceoName
    ? `"${ceoName}" podcast healthcare`
    : `"${companyName}" podcast healthcare`
  const results = await exa.searchAndContents(query, {
    type: 'auto',
    numResults: 3,
    text: { maxCharacters: 1000 },
    livecrawl: 'fallback',
  })
  return results.results || []
}

// Search for job postings
export async function searchJobs(companyName) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(`${companyName} marketing job posting hiring`, {
    type: 'auto',
    numResults: 5,
    text: { maxCharacters: 1000 },
    livecrawl: 'fallback',
  })
  return results.results || []
}

// Search for advertising activity
export async function searchAds(companyName) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(
    `${companyName} healthcare advertising campaign marketing`,
    {
      type: 'auto',
      numResults: 3,
      text: { maxCharacters: 1000 },
      livecrawl: 'fallback',
    }
  )
  return results.results || []
}

// Search for conference presence
export async function searchConferences(companyName) {
  const exa = getExaClient()
  const results = await exa.searchAndContents(
    `${companyName} HIMSS ViVE HLTH AHIP conference speaker sponsor`,
    {
      type: 'auto',
      numResults: 3,
      text: { maxCharacters: 1000 },
      livecrawl: 'fallback',
    }
  )
  return results.results || []
}
