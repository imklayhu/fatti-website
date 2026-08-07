# FatTI 找到狡猾的猪腰官网

控卡科宣传单页。微信搜「找到狡猾的猪腰」体验小程序。

## 部署

纯静态站，`main` 分支直接部署 GitHub Pages，自定义域名 `fatti.ai-dddd.top`（见 `CNAME`）。

- 改内容后 `git push origin main` 即自动重新部署（GitHub Actions Pages 构建）。
- 域名 DNS 记录（在 `ai-dddd.top` 控制台配置）：

  ```
  fatti  CNAME  imklayhu.github.io
  ```

- 上线前自检：`node scripts/verify.mjs`（图片存在 / 零 em-dash / 妖兽 16 只 / 控卡 5 功能点 / CTA 唯一 / 梗出处）。

## 素材来源

- 控卡截图：微信开发者工具模拟器截图（`assets/shots/*.jpg`），来自小程序「控卡首页 / 今日执行 / 餐次详情 / 日程」页面。
- 妖兽插画：小程序插画资产（`assets/beasts/persona-*.png`），与小程序 `src/content/personas.ts` 的 16 只脂妖对应。
- 小程序码：微信小程序后台生成的普通链接二维码（`assets/mp-qrcode.png`），用于 Hero 与使用步骤区扫码直达。
