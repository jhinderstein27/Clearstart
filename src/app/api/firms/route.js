import prisma from '@/lib/prisma'

export async function GET() {
  const firms = await prisma.firm.findMany({
    include: {
      companies: {
        include: {
          audits: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })
  return Response.json(firms)
}

export async function POST(request) {
  const body = await request.json()
  const firm = await prisma.firm.create({
    data: {
      name: body.name,
      founded: body.founded || null,
      hq: body.hq || null,
      estimatedAum: body.estimatedAum || null,
      investmentStage: body.investmentStage || null,
      targetCompanySize: body.targetCompanySize || null,
      healthcareSubsectors: body.healthcareSubsectors || null,
      website: body.website || null,
      notableExits: body.notableExits || null,
      clearstartNotes: body.clearstartNotes || null,
    },
  })
  return Response.json(firm, { status: 201 })
}
