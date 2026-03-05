# 人文地理 Chapter 1 单词背诵（Vite + React）

这是一个用于人文地理第一章词汇 (`ch1_vocab_cn_en_humangeo.json`) 的学习前端，支持卡片背诵与选择题测验。

## 功能

- 卡片学习：
  - 英文 → 中文 / 中文 → 英文 双向背诵。
  - 查看答案后选择“认识”或“未记住”。
- 选择题测验：
  - 每题 4 个选项（1 个正确 + 3 个干扰项）。
  - 支持答题反馈与下一题。
- 学习记录：
  - 使用 `localStorage` 持久化答题记录（见 `localStorage key`）。
  - 页面展示复习率、掌握率、答对/答错、连续答对。
- 键盘快捷：
  - 卡片模式：`空格`（显示答案/记住）、`←`、`→`、`R`（切换方向）。
  - 测验模式：`1~4` 选择答案，答题后可用 `空格` 或 `回车` 下一题。

## 词库数据源

词库文件已放在：

- `public/data/ch1_vocab_cn_en_humangeo.json`

JSON 结构：

```json
[
  {
    "en": "Geography",
    "cn": "地理学"
  }
]
```

## 启动方式

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run build   # 生产构建
npm run lint    # 本地类型检查
npm run preview # 生产包预览
```

## 技术栈

- Vite
- React + TypeScript
- 本地状态 + localStorage
