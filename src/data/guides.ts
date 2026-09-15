import type { Guide } from '../types'

export const guides: Guide[] = [
  {
    id: 'rain-nanshan',
    title: '雨天南山室内半日',
    coverHint: '室内 · 南山',
    duration: '5 小时',
    budget: '人均 ¥40–90',
    weather: '降雨概率高时用',
    stops: ['南山博物馆或设计互联', '中心书城/商场咖啡', '海上世界看海（雨停再出）'],
    pitfall: '别把户外市集留在 Plan A，深圳对流雨来得快。',
    body: '上午进馆，中午室内吃饭，下午看书或临展。雨势减小再去海边拍一张，就算完整周末。',
  },
  {
    id: 'wutong-newbie',
    title: '梧桐山新手线 + 下山吃饭',
    coverHint: '徒步 · 罗湖',
    duration: '7 小时',
    budget: '人均 ¥30–60',
    weather: '晴、体感 < 30℃',
    stops: ['桐山道上山', '早一点下山', '东门或太安附近补碳水化合物'],
    pitfall: '中午出发 + 只带 500ml 水，是最常见的劝退组合。',
    body: '7 点前到山脚。走熟悉的桐山道，不抄小路。下山别再安排展览，腿会拒绝。',
  },
  {
    id: 'oct-evening',
    title: '华侨城傍晚市集到夜景',
    coverHint: '市集 · 华侨城',
    duration: '6 小时',
    budget: '人均 ¥80–150',
    weather: '多云或晴，避开暴晒正午',
    stops: ['OCT-LOFT 市集/书店', '创意园晚饭', '欢乐海岸散步'],
    pitfall: '正午前在水泥地上拍到中暑，体验会从 8 分掉到 3 分。',
    body: '16:00 集合创意园，逛摊、听一场小现场或只是坐着。天黑后走到欢乐海岸收尾。',
  },
]
