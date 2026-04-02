require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const adapter = new PrismaPg(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

async function main() {
  const csvPath = path.join(__dirname, '..', 'data', 'clearstart_pe_firms.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`Found ${records.length} PE firms in CSV`)

  for (const row of records) {
    const firm = await prisma.firm.upsert({
      where: { id: slugify(row['PE Firm Name']) },
      update: {},
      create: {
        id: slugify(row['PE Firm Name']),
        name: row['PE Firm Name'],
        founded: row['Founded'] || null,
        hq: row['HQ'] || null,
        estimatedAum: row['Estimated AUM'] || null,
        investmentStage: row['Investment Stage'] || null,
        targetCompanySize: row['Target Company Size'] || null,
        healthcareSubsectors: row['Healthcare Sub-sectors'] || null,
        website: row['Website'] || null,
        notableExits: row['Notable Exits / Realized Investments'] || null,
        clearstartNotes: row['Clearstart Relevance Notes'] || null,
      },
    })

    // Parse portfolio companies from the CSV column
    const portfolioStr = row['Key Healthcare Portfolio Companies (Current)'] || ''
    const companies = portfolioStr
      .split(/,\s*(?![^(]*\))/) // split on commas not inside parentheses
      .map((c) => c.trim())
      .filter((c) => c.length > 0)

    for (const companyEntry of companies) {
      // Extract name and description (in parentheses)
      const match = companyEntry.match(/^(.+?)\s*\((.+)\)$/)
      const companyName = match ? match[1].trim() : companyEntry.trim()
      const description = match ? match[2].trim() : null

      await prisma.company.upsert({
        where: { id: slugify(companyName + '-' + firm.id) },
        update: {},
        create: {
          id: slugify(companyName + '-' + firm.id),
          name: companyName,
          firmId: firm.id,
          description: description,
          subsector: guessSubsector(description, companyName),
        },
      })
    }

    console.log(`  ${firm.name}: ${companies.length} portfolio companies`)
  }

  const firmCount = await prisma.firm.count()
  const companyCount = await prisma.company.count()
  console.log(`\nDone! ${firmCount} firms, ${companyCount} companies seeded.`)
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

function guessSubsector(description, name) {
  const text = ((description || '') + ' ' + (name || '')).toLowerCase()
  if (text.includes('staffing') || text.includes('workforce')) return 'Healthcare Staffing'
  if (text.includes('home') && (text.includes('health') || text.includes('care'))) return 'Home Health'
  if (text.includes('behavioral') || text.includes('mental health')) return 'Behavioral Health'
  if (text.includes('dental') || text.includes('orthodon')) return 'Dental'
  if (text.includes('urgent care') || text.includes('primary care')) return 'Primary/Urgent Care'
  if (text.includes('dermatol') || text.includes('aesthet') || text.includes('medspa')) return 'Aesthetics/Dermatology'
  if (text.includes('rcm') || text.includes('revenue cycle') || text.includes('billing')) return 'Revenue Cycle'
  if (text.includes('pharmacy') || text.includes('pharma')) return 'Pharmaceutical Services'
  if (text.includes('device') || text.includes('medical product') || text.includes('equipment')) return 'Medical Devices'
  if (text.includes('ehr') || text.includes('data') || text.includes('analytics') || text.includes('health it') || text.includes('software')) return 'Health IT'
  if (text.includes('oncology') || text.includes('cancer')) return 'Oncology'
  if (text.includes('eating disorder')) return 'Behavioral Health'
  if (text.includes('clinical trial') || text.includes('research')) return 'Clinical Research'
  if (text.includes('patient engagement') || text.includes('payment')) return 'Patient Engagement'
  if (text.includes('claims') || text.includes('compliance') || text.includes('audit')) return 'Health IT'
  if (text.includes('population health') || text.includes('value-based') || text.includes('vbc')) return 'Value-Based Care'
  return 'Healthcare Services'
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
