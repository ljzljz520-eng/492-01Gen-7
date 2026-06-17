import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { generateId, calculateRecordAmount } from '../../shared/utils.js';
import type { ApiResponse, ProductionRecord, Process, BatchEntryRequest } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response<ApiResponse<ProductionRecord[]>>) => {
  try {
    const { workerId, dateFrom, dateTo, date } = req.query;

    let records = db.all('productionRecords') as ProductionRecord[];

    if (workerId) {
      records = records.filter(r => r.workerId === workerId);
    }

    if (date) {
      records = records.filter(r => r.date === date);
    } else {
      if (dateFrom) {
        records = records.filter(r => r.date >= dateFrom);
      }
      if (dateTo) {
        records = records.filter(r => r.date <= dateTo);
      }
    }

    records.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取生产记录失败',
    });
  }
});

router.post('/', (req: Request, res: Response<ApiResponse<ProductionRecord>>) => {
  try {
    const { workerId, processId, styleId, quantity, productionType, date, remark } = req.body;

    if (!workerId || !processId || !styleId || !quantity || !productionType || !date) {
      return res.status(400).json({
        success: false,
        error: '工人ID、工序ID、款号ID、数量、生产类型和日期不能为空',
      });
    }

    if (!['normal', 'rework', 'material_shortage', 'quality_fail'].includes(productionType)) {
      return res.status(400).json({
        success: false,
        error: '生产类型不合法',
      });
    }

    const process = db.get('processes', processId) as Process | undefined;
    if (!process) {
      return res.status(400).json({
        success: false,
        error: '工序不存在',
      });
    }

    const existingWorker = db.get('workers', workerId);
    if (!existingWorker) {
      return res.status(400).json({
        success: false,
        error: '工人不存在',
      });
    }

    const existingStyle = db.get('styles', styleId);
    if (!existingStyle) {
      return res.status(400).json({
        success: false,
        error: '款号不存在',
      });
    }

    const unitPrice = process.unitPrice;
    const amount = calculateRecordAmount(quantity, unitPrice, productionType);

    const id = generateId();
    const now = new Date().toISOString();

    const newRecord: ProductionRecord = {
      id,
      workerId,
      processId,
      styleId,
      quantity,
      productionType,
      unitPrice,
      amount,
      date,
      remark: remark || null,
      createdAt: now,
    };

    db.insert('productionRecords', newRecord);

    return res.status(201).json({
      success: true,
      data: newRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建生产记录失败',
    });
  }
});

router.post('/batch', (req: Request, res: Response<ApiResponse<ProductionRecord[]>>) => {
  try {
    const { styleId, processId, date, items, remark }: BatchEntryRequest = req.body;

    if (!styleId || !processId || !date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '款号ID、工序ID、日期和工人工序项不能为空',
      });
    }

    const process = db.get('processes', processId) as Process | undefined;
    if (!process) {
      return res.status(400).json({
        success: false,
        error: '工序不存在',
      });
    }

    const existingStyle = db.get('styles', styleId);
    if (!existingStyle) {
      return res.status(400).json({
        success: false,
        error: '款号不存在',
      });
    }

    const unitPrice = process.unitPrice;
    const now = new Date().toISOString();
    const createdRecords: ProductionRecord[] = [];

    for (const item of items) {
      const { workerId, quantity, productionType } = item;

      if (!workerId || !quantity || !productionType) {
        throw new Error('每项必须包含 workerId、quantity 和 productionType');
      }

      if (!['normal', 'rework', 'material_shortage', 'quality_fail'].includes(productionType)) {
        throw new Error(`生产类型不合法: ${productionType}`);
      }

      const existingWorker = db.get('workers', workerId);
      if (!existingWorker) {
        throw new Error(`工人不存在: ${workerId}`);
      }

      const amount = calculateRecordAmount(quantity, unitPrice, productionType);
      const id = generateId();

      const record: ProductionRecord = {
        id,
        workerId,
        processId,
        styleId,
        quantity,
        productionType,
        unitPrice,
        amount,
        date,
        remark: remark || null,
        createdAt: now,
      };

      db.insert('productionRecords', record);
      createdRecords.push(record);
    }

    return res.status(201).json({
      success: true,
      data: createdRecords,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '批量创建生产记录失败',
    });
  }
});

router.put('/:id', (req: Request, res: Response<ApiResponse<ProductionRecord>>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);
    const { workerId, processId, styleId, quantity, productionType, date, remark } = req.body;

    const existingRecord = db.get('productionRecords', idStr) as ProductionRecord | undefined;
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: '生产记录不存在',
      });
    }

    if (productionType && !['normal', 'rework', 'material_shortage', 'quality_fail'].includes(productionType)) {
      return res.status(400).json({
        success: false,
        error: '生产类型不合法',
      });
    }

    let unitPrice = existingRecord.unitPrice;
    const finalProcessId = processId || existingRecord.processId;

    if (processId && processId !== existingRecord.processId) {
      const process = db.get('processes', processId) as Process | undefined;
      if (!process) {
        return res.status(400).json({
          success: false,
          error: '工序不存在',
        });
      }
      unitPrice = process.unitPrice;
    }

    if (workerId && workerId !== existingRecord.workerId) {
      const existingWorker = db.get('workers', workerId);
      if (!existingWorker) {
        return res.status(400).json({
          success: false,
          error: '工人不存在',
        });
      }
    }

    if (styleId && styleId !== existingRecord.styleId) {
      const existingStyle = db.get('styles', styleId);
      if (!existingStyle) {
        return res.status(400).json({
          success: false,
          error: '款号不存在',
        });
      }
    }

    const finalQuantity = quantity !== undefined ? quantity : existingRecord.quantity;
    const finalProductionType = productionType || existingRecord.productionType;
    const amount = calculateRecordAmount(finalQuantity, unitPrice, finalProductionType);

    const updateData: Partial<ProductionRecord> = {
      workerId: workerId || existingRecord.workerId,
      processId: finalProcessId,
      styleId: styleId || existingRecord.styleId,
      quantity: finalQuantity,
      productionType: finalProductionType,
      unitPrice,
      amount,
      date: date || existingRecord.date,
      remark: remark !== undefined ? remark : existingRecord.remark,
    };

    const updatedRecord = db.update('productionRecords', idStr, updateData) as ProductionRecord;

    return res.json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新生产记录失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);

    const existingRecord = db.get('productionRecords', idStr);
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: '生产记录不存在',
      });
    }

    db.delete('productionRecords', idStr);

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除生产记录失败',
    });
  }
});

export default router;
