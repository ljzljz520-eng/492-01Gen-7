import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { generateId } from '../../shared/utils.js';
import type { ApiResponse, Process } from '../../shared/types.js';

const router = Router();

router.post('/', (req: Request, res: Response<ApiResponse<Process>>) => {
  try {
    const { styleId, processName, unitPrice, sortOrder } = req.body;

    if (!styleId || !processName) {
      return res.status(400).json({
        success: false,
        error: '款号ID和工序名称不能为空',
      });
    }

    const existingStyle = db.get('styles', styleId);
    if (!existingStyle) {
      return res.status(400).json({
        success: false,
        error: '款号不存在',
      });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const newProcess: Process = {
      id,
      styleId,
      processName,
      unitPrice: unitPrice || 0,
      sortOrder: sortOrder || 1,
      createdAt: now,
    };

    db.insert('processes', newProcess);

    return res.status(201).json({
      success: true,
      data: newProcess,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建工序失败',
    });
  }
});

router.put('/:id', (req: Request, res: Response<ApiResponse<Process>>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);
    const { processName, unitPrice, sortOrder } = req.body;

    const existingProcess = db.get('processes', idStr) as Process | undefined;
    if (!existingProcess) {
      return res.status(404).json({
        success: false,
        error: '工序不存在',
      });
    }

    const updateData: Partial<Process> = {
      processName: processName || existingProcess.processName,
      unitPrice: unitPrice !== undefined ? unitPrice : existingProcess.unitPrice,
      sortOrder: sortOrder !== undefined ? sortOrder : existingProcess.sortOrder,
    };

    const updatedProcess = db.update('processes', idStr, updateData) as Process;

    return res.json({
      success: true,
      data: updatedProcess,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新工序失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);

    const existingProcess = db.get('processes', idStr);
    if (!existingProcess) {
      return res.status(404).json({
        success: false,
        error: '工序不存在',
      });
    }

    db.delete('processes', idStr);

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除工序失败',
    });
  }
});

export default router;
