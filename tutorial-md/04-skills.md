<!-- 章节：第4章 · AI Skills | 截图：S19~S22 | 状态：草稿 -->

# 第 4 章 · 让 AI 先学会规矩：Skills 是什么、怎么装

> 本章目标：理解「给 AI 装技能」这件事，学会安装本教程全程要用的 skills，并验证它真的生效了。

## 4.0 先聊两句

第 1 章我们说过，AI 编程的正确姿势是「AI 负责快速产出，你负责提需求和验证」。但这里有个隐蔽的问题：**你该怎么向 AI 提需求？**

如果你每次都对 AI 说「帮我做个小程序」，它给你的东西会非常泛泛，甚至离题万里。就像你请了一位新员工，但不告诉他公司的规章制度、工作流程，他只能自由发挥。

Skills 就是来解决这个问题的。它是给 AI 的「工作手册」或「技能包」。装上它以后，AI 在干活时会自动遵循里面的规矩：先聊需求再动手、动手前先写计划、完成前先验证、踩坑要记下来。这样一来，AI 从一个「灵感型员工」变成了一个「靠谱型员工」。

这一章我们先把概念讲清楚，然后把本教程用到的 skills 清单给你，最后教你安装 skill 的方法（主推在对话里让 agent 装，也讲自己动手的备选）并验证生效。全程实操，但很轻量。

## 4.1 什么是 AI Skills

先打个比方。

想象你开了一家小店，雇了一个非常聪明的新员工。这个员工什么都懂一点，但你如果只说「你去进货吧」，他可能进一车花里胡哨但卖不动的货。于是你给他一本《店员手册》：进货要先看库存、先看顾客反馈、下单前要填表格、到货要验收。从此他的干活质量立刻稳定了。

Skills 就是这本《店员手册》。它是一个装在项目里的文件夹，里面用 Markdown（一种轻量标记语言，就是你现在看到的正文这种格式）写清楚一套规则。Cursor 里的 AI 在开始干活前，会先「读手册」，然后按照手册的流程工作。

具体到代码世界：一个 skill 就是一个文件夹，里面有一个叫 `SKILL.md` 的主文件。这个文件里写的是「什么时候用这个技能」「用之前要做哪些准备」「干活分哪几步」「做完怎么算合格」。

比如我们后面会反复用到的 `writing-plans`（写计划）这个 skill，它的手册会告诉 AI：拿到一个需求，先别急着写代码，而是先拆解任务、列出步骤、标注风险，写成一份计划文档。AI 照做以后，你的项目就会从「走一步看一步」变成「按图施工」。

Skills 的好处归纳起来三点：**可复用**（一套规则到处用）、**可分享**（别人能直接拿你的 skill 用）、**可积累**（你踩过的坑能写进手册，让 AI 下次不再犯）。FatTI 项目后面有专门的「Ratchet（棘轮）」机制，把每次踩的坑写回手册，就是这个思路。

## 4.2 本案例用到的 skills 全清单

FatTI 项目实际用到了 15 个 skills。它们不是一次全装上，而是分布在项目的不同阶段使用。我们把清单列在这里，每个 skill 配一句话用途和使用时机。你现在不用逐个记住，等用到的那一章，会回来对照。

| Skill | 用途（一句话） | 使用时机 |
|-------|----------------|----------|
| `superpowers` | 技能调度中枢，帮 AI 决定该调用哪个技能 | 每次会话开始 |
| `brainstorming` | 动手前先聊清楚需求 | 任何新功能、新内容 |
| `writing-plans` | 把需求拆成可执行计划 | 动码之前 |
| `executing-plans` | 按计划逐条执行 | 计划批准后 |
| `verification-before-completion` | 验收通过才叫完成 | 每个任务收尾 |
| `pm-skills` | 项目推进与沟通管理 | 排期、风险 |
| `frontend-design` | 精美 UI 视觉规划（本项目主视觉技能） | 做页面视觉 |
| `ui-ux-pro-max` | 设计决策库（可选检索） | 视觉决策参考 |
| `loop` | 周期/事件驱动循环 | 迭代节奏 |
| `systematic-debugging` | 系统化查 bug | 出 bug 时 |
| `requesting-code-review` | 请 AI 评审代码 | 大改前 |
| `receiving-code-review` | 理性接收评审意见 | 收到评审时 |
| `kill-ai-slop` | 去掉「AI 味」文案和视觉 | UI/文案定稿 |
| `taste-skill` | 反模板化设计 | 官网/落地页 |
| `redesign-skill` | 旧页面升级为高级质感 | 改版时 |

看一眼这张表，你会发现它的设计逻辑：**先聊清楚（brainstorming），再写计划（writing-plans），再执行（executing-plans），做完必须验证（verification-before-completion），遇到 bug 系统查（systematic-debugging）。** 这套流程就是我们全程跟练的节奏。本教程第 5 章以后，你会看到我们每一步都遵循它。

## 4.3 安装方式（推荐）：在 Cursor 对话里把 GitHub 地址发给 agent

skills 通常以「仓库」的形式发布（还记得第 3 章注册过的 GitHub 吧？）。但你不需要自己在终端里敲 git clone：直接把 skill 的仓库地址发给 Cursor 里的 agent，它会帮你完成克隆、放到正确位置（`.cursor/skills/`），并确认安装成功。对新手来说，这是最不容易出错的方式。

具体步骤（在 Cursor 里操作）：

**第一步，打开项目文件夹。** 在 Cursor 里打开你的项目文件夹。假设叫 `my-miniapp`（第 5 章会正式创建，现在可以先建一个空文件夹占位）。

**第二步，把仓库地址发给 agent。** 在 Cursor 的对话输入框里，把 skill 的 GitHub 仓库地址粘贴进去，加上一句请求，比如「帮我把这个 skill 安装到项目的 .cursor/skills/ 目录」。skill 仓库地址由 skill 发布方提供，格式类似 `https://github.com/<发布方>/<skill仓库名>`（示意，以你找到的为准）。

**第三步，同意 agent 的计划。** agent 会自己去克隆仓库，并把 skill 放到项目根目录的 `.cursor/skills/` 文件夹下（这是 Cursor 约定的技能放置区）。它一般会先告诉你它打算怎么做，你可以直接同意。

在 Cursor 对话中把 GitHub 地址发给 agent，它回复正在安装、安装完成：

![S19 · Cursor 对话中让 agent 安装 skill](tutorial-assets/S19.png)

**第四步，确认安装结果。** agent 完成后，在 Cursor 里打开项目的 `.cursor/skills/` 目录，看到克隆下来的文件夹，里面有 `SKILL.md` 文件，就说明装好了。

项目 `.cursor/skills/` 目录，文件树里能看到 superpowers、writing-plans 等子目录：

![S20 · 项目 `.cursor/skills/` 目录](tutorial-assets/S20.png)

如果有多份 skill 要装，把它们的仓库地址分次发给 agent，或一次列出让它逐个安装。`.cursor/skills/` 是 Cursor 约定的「技能放置区」，AI 会自动去这里找技能。如果某个 skill 是「全家桶」（一个仓库包含多个 skill），它的子目录会各自带一个 `SKILL.md`，比如 `writing-plans/SKILL.md`、`brainstorming/SKILL.md`。原则是：**每个 skill 一个文件夹，文件夹里要有 `SKILL.md`。**

## 4.4 备选：自己动手用终端克隆（想了解原理时）

主推方式（4.3）已经把活交给 agent，你可以完全不碰终端。但如果你想了解背后的原理，或者就是喜欢自己动手，也可以手动克隆，效果完全一样。

具体步骤（在终端里操作）：

第一步，打开终端，进入你的项目根目录：

```bash
cd 你的项目文件夹路径
```

第二步，克隆 skill 仓库到项目：

```bash
git clone <skill仓库地址> .cursor/skills/<skill名字>
```

这条命令的意思是：把 skill 仓库克隆到 `.cursor/skills/` 下的 `<skill名字>` 文件夹。如果多个 skill 是分开的仓库，就重复执行，每个克隆到自己的子文件夹。

装好的 skill 在 Cursor 对话里可以直接点名使用，比如「用 writing-plans 帮我把这个需求写成计划」。Cursor 会自动加载对应的 `SKILL.md` 作为工作手册。

两种方式不冲突、结果相同：不管是你手动克隆，还是让 agent 帮你装，skill 最终都会落在项目的 `.cursor/skills/` 目录下，Cursor 都能识别和使用。对本教程来说，掌握主推方式（4.3）加一个验证动作（4.5）就够了。

## 4.5 怎么验证 skill 生效

装没装对，要验证。验证分两步。

**第一步：确认文件在。** 在 Cursor 里打开 `.cursor/skills/` 下的某个 skill 文件夹，点开 `SKILL.md`，能看到一篇有结构的说明文档，里面有「用途、使用时机、步骤」等内容。

在 Cursor 里打开某个 skill 的 SKILL.md，你会看到它的说明内容：

![S21 · Cursor 中查看 skill 说明](tutorial-assets/S21.png)

**第二步：确认 AI 真的用了它。** 在 Cursor 的对话面板里，直接提出一个和该 skill 相关的请求，比如对 `brainstorming` 说「我想做一个 xx 功能，帮我把需求聊清楚」。如果 skill 生效，AI 在回复时会表现出「先问几个问题、先确认需求边界」的行为，而不是直接给方案。有些 Cursor 版本会在对话里显示 skill 被加载的提示。

在 Cursor 对话中触发 skill，你会看到 AI 表现出遵循该 skill 的痕迹：

![S22 · Cursor 对话中触发 skill](tutorial-assets/S22.png)

一个实用的判断标准：**生效的 skill 会改变 AI 的行为模式。** 如果 AI 的行为完全没变化，说明 skill 没被加载，检查一下文件路径是不是 `.cursor/skills/<名字>/SKILL.md`，以及文件名大小写。

到这里，你已经完成了「给 AI 立规矩」这件事。从下一章开始，我们每一章都会用到这些 skills：先聊需求，再写计划，再动手，最后验证。你会发现，有了这套流程，AI 的质量稳定得不像话。

## 自查清单

- [ ] 我能用一句话解释什么是 AI Skills（工作手册/技能包）
- [ ] 我知道 skill 放在项目的 `.cursor/skills/` 目录，每个 skill 一个文件夹
- [ ] 我在 Cursor 对话里把 skill 的 GitHub 地址发给 agent，它帮我安装好了，`.cursor/skills/` 下有 `SKILL.md` 文件
- [ ] 我在 Cursor 里打开过 `SKILL.md`，看到了它的说明
- [ ] 我在对话里触发过 skill，AI 的行为按手册改变了
- [ ] 我扫过 4.2 的 15 个 skill 清单，知道它们是干嘛的

## 本章小结

- Skills 是给 AI 的「工作手册」，让 AI 从自由发挥变成按规矩办事
- 本教程用 15 个 skills，核心循环是：聊需求、写计划、执行、验证、查 bug
- 主推安装：在 Cursor 对话里把 skill 的 GitHub 地址发给 agent，让它安装配置
- 备选：自己用终端 `git clone`（想了解原理时）
- 验证生效的标准：AI 的行为按 skill 手册改变了

第 5 章，重头戏来了：搭骨架，跑起第一个能打开的小程序。
