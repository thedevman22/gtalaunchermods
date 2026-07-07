import { createServer, type Server } from 'http'
import { URL } from 'url'
import { shell, ipcMain, BrowserWindow } from 'electron'
import type { OAuthCallbackInfo } from '../shared/profile'

let oauthServer: Server | null = null

function closeOAuthServer(): void {
  if (oauthServer) {
    oauthServer.close()
    oauthServer = null
  }
}

export function registerAuthBridgeIpc(): void {
  ipcMain.handle('auth:startOAuthCallback', async (): Promise<OAuthCallbackInfo> => {
    closeOAuthServer()

    return new Promise((resolve, reject) => {
      const server = createServer((req, res) => {
        if (!req.url?.startsWith('/auth/callback')) {
          res.writeHead(404)
          res.end()
          return
        }

        const address = server.address()
        if (!address || typeof address === 'string') {
          res.writeHead(500)
          res.end()
          return
        }

        const callbackUrl = new URL(req.url, `http://127.0.0.1:${address.port}`).toString()

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`<!DOCTYPE html>
<html>
  <head><title>ModHarbor</title></head>
  <body style="font-family:system-ui;background:#f4f9fd;color:#0f2942;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <div style="text-align:center">
      <h1>Sign-in complete</h1>
      <p>You can close this window and return to the launcher.</p>
    </div>
  </body>
</html>`)

        for (const window of BrowserWindow.getAllWindows()) {
          window.webContents.send('auth:oauth-callback', callbackUrl)
        }

        closeOAuthServer()
      })

      server.on('error', (err) => {
        closeOAuthServer()
        reject(err)
      })

      server.listen(0, '127.0.0.1', () => {
        oauthServer = server
        const address = server.address()
        if (!address || typeof address === 'string') {
          reject(new Error('Failed to start OAuth callback server.'))
          return
        }

        resolve({
          port: address.port,
          redirectTo: `http://127.0.0.1:${address.port}/auth/callback`
        })
      })
    })
  })

  ipcMain.handle('auth:openExternal', async (_event, url: unknown) => {
    if (typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error('Invalid URL.')
    }
    await shell.openExternal(url)
  })
}
