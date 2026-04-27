import { PaymentStatus } from '@prisma/client'
import { Router } from 'express'
import { prisma } from '../prisma/client'
const router = Router()

function calcPayment(price: number, advanceAmount: number, payment: string): { payment: PaymentStatus, advanceAmount: number } {
  if (payment === 'adiantado') {
    if (advanceAmount >= price) return { payment: 'pago' as PaymentStatus, advanceAmount: price }
    return { payment: 'adiantado' as PaymentStatus, advanceAmount }
  }
  return { payment: payment as PaymentStatus, advanceAmount: 0 }
}

router.get('/', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const services = await prisma.service.findMany({
    where: { shopId },
    include: { car: true, client: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(services)
})

router.get('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const service = await prisma.service.findUnique({
    where: { id: req.params.id, shopId },
    include: { car: true, client: true }
  })
  res.json(service)
})

router.post('/', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const { title, description, carId, clientId, status, payment, price, advanceAmount, dueDate } = req.body
  const car = await prisma.car.findUnique({ where: { id: carId, shopId } })
  if (!car) return res.status(400).json({ error: 'invalid_car' })
  const client = await prisma.client.findUnique({ where: { id: clientId, shopId } })
  if (!client) return res.status(400).json({ error: 'invalid_client' })
  const adjusted = calcPayment(price, advanceAmount ?? 0, payment)
  const service = await prisma.service.create({
    data: {
      title, description, carId, clientId, shopId,
      status, price,
      payment: adjusted.payment,
      advanceAmount: adjusted.advanceAmount,
      dueDate: new Date(dueDate)
    }
  })
  res.json(service)
})

router.put('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const { title, description, carId, clientId, status, payment, price, advanceAmount, dueDate } = req.body
  const adjusted = calcPayment(price, advanceAmount ?? 0, payment)
  const service = await prisma.service.update({
    where: { id: req.params.id, shopId },
    data: {
      title, description, carId, clientId,
      status, price,
      payment: adjusted.payment,
      advanceAmount: adjusted.advanceAmount,
      dueDate: new Date(dueDate)
    },
    include: { car: true, client: true }
  })
  res.json(service)
})

router.delete('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  await prisma.service.delete({ where: { id: req.params.id, shopId } })
  res.json({ success: true })
})

export default router