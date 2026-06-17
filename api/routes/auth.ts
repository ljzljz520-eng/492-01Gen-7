import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import type { ApiResponse, LoginRequest, LoginResponse, Worker } from '../../shared/types.js';

const router = Router();

router.post('/login', (req: Request, res: Response<ApiResponse<LoginResponse>>) => {
  try {
    const { workerNo, password }: LoginRequest = req.body;

    if (!workerNo || !password) {
      return res.status(400).json({
        success: false,
        error: '工号和密码不能为空',
      });
    }

    const workers = db.where('workers', { workerNo, password });
    const worker = workers[0] as Worker | undefined;

    if (!worker) {
      return res.status(401).json({
        success: false,
        error: '工号或密码错误',
      });
    }

    const token = Buffer.from(`${worker.id}:${Date.now()}`).toString('base64');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...workerWithoutPassword } = worker;

    return res.json({
      success: true,
      data: {
        worker: workerWithoutPassword as Omit<Worker, 'password'>,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '登录失败',
    });
  }
});

export default router;
