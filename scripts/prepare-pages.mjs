import { mkdir, copyFile } from 'node:fs/promises'

await mkdir('dist/oracle', { recursive: true })
await copyFile('dist/index.html', 'dist/oracle/index.html')
