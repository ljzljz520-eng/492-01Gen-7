import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { generateId } from '../../shared/utils.js';
import type { ApiResponse, Subsidy } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response<ApiResponse<Subsidy[]>>) => {
  try {
    const { workerId, dateFrom, dateTo } = req.query;

    let subsidies = db.all('subsidies') as Subsidy[];

    if (workerId) {
      subsidies = subsidies.filter(s => s.workerId === workerId);
    }

    if (dateFrom) {
      subsidies = subsidies.filter(s => s.date >= dateFrom);
    }

    if (dateTo) {
      subsidies = subsidies.filter(s => s.date <= dateTo);
    }

    subsidies.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({
      success: true,
      data: subsidies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取补贴列表失败',
    });
  }
});

router.post('/', (req: Request, res: Response<ApiResponse<Subsidy>>) => {
  try {
    const { name, type, amount, workerId, date, remark } = req.body;

    if (!name || !type || amount === undefined || !date) {
      return res.status(400).json({
        success: false,
        error: '名称、类型、金额和日期不能为空',
      });
    }

    if (!['bonus', 'allowance', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '补贴类型不合法',
      });
    }

    if (workerId) {
      const existingWorker = db.get('workers', workerId);
      if (!existingWorker) {
        return res.status(400).json({
          success: false,
          error: '工人不存在',
        });
      }
    }

    const id = generateId();
    const now = new Date().toISOString();

    const newSubsidy: Subsidy = {
      id,
      name,
      type,
      amount,
      workerId: workerId || null,
      date,
      remark: remark || null,
      createdAt: now,
    };

    db.insert('subsidies', newSubsidy);

    return res.status(201).json({
      success: true,
      data: newSubsidy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建补贴失败',
    });
  }
});

router.put('/:id', (req: Request, res: Response<ApiResponse<Subsidy>>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);
    const { name, type, amount, workerId, date, remark } = req.body;

    const existingSubsidy = db.get('subsidies', idStr) as Subsidy | undefined;
    if (!existingSubsidy) {
      return res.status(404).json({
        success: false,
        error: '补贴不存在',
      });
    }

    if (type && !['bonus', 'allowance', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '补贴类型不合法',
      });
    }

    if (workerId && workerId !== existingSubsidy.workerId) {
      const existingWorker = db.get('workers', workerId);
      if (!existingWorker) {
        return res.status(400).json({
          success: false,
          error: '工人不存在',
        });
      }
    }

    const updateData: Partial<Subsidy> = {
      name: name || existingSubsidy.name,
      type: type || existingSubsidy.type,
      amount: amount !== undefined ? amount : existingSubsidy.amount,
      workerId: workerId !== undefined ? workerId : existingSubsidy.workerId,
      date: date || existingSubsidy.date,
      remark: remark !== undefined ? remark : existingSubsidy.remark,
    };

    const updatedSubsidy = db.update('subsidies', idStr, updateData) as Subsidy;

    return res.json({
      success: true,
      data: updatedSubsidy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新补贴失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);

    const existingSubsidy = db.get('subsidies', idStr);
    if (!existingSubsidy) {
      return res.status(404).json({
        success: false,
        error: '补贴不存在',
      });
    }

    db.delete('subsidies', idStr);

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除补贴失败',
    });
  }
});

export default router;
