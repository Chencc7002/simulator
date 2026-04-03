# 数据需求与获取方式

这个文件对应项目可行性判断，说明：

- 哪些数据必须有
- 这些数据该如何获取
- 当前 MVP 是否已经接入

## 1. 英雄基础信息

必需字段：

- `name`
- `cost`
- `traits`
- `avatar`

推荐来源：

- MetaTFT 单位详情页

获取方法：

- 写页面抓取器
- 解析单位卡片区域
- 提取文本与图片地址映射

当前状态：

- 已用本地示例数据占位
- 尚未接入自动抓取

## 2. 英雄基础面板

必需字段：

- `hp`
- `ad`
- `as`
- `armor`
- `mr`
- `range`
- `critChance`
- `critDamage`
- `manaStart`
- `manaMax`
- `apBase`

推荐来源：

- MetaTFT 单位详情页的“统计”面板

获取方法：

- 抓页面文本
- 写规则把 `50/75/113` 这种三档数值解析成数组

当前状态：

- 已在 [data.js](./data.js) 中用示例结构接入
- 尚未接入真实抓取

## 3. 英雄技能显式数值

必需字段：

- `ability.name`
- `ability.type`
- `ability.baseValues`
- `ability.scalings`
- `ability.description`
- `ability.spellCrit`

推荐来源：

- MetaTFT 单位详情页的“技能”面板

获取方法：

- 抓技能文本
- 用规则解析出基础伤害、护盾、治疗、倍率

当前状态：

- 已有本地示例结构
- 真实技能文本解析器尚未写

## 4. role 默认规则

必需字段：

- `manaPerAttack`
- `manaRegenPerSecond`
- `castTime`
- `manaLock`

推荐来源：

- 自己维护

获取方法：

- 依据你确认后的 Set 17 规则
- 静态写入默认配置

当前状态：

- 已在 [data.js](./data.js) 中接入默认值

## 5. 可合成装备

必需字段：

- `name`
- `flatStats`
- `hooks`
- `notes`

推荐来源：

- MetaTFT 装备页

获取方法：

- 列表页抓名称
- 详情页抓描述和显式加成
- 手工结构化成统一规则字段

当前状态：

- 已在 [data.js](./data.js) 中接入一组示例装备

## 6. 奥术装备 / 光明装备 / 纹章

必需字段：

- `name`
- `category`
- `flatStats`
- `hooks`

推荐来源：

- MetaTFT 对应页面或说明文本

获取方法：

- 页面抓取后结构化

当前状态：

- 已有示例条目
- 尚未接入真实数据源

## 7. 羁绊

必需字段：

- `name`
- `breakpoints`
- `effects`

推荐来源：

- 官方 Set 17 说明页
- 页面可见羁绊描述

获取方法：

- 人工整理成结构化表

当前状态：

- 已有示例条目

## 8. 强化符文 / Buff

必需字段：

- `name`
- `flatStats`
- `hooks`

推荐来源：

- 页面列表
- 官方说明

获取方法：

- 先只整理常用项
- 后续扩展

当前状态：

- 已有示例条目

## 9. 目标预设

必需字段：

- `hp`
- `armor`
- `mr`

推荐来源：

- 项目内自定义

获取方法：

- 直接静态写入

当前状态：

- 已实现

## 10. 时间轴和图表数据

必需字段：

- `timeline`
- `eventLog`
- `damageDistribution`

来源：

- 不是抓取数据
- 由模拟器输出

获取方法：

- [simulation.js](./simulation.js) 每次运行生成

当前状态：

- 已实现

## 当前可行性结论

当前 MVP 已经验证：

- 页面结构可做成参考站风格
- 表格列和图表联动可实现
- 同一英雄不同 extra 的时间轴结果可生成

当前还未验证：

- MetaTFT 页面真实抓取稳定性
- 技能描述自动结构化精度
- 全量 Set 17 英雄和分类接入后的维护成本
