# OI Diary | 信息学竞赛笔记

一个基于浏览器的 OI（信息学奥林匹克竞赛）刷题日记工具，使用 **File System Access API** 直接读写本地 JSON 文件，无需后端服务。

## 特性

- **本地存储**：通过浏览器原生 API 直接读写 `notes.json`，数据完全在本地
- **Markdown 渲染**：支持 Markdown 语法、代码高亮（highlight.js）、KaTeX 数学公式
- **实时预览**：编辑和导入时左右分栏，左侧输入 Markdown，右侧实时渲染预览
- **四种数据类型**：
  - **日记**：记录每天刷的题号列表，题号前带有难度颜色球
  - **Tricks**：记录解题技巧
  - **思路速览**：记录题面概览、解题思路、收获，支持难度分级
  - **知识点**：记录知识点（核心思想、代码模板、关键点）
- **OI 难度体系**：暂无评定(灰) → 入门(红) → 普及-(橙) → 普及(黄) → 普及+/提高-(绿) → 提高(青) → 提高+/省选-(蓝) → 省选/NOI-(紫) → NOI/NOI+/CTS(黑)
- **全文搜索**：基于 Fuse.js，搜索任意文本内容，不限结果数量
- **日期管理**：侧边栏按日期管理，支持新建、修改、删除、合并日期
- **导入导出**：支持 JSON 格式导出备份，支持更换数据文件
- **响应式设计**：字体大小可调节，深色代码主题

## 使用方法

### 首次使用

1. 用 Chrome / Edge 等支持 File System Access API 的浏览器打开 `index.html`
2. 点击「选择 notes.json」，选择 `data/notes.json` 文件
3. 浏览器会记住文件关联，下次打开自动加载

### ⚠️ 重置数据

仓库中的 `data/notes.json` 包含作者的个人刷题记录。**使用前请将 `data/notes.json` 替换为以下初始状态：**

```json
{}
```

或者保留今天的空记录：

```json
{
  "2026-07-13": {
    "date": "2026-07-13",
    "diary": [],
    "tricks": [],
    "problems": [],
    "knowledge": []
  }
}
```

### 日常使用

- 点击侧边栏「新建天」创建当天记录
- 点击「导入」添加题目、Trick 或知识点
- 点击卡片上的 ✏️ 编辑，✕ 删除
- 点击顶部搜索框进入全文搜索
- 点击「导出整个文件json」下载 JSON 备份
- 点击「更换data」切换数据文件

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端框架 |
| Marked | Markdown 渲染 |
| highlight.js | 代码高亮 |
| KaTeX | 数学公式渲染 |
| Fuse.js | 全文搜索 |
| File System Access API | 本地文件读写 |

## 浏览器兼容性

需要支持 **File System Access API** 的浏览器：

- Chrome 86+
- Edge 86+
- Opera 72+

Firefox 和 Safari 暂不支持。

## 项目结构

```
OI Diary/
├── index.html          # 单文件应用
├── data/
│   └── notes.json      # 数据文件（使用前请替换为初始状态）
└── README.md
```