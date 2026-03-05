# 人文地理 Chapter 1 单词背诵（Vite + React）

这是一个基于 Vite + React 的词汇背诵网页，词库来自 `public/data/ch1_vocab_cn_en_humangeo.json`。

## 视觉主题

- 简洁配色：低饱和深色背景 + 单一冷色强调。
- 重动效：分层入场、3D 翻面、题目/选项错峰过渡、反馈节奏动画。
- 玻璃拟态面板：高光边缘 + 柔和阴影 + 背景动态光斑。

## 学习模式

- 卡片模式：
  - 英文 -> 中文 / 中文 -> 英文 双向切换。
  - 支持显示答案、记住/未记住打点。
  - 卡片切换与答案揭示带动效。
- 测验模式：
  - 每题 4 个选项（1 正确 + 3 干扰）。
  - 回答后显示正确/错误反馈，再进入下一题。

## 数据与持久化

- 词库文件：`public/data/ch1_vocab_cn_en_humangeo.json`
- 进度存储：浏览器 `localStorage`
- 默认 key：`human-geography:chapter1:v1`

## 键盘快捷键

- 全局：`R` 切换翻译方向。
- 卡片模式：`空格` 显示答案/记住、`1` 记住、`2` 未记住、`←` 上一条、`→` 下一条。
- 测验模式：`1~4` 选答案，答题后 `空格` 或 `Enter` 下一题。

## 动效降级策略

- 自动读取 `prefers-reduced-motion`。
- 在 reduced 模式下保留状态变化，关闭 3D 翻面与高强度位移动画。
- 所有关键操作仍可通过键盘和按钮完成。

## 本地开发

```bash
npm install
npm run dev
```

## 验证与构建

```bash
npm run lint    # TypeScript 检查 (tsc --noEmit)
npm run build   # 生产构建，输出 dist/
npm run preview # 预览生产包
```

## 部署

该项目可直接部署到 Cloudflare Pages：

- Build command: `npm run build`
- Build output directory: `dist`
