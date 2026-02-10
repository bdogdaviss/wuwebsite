import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'fs'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  publicDir: 'public',
  plugins: [
    {
      name: 'fix-extension-paths',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')

        // Copy HTML files to root level popup/ and options/ folders
        mkdirSync(resolve(distDir, 'popup'), { recursive: true })
        mkdirSync(resolve(distDir, 'options'), { recursive: true })

        // Read, fix paths, and write popup.html
        let popupHtml = readFileSync(resolve(distDir, 'src/popup/popup.html'), 'utf-8')
        popupHtml = popupHtml.replace(/href="\/([^"]+)"/g, 'href="../$1"')
        popupHtml = popupHtml.replace(/src="\/([^"]+)"/g, 'src="../$1"')
        writeFileSync(resolve(distDir, 'popup/popup.html'), popupHtml)

        // Read, fix paths, and write options.html
        let optionsHtml = readFileSync(resolve(distDir, 'src/options/options.html'), 'utf-8')
        optionsHtml = optionsHtml.replace(/href="\/([^"]+)"/g, 'href="../$1"')
        optionsHtml = optionsHtml.replace(/src="\/([^"]+)"/g, 'src="../$1"')
        writeFileSync(resolve(distDir, 'options/options.html'), optionsHtml)

        // Remove the src folder
        rmSync(resolve(distDir, 'src'), { recursive: true, force: true })
      },
    },
  ],
})
