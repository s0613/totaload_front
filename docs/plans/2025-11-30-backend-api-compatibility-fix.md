# Backend API Compatibility Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix web_totaload (Next.js) frontend to be fully compatible with iso-platform backend API contracts.

**Architecture:** Update TypeScript types, UserService methods, and AuthInitializer to match backend request/response formats. Focus on signup response handling, token refresh, and field name consistency.

**Tech Stack:** Next.js 15, React 19, TypeScript, Axios, Zustand

---

## Task 1: Fix SignupResponse Type to Match AuthResponse

**Files:**
- Modify: `/Users/songseungju/deeptech/web_totaload/features/user/types.ts:35-38`

**Step 1: Update SignupResponse interface**

Replace the current SignupResponse with AuthResponse-compatible type:

```typescript
// 백엔드 AuthResponse와 일치하는 회원가입 응답 타입
export interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  name: string;
  role: string;
  company?: string;
  // 하위 호환성을 위한 선택적 필드
  message?: string;
}
```

**Verification:**
Run: `npm run type-check` or `npx tsc --noEmit`
Expected: No type errors

---

## Task 2: Update signup() Method to Store JWT Tokens

**Files:**
- Modify: `/Users/songseungju/deeptech/web_totaload/features/user/UserService.tsx:15-24`

**Step 1: Update signup method to store tokens after successful signup**

```typescript
/** 회원가입 */
async signup(signupData: SignupRequest): Promise<SignupResponse> {
  try {
    const response = await api.post<SignupResponse>('/auth/signup', signupData);

    // 백엔드가 AuthResponse(JWT 토큰 포함)를 반환하므로 토큰 저장
    if (response.data.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt-token', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refresh-token', response.data.refreshToken);
        }
      }
    }

    return response.data;
  } catch (error: any) {
    console.error('회원가입 실패:', error);
    throw new Error(error.message || '회원가입에 실패했습니다.');
  }
}
```

**Verification:**
Run: `npm run type-check`
Expected: No type errors

---

## Task 3: Fix refreshToken() Method

**Files:**
- Modify: `/Users/songseungju/deeptech/web_totaload/features/user/UserService.tsx:252-260`

**Step 1: Update refreshToken to send token in body and store new tokens**

```typescript
/** 토큰 갱신 */
async refreshToken(): Promise<void> {
  try {
    const currentRefreshToken = localStorage.getItem('refresh-token');

    if (!currentRefreshToken) {
      throw new Error('저장된 리프레시 토큰이 없습니다.');
    }

    const response = await api.post<LoginResponse>('/auth/refresh', {
      refreshToken: currentRefreshToken
    });

    // 새 토큰 저장
    if (response.data.accessToken) {
      localStorage.setItem('jwt-token', response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refresh-token', response.data.refreshToken);
    }

    console.log('토큰 갱신 성공');
  } catch (error: any) {
    console.error('토큰 갱신 실패:', error);
    // 갱신 실패 시 토큰 삭제
    localStorage.removeItem('jwt-token');
    localStorage.removeItem('refresh-token');
    throw new Error(error.message || '토큰 갱신에 실패했습니다.');
  }
}
```

**Verification:**
Run: `npm run type-check`
Expected: No type errors

---

## Task 4: Fix CurrentUserResponse Field Name

**Files:**
- Modify: `/Users/songseungju/deeptech/web_totaload/features/user/types.ts:52-58`

**Step 1: Update CurrentUserResponse to use userId instead of id**

```typescript
// 현재 사용자 정보 응답 타입 (/api/auth/me)
// 백엔드 AuthResponse와 일치
export interface CurrentUserResponse {
  userId: number;    // 변경: id → userId (백엔드와 일치)
  email: string;
  name: string;
  role: string;
  company?: string;  // 추가: 백엔드에서 반환하는 필드
  tokenType?: string; // 추가: 백엔드에서 반환하는 필드
}
```

**Verification:**
Run: `npm run type-check`
Expected: Type errors in files using `currentUser.id` (will fix in next task)

---

## Task 5: Update All References to currentUser.id

**Files:**
- Modify: `/Users/songseungju/deeptech/web_totaload/components/AuthInitializer.tsx:84`
- Modify: `/Users/songseungju/deeptech/web_totaload/features/user/UserService.tsx:52,72` (fallback cases)

**Step 1: Update AuthInitializer.tsx**

Change line 84 from:
```typescript
userId: currentUser.id,
```
to:
```typescript
userId: currentUser.userId,
```

**Step 2: Update UserService.tsx fallback cases (lines 52, 72)**

Change from:
```typescript
userId: meResponse.data.id,
```
to:
```typescript
userId: meResponse.data.userId,
```

**Verification:**
Run: `npm run type-check`
Expected: No type errors

---

## Task 6: Run Full Verification

**Step 1: Run TypeScript type check**

Run: `npm run type-check` or `npx tsc --noEmit`
Expected: No type errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit changes**

```bash
git add -A
git commit -m "fix: update API types and services for backend compatibility

- SignupResponse now matches AuthResponse format with JWT tokens
- signup() stores tokens after successful registration
- refreshToken() sends token in body and stores new tokens
- CurrentUserResponse uses userId instead of id
- All references updated to use userId"
```

---

## Summary

| Task | Description | Priority |
|------|-------------|----------|
| Task 1 | Fix SignupResponse type | 🔴 Critical |
| Task 2 | Update signup() to store tokens | 🔴 Critical |
| Task 3 | Fix refreshToken() method | 🔴 Critical |
| Task 4 | Fix CurrentUserResponse field name | 🔴 Critical |
| Task 5 | Update all id → userId references | 🔴 Critical |
| Task 6 | Run full verification | 🟢 Verification |

**Estimated Time:** 15-20 minutes

**After completion:** The web_totaload frontend will be fully compatible with the iso-platform backend API contracts for authentication flows.
