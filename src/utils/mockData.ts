import type { Style, Process, Worker, ProductionRecord, Subsidy } from '@/types';
import { generateId, formatDate, getCurrentMonth } from './date';

const workerNames = [
  '张三', '李四', '王五', '赵六', '钱七',
  '孙八', '周九', '吴十', '郑十一', '王十二',
];

const styleData = [
  { styleNo: '2024A001', styleName: '夏季连衣裙', processes: ['裁剪', '缝纫前片', '缝纫后片', '装领', '装袖', '锁边', '整烫', '包装'] },
  { styleNo: '2024B002', styleName: '男士衬衫', processes: ['裁剪', '做领', '做袖', '装领', '装袖', '锁边', '整烫', '包装'] },
  { styleNo: '2024C003', styleName: '儿童T恤', processes: ['裁剪', '缝纫前片', '缝纫后片', '装领', '装袖', '锁边', '整烫', '包装'] },
];

const processPrices: Record<string, number[]> = {
  '2024A001': [0.8, 1.2, 1.0, 0.6, 0.9, 0.5, 0.7, 0.3],
  '2024B002': [0.7, 1.0, 0.8, 0.6, 0.8, 0.4, 0.6, 0.3],
  '2024C003': [0.5, 0.8, 0.7, 0.5, 0.6, 0.4, 0.5, 0.25],
};

export function generateMockStyles(): Style[] {
  return styleData.map((s, index) => ({
    id: `style_${index + 1}`,
    styleNo: s.styleNo,
    styleName: s.styleName,
    description: `${s.styleName}款式`,
    createdAt: '2024-01-01',
  }));
}

export function generateMockProcesses(styles: Style[]): Process[] {
  const processes: Process[] = [];
  let processId = 1;

  styles.forEach((style) => {
    const styleInfo = styleData.find((s) => s.styleNo === style.styleNo);
    const prices = processPrices[style.styleNo] || [];
    if (styleInfo) {
      styleInfo.processes.forEach((processName, index) => {
        processes.push({
          id: `process_${processId++}`,
          styleId: style.id,
          processName,
          unitPrice: prices[index] || 0.5,
          sortOrder: index + 1,
        });
      });
    }
  });

  return processes;
}

export function generateMockWorkers(): Worker[] {
  const workers: Worker[] = [
    {
      id: 'leader_1',
      workerNo: 'admin',
      name: '王组长',
      role: 'leader',
      password: '123456',
      createdAt: '2024-01-01',
    },
  ];

  workerNames.forEach((name, index) => {
    workers.push({
      id: `worker_${index + 1}`,
      workerNo: String(index + 1).padStart(3, '0'),
      name,
      role: 'worker',
      password: '123456',
      createdAt: '2024-01-01',
    });
  });

  return workers;
}

export function generateMockRecords(styles: Style[], processes: Process[], workers: Worker[]): ProductionRecord[] {
  const records: ProductionRecord[] = [];
  const now = new Date();
  const { year, month } = getCurrentMonth();
  const daysInMonth = new Date(year, month, 0).getDate();

  const productionTypes: Array<'normal' | 'rework' | 'material_shortage' | 'quality_fail'> = [
    'normal', 'normal', 'normal', 'normal', 'normal',
    'normal', 'normal', 'normal', 'rework', 'material_shortage',
  ];

  for (let day = 1; day <= now.getDate(); day++) {
    const dateStr = formatDate(new Date(year, month - 1, day));

    workers
      .filter((w) => w.role === 'worker')
      .forEach((worker) => {
        const numRecords = Math.floor(Math.random() * 4) + 1;

        for (let i = 0; i < numRecords; i++) {
          const style = styles[Math.floor(Math.random() * styles.length)];
          const styleProcesses = processes.filter((p) => p.styleId === style.id);
          if (styleProcesses.length === 0) continue;

          const process = styleProcesses[Math.floor(Math.random() * styleProcesses.length)];
          const type = productionTypes[Math.floor(Math.random() * productionTypes.length)];
          const quantity = Math.floor(Math.random() * 50) + 10;

          let ratio = 1;
          if (type === 'rework' || type === 'quality_fail') ratio = 0;
          if (type === 'material_shortage') ratio = 0.5;

          const amount = Number((quantity * process.unitPrice * ratio).toFixed(2));

          records.push({
            id: generateId(),
            workerId: worker.id,
            processId: process.id,
            styleId: style.id,
            quantity,
            productionType: type,
            unitPrice: process.unitPrice,
            amount,
            date: dateStr,
            remark: '',
            createdAt: dateStr,
          });
        }
      });
  }

  return records;
}

export function generateMockSubsidies(workers: Worker[]): Subsidy[] {
  const subsidies: Subsidy[] = [];
  const { year, month } = getCurrentMonth();

  workers
    .filter((w) => w.role === 'worker')
    .slice(0, 5)
    .forEach((worker) => {
      subsidies.push({
        id: generateId(),
        name: '全勤奖',
        type: 'bonus',
        amount: 200,
        workerId: worker.id,
        date: formatDate(new Date(year, month - 1, 15)),
        remark: '本月全勤',
      });

      if (Math.random() > 0.5) {
        subsidies.push({
          id: generateId(),
          name: '伙食补贴',
          type: 'allowance',
          amount: 150,
          workerId: worker.id,
          date: formatDate(new Date(year, month - 1, 20)),
          remark: '',
        });
      }
    });

  return subsidies;
}
