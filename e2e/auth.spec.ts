import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Interview Journey')).toBeVisible()
    await expect(page.getByText('Get started free')).toBeVisible()
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('Start your journey')).toBeVisible()
    await expect(page.getByLabel('Full name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('unauthenticated user redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected from pipeline', async ({ page }) => {
    await page.goto('/pipeline')
    await expect(page).toHaveURL(/\/login/)
  })

  test('signup link on login page works', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Sign up free' }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('login link on signup page works', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })
})
