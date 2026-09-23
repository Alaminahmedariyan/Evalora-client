# 🔐 LoginForm — Documentation

> **File:** `components/auth/login-form.tsx`
> **Type:** Client Component
> **Last Updated:** 2026-09-23

---

## 📌 সংক্ষিপ্ত পরিচিতি

`LoginForm` হলো Evalora অ্যাপের **লগইন এন্ট্রি পয়েন্ট**। এটি ইউজারকে **Email + Password** অথবা **Google / GitHub** দিয়ে লগইন করতে দেয়।

### 🎯 দায়িত্বসমূহ
- ✅ Email/Password ভ্যালিডেশন (Zod দিয়ে)
- ✅ Credentials দিয়ে লগইন API কল
- ✅ 2FA ফ্লো হ্যান্ডল করা
- ✅ সোশ্যাল লগইন সাপোর্ট
- ✅ Accessible error messages

---

## 🗺️ কম্পোনেন্ট ম্যাপ

```mermaid
graph TD
    A["🧩 LoginForm (Client Component)"]
    A --> B["⚙️ Hooks & State"]
    A --> C["🎨 Render JSX"]

    B --> B1["useRouter()"]
    B --> B2["useState → formError"]
    B --> B3["useForm → email, password"]

    C --> C1["① Header"]
    C --> C2["② Alert (formError)"]
    C --> C3["③ Email Field"]
    C --> C4["④ Password Field"]
    C --> C5["⑤ Submit Button"]
    C --> C6["⑥ Divider"]
    C --> C7["⑦ Social: Google | GitHub"]
    C --> C8["⑧ Footer: Register link"]

    style A fill:#6366f1,color:#fff
    style B fill:#f59e0b,color:#fff
    style C fill:#10b981,color:#fff
```

---

## 🔄 লগইন ফ্লো (Flowchart)

```mermaid
flowchart TD
    Start([🚀 ইউজার ফর্ম পেল]) --> Type[📝 Email + Password টাইপ]
    Type --> Blur{ফিল্ড ছেড়ে দিলে?}
    Blur -->|হ্যাঁ| Validate[🔍 Zod schema validate]
    Blur -->|না| Type

    Validate --> Check{ভ্যালিড?}
    Check -->|❌ না| ShowErr[🔴 লাল এরর দেখাও]
    ShowErr --> Type

    Check -->|✅ হ্যাঁ| Submit[🖱️ Submit চাপো]
    Submit --> Clear[🧹 setFormError null]
    Clear --> API[📡 authClient.signIn.email]

    API --> Result{ফলাফল?}

    Result -->|✅ সফল| Success[router.push /]
    Result -->|🔐 2FA| TwoFA[router.push /two-factor]
    Result -->|❌ এরর| Error[setFormError msg]

    Success --> Home([🏠 হোম পেজ])
    TwoFA --> TFPage([🔐 2FA পেজ])
    Error --> Alert[⚠️ Alert দেখাও]

    style Start fill:#6366f1,color:#fff
    style Home fill:#10b981,color:#fff
    style TFPage fill:#f59e0b,color:#fff
    style Alert fill:#ef4444,color:#fff
```

---

## 🎬 Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 ইউজার
    participant F as 📝 LoginForm
    participant Z as 🔍 Zod
    participant A as 📡 authClient
    participant R as 🧭 Router

    U->>F: পেজ ওপেন
    F-->>U: ফর্ম দেখাও

    U->>F: Email টাইপ + ব্লার
    F->>Z: safeParse(email)
    Z-->>F: ✅ / ❌
    F-->>U: এরর থাকলে দেখাও

    U->>F: Password টাইপ + ব্লার
    F->>Z: safeParse(password)
    Z-->>F: ✅

    U->>F: Submit চাপো
    F->>F: setFormError(null)
    F->>A: signIn.email()

    alt ✅ সফল
        A-->>F: { error: null }
        F->>R: push("/")
        R-->>U: 🏠 হোম পেজ
    else 🔐 2FA
        A-->>F: TWO_FACTOR_REQUIRED
        F->>R: push("/two-factor")
        R-->>U: 🔐 2FA পেজ
    else ❌ এরর
        A-->>F: { error: message }
        F->>F: setFormError(message)
        F-->>U: ⚠️ Alert
    end
```

---

## 🔀 State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle: কম্পোনেন্ট মাউন্ট

    state Idle {
        formError: null
        email: ""
        password: ""
        isSubmitting: false
    }

    Idle --> Typing: টাইপ শুরু
    Typing --> Validating: onBlur
    Validating --> HasError: ❌ invalid
    Validating --> Valid: ✅ valid
    HasError --> Typing
    Valid --> Submitting: Submit

    state Submitting {
        isSubmitting: true
        formError: null
    }

    Submitting --> Success: ✅ API সফল
    Submitting --> TwoFactor: 🔐 2FA
    Submitting --> Failed: ❌ API এরর

    Success --> [*]
    TwoFactor --> [*]
    Failed --> Idle
```

---

## 🧱 Dependency Tree

```mermaid
graph LR
    LF["📄 LoginForm.tsx"]

    LF --> R["⚛️ react → useState"]
    LF --> N["▲ next → Link, useRouter"]
    LF --> T["🧪 @tanstack/react-form → useForm"]
    LF --> AC["🔐 @/lib/auth-client → authClient"]
    LF --> V["✅ @/validation/auth → loginSchema"]
    LF --> UI["🎨 @/components/ui → Button, Input, Label"]

    style LF fill:#6366f1,color:#fff,stroke-width:3px
    style R fill:#61dafb,color:#000
    style N fill:#000,color:#fff
    style T fill:#f97316,color:#fff
    style AC fill:#8b5cf6,color:#fff
    style V fill:#10b981,color:#fff
    style UI fill:#ec4899,color:#fff
```

---

## 📊 State Reference

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `formError` | `string \| null` | `null` | API থেকে আসা গ্লোবাল এরর |
| `email` | `string` | `""` | TanStack Form value |
| `password` | `string` | `""` | TanStack Form value |
| `isSubmitting` | `boolean` | `false` | Submit লোডিং স্টেট |

---

## 🔗 API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `authClient.signIn.email()` | POST `/auth/sign-in/email` | Credentials লগইন |
| `authClient.signIn.social()` | POST `/auth/sign-in/social` | OAuth লগইন |

---

## 🛣️ Navigation Routes

| Trigger | Destination |
|---------|-------------|
| ✅ সফল লগইন | `/` (হোম) |
| 🔐 2FA দরকার | `/two-factor` |
| 🔗 Forgot password | `/forgot-password` |
| 🔗 Register | `/register` |

---

## 🧪 Test Cases (Flowchart থেকে নেওয়া)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Empty email submit | "Email is required" error |
| 2 | Invalid email format | "Invalid email" error |
| 3 | Empty password | "Password is required" error |
| 4 | Wrong credentials | Alert with error message |
| 5 | Valid + no 2FA | Redirect to `/` |
| 6 | Valid + 2FA on | Redirect to `/two-factor` |
| 7 | Google button | OAuth flow start |
| 8 | GitHub button | OAuth flow start |

---

## ⚠️ Error Codes

| Code | Handling |
|------|----------|
| `TWO_FACTOR_REQUIRED` | `/two-factor` এ রিডাইরেক্ট |
| (অন্য যেকোনো) | `formError` state-এ দেখাও |

---

## ♿ Accessibility Features

- ✅ `role="alert"` — formError এর জন্য
- ✅ `aria-invalid` — ভুল ফিল্ডে
- ✅ `aria-describedby` — এরর মেসেজের সাথে লিংক
- ✅ `autoComplete` — browser autofill সাপোর্ট
- ✅ `noValidate` — browser default বন্ধ, Zod ব্যবহার

---

## 🚀 ভবিষ্যতের Extension Points

কোথায় নতুন ফিচার যোগ করবেন:

| ফিচার | কোথায় পরিবর্তন |
|-------|----------------|
| 📧 Magic Link | `onSubmit` এ নতুন branch |
| 📱 OTP | `onSubmit` এর `TWO_FACTOR_REQUIRED` এর পাশে |
| 🍎 Apple Sign-in | Social grid এ নতুন Button |
| 🔑 Remember Me | নতুন `form.Field` + cookie logic |

---

## 📝 Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-09-23 | Initial documentation | — |

---

## 🔗 Related Files

- `lib/auth-client.ts` — Better Auth ক্লায়েন্ট
- `validation/auth.ts` — Zod schemas
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `app/two-factor/page.tsx` — 2FA flow
- `app/forgot-password/page.tsx`
- `app/register/page.tsx`

---

## 💡 Tips for Future Developers

1. **নতুন error code যোগ করলে** → `onSubmit` এর `if (error)` ব্লকে নতুন case দিন
2. **নতুন social provider যোগ করলে** → social grid এ নতুন `<Button>` দিন
3. **Validation rule পরিবর্তন হলে** → `loginSchema` এডিট করুন, এই ফাইল নয়
4. **Redirect path বদলাতে হলে** → `router.push()` কল খুঁজুন