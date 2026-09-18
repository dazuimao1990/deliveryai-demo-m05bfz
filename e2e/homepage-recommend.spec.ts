import { test, expect } from '@playwright/test'

test.describe('首页推荐菜展示 - E2E 验收测试', () => {
  test('HOME-001: 首页推荐菜区域展示4张菜品卡片，每张含图片、名称、¥价格和徽章', async ({ page }) => {
    await page.goto('/#/home')

    // 推荐菜区域标题可见
    await expect(page.getByRole('heading', { name: '今日推荐' })).toBeVisible()

    // 推荐菜区域包含 4 张菜品卡片
    const recommendSection = page.locator('section', { has: page.getByRole('heading', { name: '今日推荐' }) })
    const cards = recommendSection.locator('article')
    await expect(cards).toHaveCount(4)

    // 验证每张卡片包含名称、价格和徽章
    // p1: 鎏金番茄鸳鸯锅, ¥68.00, 人气 No.1
    // p2: 牛油麻辣锅, ¥59.00, 招牌
    // p3: 琥珀嫩牛肉, ¥42.00, 主厨推荐
    // p5: 鲜虾滑, ¥39.00, 新品
    const expectedDishes = [
      { name: '鎏金番茄鸳鸯锅', price: '¥68.00', badge: '人气 No.1' },
      { name: '牛油麻辣锅', price: '¥59.00', badge: '招牌' },
      { name: '琥珀嫩牛肉', price: '¥42.00', badge: '主厨推荐' },
      { name: '鲜虾滑', price: '¥39.00', badge: '新品' },
    ]

    for (let i = 0; i < expectedDishes.length; i++) {
      const card = cards.nth(i)
      await expect(card.getByRole('heading', { name: expectedDishes[i].name })).toBeVisible()
      await expect(card.getByText(expectedDishes[i].price)).toBeVisible()
      await expect(card.getByText(expectedDishes[i].badge)).toBeVisible()
      // 图片存在
      await expect(card.locator('img')).toBeVisible()
    }
  })

  test('HOME-002: 推荐菜卡片不可点击、不影响现有首页元素和桌台绑定流程', async ({ page }) => {
    await page.goto('/#/home')

    // 现有首页元素仍正常展示：品牌标题文案、桌位选择按钮、快速进入按钮
    await expect(page.getByText('热气升腾，')).toBeVisible()
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /B12/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /C06/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /D03/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /快速进入/ })).toBeVisible()

    // 推荐菜卡片点击后不触发路由跳转（URL 仍为 #/home）
    const recommendSection = page.locator('section', { has: page.getByRole('heading', { name: '今日推荐' }) })
    const firstCard = recommendSection.locator('article').first()
    await firstCard.click({ force: true })
    await expect(page).toHaveURL(/#\/home$/)

    // 桌台绑定流程不受影响：点击 A08 后进入 welcome
    await page.getByRole('button', { name: /A08/ }).first().click()
    await expect(page).toHaveURL(/#\/welcome$/)
  })

  test('HOME-003: 中英文切换后推荐菜区域标题、菜品名称和徽章文案正确切换', async ({ page }) => {
    // 默认中文：验证推荐菜区域中文文案
    await page.goto('/#/home')
    await expect(page.getByRole('heading', { name: '今日推荐' })).toBeVisible()
    await expect(page.getByText('人气 No.1').first()).toBeVisible()

    // 通过 localStorage 切换语言为英文，重新加载页面
    await page.evaluate(() => localStorage.setItem('i18nextLng', 'en'))
    await page.reload()

    // 英文：推荐菜区域标题、菜品名称和徽章正确切换
    await expect(page.getByRole('heading', { name: "Today's Recommendations" })).toBeVisible()
    await expect(page.getByText('Top Pick').first()).toBeVisible()
    await expect(page.getByText('Signature').first()).toBeVisible()
    await expect(page.getByText("Chef's Choice").first()).toBeVisible()
    await expect(page.getByText('New').first()).toBeVisible()

    const recommendSection = page.locator('section', { has: page.getByRole('heading', { name: "Today's Recommendations" }) })
    const cards = recommendSection.locator('article')
    await expect(cards).toHaveCount(4)
    await expect(cards.first().getByText('Golden Tomato Dual-Flavor Pot')).toBeVisible()
    await expect(cards.first().getByText('¥68.00')).toBeVisible()
  })
})
