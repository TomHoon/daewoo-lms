# React + Vite

## 공통 Axios 사용

`src/api/axios.js`의 인스턴스를 import하여 API를 호출합니다.
기본 주소는 `/api`이며, 요청 타임아웃은 15초입니다.
`.env.example`을 `.env.local`로 복사하고 `VITE_API_BASE_URL`에 백엔드 주소를 설정하세요.
환경변수를 변경한 뒤에는 개발 서버를 다시 시작해야 합니다.
`VITE_` 환경변수는 브라우저에 공개되므로 비밀 키를 넣지 마세요.
`/api`를 사용하는 경우 같은 출처에서 해당 경로를 제공해야 합니다.

```js
import api from './api/axios'

// 페이지(src/pages)에서는 '../api/axios' 경로로 import합니다.
const response = await api.get('/courses', {
  params: { page: 1 },
})
const courses = response.data

await api.post('/courses', { name: '신규 과정' })
```

응답은 Axios 응답 객체 그대로 반환하며, 오류는 호출부에서 `try/catch`로 처리합니다.
인증 헤더나 쿠키 설정은 백엔드 인증 방식에 맞춰 추가할 수 있습니다.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
