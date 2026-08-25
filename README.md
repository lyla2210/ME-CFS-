# Invisible Prison — ME/CFS 体验模拟器

一个关于 **ME/CFS（肌痛性脑脊髓炎 / 慢性疲劳综合征）** 的沉浸式感官体验项目，帮助健康人理解非恢复性睡眠、脑雾、延迟性 PEM 与「检查结果正常」带来的沟通困境。

在线体验：[me-cfs.vercel.app](https://me-cfs.vercel.app)

## 本地运行

**环境要求：** Node.js 18+

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:3000`。

## 构建与预览

```bash
npm run build
npm run preview
```

## 项目结构

| 路径 | 说明 |
|------|------|
| `/` | 首页：Hero → 空间地图 → 房间入口 |
| `/room/:id` | 各体验房间说明页 |
| `/simulation` | 四阶段完整模拟器 |

## 技术栈

React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · Motion · React Router

## 免责声明

本模拟器为共情教育体验，不能替代医学诊断，也不代表真实 ME/CFS 患者的全部感受。Stage 03 提供可选的轻度身体活动路径，请根据自身情况选择，不适时立即停止。
