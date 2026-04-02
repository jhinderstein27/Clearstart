import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  const { firmId } = await params
  const firm = await prisma.firm.findUnique({
    where: { id: firmId },
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
  })
  if (!firm) return Response.json({ error: 'Firm not found' }, { status: 404 })
  return Response.json(firm)
}

export async function DELETE(request, { params }) {
  const { firmId } = await params
  await prisma.firm.delete({ where: { id: firmId } })
  return Response.json({ success: true })
}
