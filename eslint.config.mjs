import { defineConfig } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  {
    extends: [...nextCoreWebVitals],
    rules: {
      // `eslint-config-next` 16 enables the React Compiler (`eslint-plugin-react-hooks`
      // v6) rules below at "error" severity. They flag long-standing patterns in the
      // Protocol template that the previous (v14) config never checked. Downgraded to
      // "warn" so the framework upgrade doesn't require behavioral refactors of working
      // code; these warnings can be addressed in a dedicated follow-up.
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
