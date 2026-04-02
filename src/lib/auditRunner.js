import {
  searchCompany,
  fetchUrl,
  findCompanyWebsite,
  searchLinkedIn,
  searchNews,
  searchPodcasts,
  searchJobs,
  searchAds,
  searchConferences,
} from './exa'
import { calculateOverallScore, getTier, suggestServiceEntry } from './scorer'

// Run a full 9-category audit on a company
export async function runAudit(companyName, companyWebsite) {
  console.log(`[Audit] Starting audit for: ${companyName}`)

  // Gather research data in parallel
  const [
    websiteData,
    linkedInData,
    newsData,
    podcastData,
    jobsData,
    adsData,
    conferenceData,
    generalData,
  ] = await Promise.allSettled([
    companyWebsite ? fetchUrl(companyWebsite) : findCompanyWebsite(companyName).then((url) => url ? fetchUrl(url) : null),
    searchLinkedIn(companyName),
    searchNews(companyName),
    searchPodcasts(companyName),
    searchJobs(companyName),
    searchAds(companyName),
    searchConferences(companyName),
    searchCompany(companyName, 'healthcare marketing team leadership'),
  ])

  const research = {
    website: websiteData.status === 'fulfilled' ? websiteData.value : null,
    linkedIn: linkedInData.status === 'fulfilled' ? linkedInData.value : [],
    news: newsData.status === 'fulfilled' ? newsData.value : [],
    podcasts: podcastData.status === 'fulfilled' ? podcastData.value : [],
    jobs: jobsData.status === 'fulfilled' ? jobsData.value : [],
    ads: adsData.status === 'fulfilled' ? adsData.value : [],
    conferences: conferenceData.status === 'fulfilled' ? conferenceData.value : [],
    general: generalData.status === 'fulfilled' ? generalData.value : [],
  }

  // Score each category based on research signals
  const scores = {
    ...scoreTeamSignals(research),
    ...scoreBrandPositioning(research),
    ...scoreWebsiteDigital(research),
    ...scoreContentSocial(research),
    ...scoreThoughtLeadership(research),
    ...scoreIcpClarity(research),
    ...scoreDemandGen(research),
    ...scoreSalesEnablement(research),
    ...scoreCompetitiveDiff(research),
  }

  // Calculate overall
  const overallScore = calculateOverallScore(scores)
  const tier = getTier(overallScore)
  const suggestedService = suggestServiceEntry(scores)

  // Detect urgency signals
  const urgencySignals = detectUrgencySignals(research)

  // Determine outreach strategy
  const suggestedOutreach = overallScore <= 2.5 ? 'FIRM_FIRST' : 'DIRECT'

  return {
    ...scores,
    overallScore,
    tier,
    suggestedServiceEntry: suggestedService,
    urgencySignals,
    suggestedOutreach,
    outreachAngle: generateOutreachAngle(scores, tier, companyName),
    rawResearch: sanitizeResearch(research),
  }
}

// --- Category Scoring Functions ---

function scoreTeamSignals(research) {
  let score = 1
  const signals = []
  const allText = combineText(research)

  // Check for marketing roles
  const hasVPMarketing = /vp.*(marketing|growth)|chief marketing|cmo/i.test(allText)
  const hasMarketingManager = /marketing (manager|director|lead|coordinator)/i.test(allText)
  const hasMarketingTeam = /marketing team|marketing department/i.test(allText)
  const hasMarketingJobs = research.jobs.length > 0 && research.jobs.some((j) =>
    /marketing/i.test(j.text || j.title || '')
  )

  if (hasVPMarketing) {
    score = Math.max(score, 4)
    signals.push('Has VP/CMO-level marketing leadership')
  }
  if (hasMarketingManager) {
    score = Math.max(score, 3)
    signals.push('Has mid-level marketing role(s)')
  }
  if (hasMarketingTeam) {
    score = Math.max(score, 3)
    signals.push('References a marketing team')
  }
  if (hasMarketingJobs) {
    score = Math.max(score, 2)
    signals.push('Actively hiring for marketing roles (signals gap or growth)')
  }
  if (!hasVPMarketing && !hasMarketingManager && !hasMarketingTeam) {
    signals.push('No dedicated marketing function detected')
  }

  return {
    teamSignals: score,
    teamSignalsNotes: signals.join('. ') || 'Limited data available — no marketing team signals found.',
  }
}

function scoreBrandPositioning(research) {
  let score = 1
  const signals = []
  const websiteText = research.website?.text || ''

  if (!websiteText) {
    return {
      brandPositioning: 1,
      brandPositioningNotes: 'No website content accessible for evaluation.',
    }
  }

  // Check for clear value proposition
  const hasValueProp = websiteText.length > 200
  const hasIcpLanguage = /health plan|provider|hospital|payer|employer|patient|physician|clinician/i.test(websiteText)
  const hasClearMessaging = /we help|our mission|our platform|we (enable|empower|transform)/i.test(websiteText)
  const hasCaseStudy = /case study|success story|testimonial|results|outcomes/i.test(websiteText)

  if (hasValueProp) score = Math.max(score, 2)
  if (hasClearMessaging) {
    score = Math.max(score, 3)
    signals.push('Clear messaging framework present')
  }
  if (hasIcpLanguage) {
    score = Math.max(score, 3)
    signals.push('ICP-specific language on website')
  }
  if (hasCaseStudy) {
    score = Math.max(score, 4)
    signals.push('Case studies or proof points visible')
  }
  if (hasIcpLanguage && hasClearMessaging && hasCaseStudy) {
    score = Math.max(score, 4)
    signals.push('Strong brand positioning with proof points')
  }
  if (signals.length === 0) {
    signals.push('Website exists but messaging is generic or unclear')
  }

  return {
    brandPositioning: score,
    brandPositioningNotes: signals.join('. '),
  }
}

function scoreWebsiteDigital(research) {
  let score = 1
  const signals = []
  const websiteText = research.website?.text || ''

  if (!websiteText) {
    return {
      websiteDigital: 1,
      websiteDigitalNotes: 'No website content accessible for evaluation.',
    }
  }

  score = 2 // At minimum they have a website
  signals.push('Website is live and accessible')

  const hasCta = /demo|contact|get started|free trial|schedule|book a|request/i.test(websiteText)
  const hasBlog = /blog|insights|resources|articles|news/i.test(websiteText)
  const hasGatedContent = /download|whitepaper|guide|ebook|webinar|sign up/i.test(websiteText)

  if (hasCta) {
    score = Math.max(score, 3)
    signals.push('Clear CTA present (demo/contact/trial)')
  }
  if (hasBlog) {
    score = Math.max(score, 3)
    signals.push('Blog or content hub detected')
  }
  if (hasGatedContent) {
    score = Math.max(score, 4)
    signals.push('Gated content or lead capture infrastructure')
  }
  if (hasCta && hasBlog && hasGatedContent) {
    score = Math.max(score, 4)
    signals.push('Well-structured site with conversion infrastructure')
  }

  return {
    websiteDigital: score,
    websiteDigitalNotes: signals.join('. '),
  }
}

function scoreContentSocial(research) {
  let score = 1
  const signals = []

  const linkedInPresent = research.linkedIn.length > 0
  const linkedInText = research.linkedIn.map((r) => r.text || '').join(' ')
  const hasLinkedInActivity = linkedInText.length > 200

  if (linkedInPresent) {
    score = Math.max(score, 2)
    signals.push('LinkedIn company page exists')
  }
  if (hasLinkedInActivity) {
    score = Math.max(score, 3)
    signals.push('Active LinkedIn presence with content')
  }

  // Check for thought leadership signals
  const hasThoughtContent = /thought leader|perspective|insight|opinion|trend/i.test(linkedInText)
  if (hasThoughtContent) {
    score = Math.max(score, 4)
    signals.push('Thought leadership content detected')
  }

  // Check blog from website
  const websiteText = research.website?.text || ''
  const hasBlogContent = /blog|article|post|insight/i.test(websiteText)
  if (hasBlogContent) {
    score = Math.max(score, 3)
    signals.push('Blog or content hub on website')
  }

  if (signals.length === 0) {
    signals.push('No social media presence or content activity detected')
  }

  return {
    contentSocial: score,
    contentSocialNotes: signals.join('. '),
  }
}

function scoreThoughtLeadership(research) {
  let score = 1
  const signals = []

  const newsCount = research.news.length
  const podcastCount = research.podcasts.length
  const conferenceCount = research.conferences.length

  if (newsCount > 0) {
    score = Math.max(score, 2)
    signals.push(`${newsCount} news mention(s) found`)

    // Check for quality press
    const newsText = research.news.map((n) => n.url || '').join(' ')
    const hasTradePress = /fierce|stat|healthaffairs|himss|beckershealthcare|modernhealthcare/i.test(newsText)
    if (hasTradePress) {
      score = Math.max(score, 4)
      signals.push('Coverage in healthcare trade press')
    }
  }

  if (podcastCount > 0) {
    score = Math.max(score, 3)
    signals.push(`${podcastCount} podcast appearance(s) found`)
  }

  if (conferenceCount > 0) {
    score = Math.max(score, 3)
    signals.push('Conference presence detected')
  }

  if (newsCount >= 3 && (podcastCount > 0 || conferenceCount > 0)) {
    score = Math.max(score, 4)
  }

  if (signals.length === 0) {
    signals.push('No press, podcast, or conference presence detected')
  }

  return {
    thoughtLeadership: score,
    thoughtLeadershipNotes: signals.join('. '),
  }
}

function scoreIcpClarity(research) {
  let score = 1
  const signals = []
  const websiteText = research.website?.text || ''
  const allText = combineText(research)

  const buyerTypes = {
    'health plan': /health plan|payer|insurer|managed care/i,
    'provider': /provider|hospital|health system|physician|clinician/i,
    'employer': /employer|self-insured|benefits/i,
    'pharma': /pharma|life science|biotech/i,
    'patient': /patient|consumer|member/i,
  }

  const detectedBuyers = Object.entries(buyerTypes)
    .filter(([, pattern]) => pattern.test(websiteText))
    .map(([type]) => type)

  if (detectedBuyers.length === 1) {
    score = Math.max(score, 4)
    signals.push(`Clear target buyer: ${detectedBuyers[0]}`)
  } else if (detectedBuyers.length > 1 && detectedBuyers.length <= 2) {
    score = Math.max(score, 3)
    signals.push(`Multiple buyer types targeted: ${detectedBuyers.join(', ')}`)
  } else if (detectedBuyers.length > 2) {
    score = Math.max(score, 2)
    signals.push(`Broad targeting across ${detectedBuyers.length} buyer types — may lack focus`)
  }

  const hasRoi = /roi|outcomes|savings|reduction|improvement|results/i.test(allText)
  if (hasRoi) {
    score = Math.max(score, Math.min(score + 1, 5))
    signals.push('ROI or outcomes-based messaging present')
  }

  const hasPmf = /case study|customer|client|partner|deployment/i.test(allText)
  if (hasPmf) {
    signals.push('Evidence of product-market fit (customer references)')
  }

  if (signals.length === 0) {
    signals.push('No clear ICP definition or buyer-specific messaging detected')
  }

  return {
    icpClarity: score,
    icpClarityNotes: signals.join('. '),
  }
}

function scoreDemandGen(research) {
  let score = 1
  const signals = []
  const websiteText = research.website?.text || ''

  const hasAds = research.ads.length > 0
  const hasGatedContent = /download|whitepaper|webinar|ebook|sign up|subscribe/i.test(websiteText)
  const hasEmailSignup = /newsletter|email|subscribe|stay updated/i.test(websiteText)
  const hasEvents = /webinar|event|conference|summit/i.test(websiteText)

  if (hasAds) {
    score = Math.max(score, 3)
    signals.push('Paid advertising activity detected')
  }
  if (hasGatedContent) {
    score = Math.max(score, 3)
    signals.push('Gated content or lead magnets present')
  }
  if (hasEmailSignup) {
    score = Math.max(score, 2)
    signals.push('Email capture / newsletter signup found')
  }
  if (hasEvents) {
    score = Math.max(score, 3)
    signals.push('Event or webinar presence detected')
  }

  if (hasAds && hasGatedContent && hasEvents) {
    score = Math.max(score, 4)
    signals.push('Multi-channel demand generation in place')
  }

  if (signals.length === 0) {
    signals.push('No demand generation activity detected')
  }

  return {
    demandGen: score,
    demandGenNotes: signals.join('. '),
  }
}

function scoreSalesEnablement(research) {
  let score = 1
  const signals = []
  const websiteText = research.website?.text || ''

  const hasCaseStudies = /case study|success story|testimonial|customer story/i.test(websiteText)
  const hasDemoFlow = /demo|request a demo|schedule|book a call|contact us/i.test(websiteText)
  const hasCollateral = /one-pager|brochure|roi calculator|comparison|pricing/i.test(websiteText)
  const hasCrm = /hubspot|salesforce|crm/i.test(websiteText)
  const hasConference = research.conferences.length > 0

  if (hasDemoFlow) {
    score = Math.max(score, 2)
    signals.push('Demo or contact flow present')
  }
  if (hasCaseStudies) {
    score = Math.max(score, 3)
    signals.push('Case studies or testimonials visible')
  }
  if (hasCollateral) {
    score = Math.max(score, 4)
    signals.push('Sales collateral materials found')
  }
  if (hasCrm) {
    score = Math.max(score, 3)
    signals.push('CRM infrastructure detectable')
  }
  if (hasConference) {
    score = Math.max(score, 3)
    signals.push('Conference presence detected')
  }

  if (signals.length === 0) {
    signals.push('No sales enablement infrastructure detected')
  }

  return {
    salesEnablement: score,
    salesEnablementNotes: signals.join('. '),
  }
}

function scoreCompetitiveDiff(research) {
  let score = 1
  const signals = []
  const websiteText = research.website?.text || ''

  const hasDiffLanguage = /only|first|unique|patent|proprietary|unlike|different/i.test(websiteText)
  const hasCategoryCreation = /category|redefin|pioneer|innovat|disrupt/i.test(websiteText)
  const hasSpecificClaims = /\d+%|\d+x|proven|validated|certified|award/i.test(websiteText)

  if (hasDiffLanguage) {
    score = Math.max(score, 3)
    signals.push('Differentiation language present on website')
  }
  if (hasCategoryCreation) {
    score = Math.max(score, 3)
    signals.push('Category creation or innovation signals')
  }
  if (hasSpecificClaims) {
    score = Math.max(score, 4)
    signals.push('Specific quantitative claims or proof points')
  }
  if (hasDiffLanguage && hasSpecificClaims) {
    score = Math.max(score, 4)
    signals.push('Clear differentiation with supporting evidence')
  }

  if (signals.length === 0) {
    signals.push('No clear competitive differentiation signals detected')
  }

  return {
    competitiveDiff: score,
    competitiveDiffNotes: signals.join('. '),
  }
}

// --- Helper Functions ---

function combineText(research) {
  const parts = []
  if (research.website?.text) parts.push(research.website.text)
  research.linkedIn.forEach((r) => parts.push(r.text || ''))
  research.news.forEach((r) => parts.push(r.text || ''))
  research.general.forEach((r) => parts.push(r.text || ''))
  research.jobs.forEach((r) => parts.push(r.text || ''))
  return parts.join(' ')
}

function detectUrgencySignals(research) {
  const signals = []
  const allText = combineText(research)

  if (/series [a-d]|raise|funding round|capital/i.test(allText)) {
    if (/plan|upcoming|seeking|preparing/i.test(allText)) {
      signals.push('PRE_RAISE')
    }
    if (/announced|closed|raised|secured/i.test(allText)) {
      signals.push('RECENT_RAISE')
    }
  }
  if (/exit|acquisition|ipo|going public/i.test(allText)) {
    signals.push('PRE_EXIT')
  }
  if (/new platform|recently (formed|launched|acquired)|inaugural/i.test(allText)) {
    signals.push('NEW_PLATFORM')
  }

  return signals
}

function generateOutreachAngle(scores, tier, companyName) {
  if (tier === 'RED') {
    return `${companyName} has significant marketing infrastructure gaps. Lead with a portfolio-level marketing maturity assessment for their PE sponsor, positioning Clearstart as a turnkey marketing partner that can build from scratch.`
  }
  if (tier === 'YELLOW') {
    return `${companyName} has foundational pieces in place but lacks strategic cohesion. Lead with a specific gap (their weakest category) and offer a 90-day sprint to close it. Position as an embedded extension of their team, not an outside agency.`
  }
  if (tier === 'GREEN') {
    return `${companyName} has solid marketing basics. Focus on acceleration — content velocity, demand gen optimization, or thought leadership amplification. Position Clearstart as a growth catalyst, not a fixer.`
  }
  return `${companyName} is a high performer. Consider a narrow engagement around a specific initiative (rebrand for exit, conference strategy, or executive thought leadership program).`
}

function sanitizeResearch(research) {
  // Trim research data to avoid storing excessive content
  return {
    websiteUrl: research.website?.url || null,
    websiteSnippet: (research.website?.text || '').slice(0, 1000),
    linkedInUrls: research.linkedIn.map((r) => r.url).filter(Boolean),
    newsUrls: research.news.map((r) => ({ url: r.url, title: r.title })),
    podcastUrls: research.podcasts.map((r) => ({ url: r.url, title: r.title })),
    jobUrls: research.jobs.map((r) => r.url).filter(Boolean),
    conferenceUrls: research.conferences.map((r) => r.url).filter(Boolean),
  }
}
