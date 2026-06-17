import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { generateId } from '../../shared/utils.js';
import type { ApiResponse, Style, Process } from '../../shared/types.js';

const router = Router();

interface StyleWithProcesses extends Style {
  processes: Process[];
}

router.get('/', (_req: Request, res: Response<ApiResponse<StyleWithProcesses[]>>) => {
  try {
    const styles = db.all('styles').sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const processes = db.all('processes').sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
    });

    const stylesWithProcesses: StyleWithProcesses[] = styles.map((style) => ({
      ...style,
      processes: processes.filter((p) => p.styleId === style.id),
    }));

    return res.json({
      success: true,
      data: stylesWithProcesses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取款号列表失败',
    });
  }
});

router.post('/', (req: Request, res: Response<ApiResponse<Style>>) => {
  try {
    const { styleNo, styleName, description } = req.body;

    if (!styleNo || !styleName) {
      return res.status(400).json({
        success: false,
        error: '款号和款名不能为空',
      });
    }

    const existingStyles = db.where('styles', { styleNo });
    if (existingStyles.length > 0) {
      return res.status(400).json({
        success: false,
        error: '款号已存在',
      });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const newStyle: Style = {
      id,
      styleNo,
      styleName,
      description: description || null,
      createdAt: now,
    };

    db.insert('styles', newStyle);

    return res.status(201).json({
      success: true,
      data: newStyle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建款号失败',
    });
  }
});

router.put('/:id', (req: Request, res: Response<ApiResponse<Style>>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);
    const { styleNo, styleName, description } = req.body;

    const existingStyle = db.get('styles', idStr) as Style | undefined;
    if (!existingStyle) {
      return res.status(404).json({
        success: false,
        error: '款号不存在',
      });
    }

    if (styleNo && styleNo !== existingStyle.styleNo) {
      const duplicateStyles = db.where('styles', { styleNo }).filter((s) => s.id !== idStr);
      if (duplicateStyles.length > 0) {
        return res.status(400).json({
          success: false,
          error: '款号已存在',
        });
      }
    }

    const updateData: Partial<Style> = {
      styleNo: styleNo || existingStyle.styleNo,
      styleName: styleName || existingStyle.styleName,
      description: description !== undefined ? description : existingStyle.description,
    };

    const updatedStyle = db.update('styles', idStr, updateData) as Style;

    return res.json({
      success: true,
      data: updatedStyle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新款号失败',
    });
  }
});

router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const idStr = String(id);

    const existingStyle = db.get('styles', idStr);
    if (!existingStyle) {
      return res.status(404).json({
        success: false,
        error: '款号不存在',
      });
    }

    db.where('processes', { styleId: idStr }).forEach((p) => db.delete('processes', p.id));
    db.delete('styles', idStr);

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除款号失败',
    });
  }
});

export default router;
