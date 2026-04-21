import { Router } from 'express'
import { prisma } from '../prisma/client'

const router = Router()

// Listar todos
router.get('/', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const clients = await prisma.client.findMany({
    where: { shopId },
    include: { cars: true }
  })
  res.json(clients)
})

// Buscar um
router.get('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const client = await prisma.client.findUnique({
    where: { id: req.params.id, shopId },
    include: { cars: true, services: true }
  })
  res.json(client)
})

// Criar
router.post('/', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const client = await prisma.client.create({ data: { ...req.body, shopId } })
  res.json(client)
})

// Editar
router.put('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  const client = await prisma.client.update({
    where: { id: req.params.id, shopId },
    data: req.body
  })
  res.json(client)
})

// Deletar
router.delete('/:id', async (req, res) => {
  const shopId = req.user?.shopId
  if (!shopId) return res.status(401).json({ error: 'missing_tenant' })
  await prisma.client.delete({ where: { id: req.params.id, shopId } })
  res.json({ success: true })
})

export default router