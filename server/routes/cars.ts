import { Router } from 'express'
import { prisma } from '../prisma/client'

const router = Router()

router.get('/', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const cars = await prisma.car.findMany({
    where: { shopId },
    include: { client: true }
  })
  res.json(cars)
})

router.get('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const car = await prisma.car.findUnique({
    where: { id: req.params.id, shopId },
    include: { client: true, services: true }
  })
  res.json(car)
})

router.post('/', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const { clientId } = req.body
  const owner = await prisma.client.findUnique({ where: { id: clientId, shopId } })
  if (!owner) return res.status(400).json({ error: 'invalid_client' })
  const car = await prisma.car.create({ data: { ...req.body, shopId } })
  res.json(car)
})

router.put('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const car = await prisma.car.update({
    where: { id: req.params.id, shopId },
    data: { ...req.body, shopId }
  })
  res.json(car)
})

router.delete('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  await prisma.car.delete({ where: { id: req.params.id, shopId } })
  res.json({ success: true })
})

export default router
