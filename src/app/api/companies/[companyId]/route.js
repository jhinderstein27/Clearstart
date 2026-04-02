import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  const { companyId } = await params
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      firm: true,
      audits: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })
  if (!company) return Response.json({ error: 'Company not found' }, { status: 404 })
  return Response.json(company)
}
