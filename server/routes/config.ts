import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const configSchema = z.object({
  githubToken: z.string().min(1),
  githubOrg: z.string().min(1),
  githubRepos: z.string().min(1),
  jiraUrl: z.string().optional(),
  jiraEmail: z.string().optional(),
  jiraApiToken: z.string().optional(),
  jiraProjectKey: z.string().optional(),
  linearApiKey: z.string().optional(),
  linearTeamId: z.string().optional(),
  slackBotToken: z.string().min(1),
  slackSigningSecret: z.string().min(1),
  slackChannelId: z.string().min(1),
  timezone: z.string().default('America/New_York'),
  sprintLengthDays: z.number().int().min(1).max(30).default(10),
  alertThresholdDays: z.number().int().min(1).default(3),
});

// Get user's configs
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.config.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        githubOrg: true,
        githubRepos: true,
        isActive: true,
        lastRunAt: true,
        nextRunAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ configs });
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

// Get single config
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.config.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }

    // Don't send sensitive tokens in full response
    const { passwordHash, ...safeConfig } = config as any;
    res.json({ config: safeConfig });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// Create config
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = configSchema.parse(req.body);

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const configCount = await prisma.config.count({
      where: { userId: req.userId },
    });

    // Free plan: 1 config, Pro: 5, Team: unlimited
    const limits: Record<string, number> = {
      FREE: 1,
      PRO: 5,
      TEAM: 999,
    };

    if (configCount >= limits[user.plan]) {
      res.status(403).json({
        error: `Plan limit reached. ${user.plan} plan allows ${limits[user.plan]} config(s). Upgrade to add more.`,
      });
      return;
    }

    const config = await prisma.config.create({
      data: {
        ...data,
        userId: req.userId!,
      },
    });

    res.status(201).json({ config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Create config error:', error);
    res.status(500).json({ error: 'Failed to create config' });
  }
});

// Update config
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = configSchema.partial().parse(req.body);

    const config = await prisma.config.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }

    const updated = await prisma.config.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ config: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Delete config
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.config.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }

    await prisma.config.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Config deleted' });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({ error: 'Failed to delete config' });
  }
});

export default router;

