import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { generateId } from '../../shared/utils.js';
import type { ApiResponse, Worker } from '../../shared/types.js';

const router = Router();

type WorkerWithoutPassword = Omit<Worker, 'password'>;

function excludePassword(worker: Worker): WorkerWithoutPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...rest } = worker;
  return rest;
}

router.get('/', (_req: Request, res: Response<ApiResponse<WorkerWithoutPassword[]>>) => {
  try {
    const workers = db.all('workers')
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .map((w) => excludePassword(w));

    return res.json({
      success: true,
      data: workers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取工人列表失败',
    });
  }
});

router.post('/', (req: Request, res: Response<ApiResponse<WorkerWithoutPassword>>) => {
  try {
    const { workerNo, name, role, password } = req.body;

    if (!workerNo || !name || !role || !password) {
      return res.status(400).json({
        success: false,
        error: '工号、姓名、角色和密码不能为空',
      });
    }

    if (!['leader', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: '角色必须是 leader 或 worker',
      });
    }

    const existingWorkers = db.where('workers', { workerNo });
    if (existingWorkers.length > 0) {
      return res.status(400).json({
        success: false,
        error: '工号已存在',
      });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const newWorker: Worker = {
      id,
      workerNo,
      name,
      role,
      password,
      createdAt: now,
    };

    db.insert('workers', newWorker);

    return res.status(201).json({
      success: true,
      data: excludePassword(newWorker),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建工人失败',
    });
  }
});

router.put('/:id', (req: Request, res: Response<ApiResponse<WorkerWithoutPassword>>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);
    const { workerNo, name, role, password } = req.body;

    const existingWorker = db.get('workers', idStr) as Worker | undefined;
    if (!existingWorker) {
      return res.status(404).json({
        success: false,
        error: '工人不存在',
      });
    }

    if (role && !['leader', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: '角色必须是 leader 或 worker',
      });
    }

    if (workerNo && workerNo !== existingWorker.workerNo) {
      const duplicateWorkers = db.where('workers', { workerNo }).filter((w) => w.id !== idStr);
      if (duplicateWorkers.length > 0) {
        return res.status(400).json({
          success: false,
          error: '工号已存在',
        });
      }
    }

    const updateData: Partial<Worker> = {
      workerNo: workerNo || existingWorker.workerNo,
      name: name || existingWorker.name,
      role: role || existingWorker.role,
      password: password || existingWorker.password,
    };

    const updatedWorker = db.update('workers', idStr, updateData) as Worker;

    return res.json({
      success: true,
      data: excludePassword(updatedWorker),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新工人失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);

    const existingWorker = db.get('workers', idStr);
    if (!existingWorker) {
      return res.status(404).json({
        success: false,
        error: '工人不存在',
      });
    }

    db.delete('workers', idStr);

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除工人失败',
    });
  }
});

export default router;
