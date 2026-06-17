import { db, initDatabase } from './db.js';
import type { Style, Process, Worker, ProductionRecord, Subsidy } from '../shared/types.js';
import { calculateRecordAmount } from '../shared/utils.js';

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

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateMockData() {
  initDatabase();
  
  if (db.all('styles').length > 0) {
    console.log('Mock data already exists, skipping initialization');
    return;
  }

  console.log('Generating mock data...');

  const styles: Style[] = [];
  const processes: Process[] = [];
  const workers: Worker[] = [];

  styleData.forEach((s, styleIndex) => {
    const styleId = `style_${styleIndex + 1}`;
    const style: Style = {
      id: styleId,
      styleNo: s.styleNo,
      styleName: s.styleName,
      description: `${s.styleName}款式`,
      createdAt: '2024-01-01',
    };
    styles.push(style);
    db.insert('styles', style);

    const prices = processPrices[s.styleNo] || [];
    s.processes.forEach((processName, index) => {
      const process: Process = {
        id: `process_${styleIndex * 10 + index + 1}`,
        styleId,
        processName,
        unitPrice: prices[index] || 0.5,
        sortOrder: index + 1,
        createdAt: '2024-01-01',
      };
      processes.push(process);
      db.insert('processes', process);
    });
  });

  const leader: Worker = {
    id: 'leader_1',
    workerNo: 'admin',
    name: '王组长',
    role: 'leader',
    password: '123456',
    createdAt: '2024-01-01',
  };
  workers.push(leader);
  db.insert('workers', leader);

  workerNames.forEach((name, index) => {
    const worker: Worker = {
      id: `worker_${index + 1}`,
      workerNo: String(index + 1).padStart(3, '0'),
      name,
      role: 'worker',
      password: '123456',
      createdAt: '2024-01-01',
    };
    workers.push(worker);
    db.insert('workers', worker);
  });

  const now = new Date();
  const productionTypes: Array<'normal' | 'rework' | 'material_shortage' | 'quality_fail'> = [
    'normal', 'normal', 'normal', 'normal', 'normal',
    'normal', 'normal', 'normal', 'rework', 'material_shortage',
  ];

  const todayDate = new Date().toISOString().split('T')[0];

  for (let day = 1; day <= now.getDate(); day++) {
    const date = formatDate(new Date(now.getFullYear(), now.getMonth(), day));

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
          const amount = calculateRecordAmount(quantity, process.unitPrice, type);

          const record: ProductionRecord = {
            id: generateId(),
            workerId: worker.id,
            processId: process.id,
            styleId: style.id,
            quantity,
            productionType: type,
            unitPrice: process.unitPrice,
            amount,
            date,
            remark: '',
            createdAt: todayDate,
          };
          db.insert('productionRecords', record);
        }
      });
  }

  workers
    .filter((w) => w.role === 'worker')
    .slice(0, 5)
    .forEach((worker) => {
      const subsidy1: Subsidy = {
        id: generateId(),
        name: '全勤奖',
        type: 'bonus',
        amount: 200,
        workerId: worker.id,
        date: formatDate(new Date(now.getFullYear(), now.getMonth(), 15)),
        remark: '本月全勤',
        createdAt: todayDate,
      };
      db.insert('subsidies', subsidy1);

      if (Math.random() > 0.5) {
        const subsidy2: Subsidy = {
          id: generateId(),
          name: '伙食补贴',
          type: 'allowance',
          amount: 150,
          workerId: worker.id,
          date: formatDate(new Date(now.getFullYear(), now.getMonth(), 20)),
          remark: '',
          createdAt: todayDate,
        };
        db.insert('subsidies', subsidy2);
      }
    });

  console.log('Mock data generated successfully');
}
