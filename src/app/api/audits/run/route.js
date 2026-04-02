import prisma from '@/lib/prisma'
import { runAudit } from '@/lib/auditRunner'

export const maxDuration = 60 // Allow up to 60s for Vercel serverless

export async function POST(request) {
  const body = await request.json()
  const { companyId } = body

  if (!companyId) {
    return Response.json({ error: 'companyId is required' }, { status: 400 })
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { firm: true },
  })

  if (!company) {
    return Response.json({ error: 'Company not found' }, { status: 404 })
  }

  try {
    const auditResults = await runAudit(company.name, company.website)

    const audit = await prisma.audit.create({
      data: {
        companyId: company.id,
        ...auditResults,
      },
    })

    // Update company website if we found one
    if (auditResults.rawResearch?.websiteUrl && !company.website) {
      await prisma.company.update({
        where: { id: company.id },
        data: { website: auditResults.rawResearch.websiteUrl },
      })
    }

    return Response.json(audit)
  } catch (error) {
    console.error(`[Audit Error] ${company.name}:`, error)
    return Response.json(
      { error: `Audit failed: ${error.message}` },
      { status: 500 }
    )
  }
}
