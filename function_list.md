# 專案功能列表

*   **使用者認證**
    *   ✅ 登入功能 (透過 [`app/login/page.tsx`](app/login/page.tsx) 和 [`app/api/login/route.ts`](app/api/login/route.ts) 實現)
    *   ✅ 登出功能 (透過 [`app/api/logout/route.ts`](app/api/logout/route.ts) 和 [`app/admin/AdminClientPage.tsx`](app/admin/AdminClientPage.tsx) / [`app/users/page.tsx`](app/users/page.tsx) 實現)

*   **管理員功能**
    *   ✅ 管理員介面 (透過 [`app/admin/AdminClientPage.tsx`](app/admin/AdminClientPage.tsx) 實現)
    *   ✅ 管理員側邊欄導航 (透過 [`app/admin/AdminSidebar.tsx`](app/admin/AdminSidebar.tsx) 實現)
    *   ✅ 活動管理頁面 (透過 [`app/admin/ActivityManagementPage.tsx`](app/admin/ActivityManagementPage.tsx) 實現)
        *   ✅ 新增活動 (已包含報名截止日)
        *   ✅ 更新活動 (已包含報名截止日)
        *   ✅ 刪除活動
        *   ✅ 管理活動 (新增、更新、移動)
    *   ✅ 管理員資訊更新 (透過 [`app/api/admin/update/route.ts`](app/api/admin/update/route.ts) 和 [`app/admin/AdminClientPage.tsx`](app/admin/AdminClientPage.tsx) 實現)

*   **使用者功能**
    *   ✅ 使用者頁面 (透過 [`app/users/page.tsx`](app/users/page.tsx) 實現)
    *   活動列表
    *   活動報名
    *   已報名活動列表

*   **資料庫相關**
    *   ✅ Prisma ORM 設定 (透過 `prisma/schema.prisma` 實現)
    *   ✅ 資料庫遷移 (透過 `prisma/migrations/` 目錄下的檔案實現)
    *   ✅ 使用者資料遷移/種子 (透過 `scripts/migrate-users.ts` 和 `scripts/seed-users.ts` 實現)