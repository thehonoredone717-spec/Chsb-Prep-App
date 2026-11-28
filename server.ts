import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const port = Number(process.env.PORT) || 3000;

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const hmrEnabled = process.env.ENABLE_HMR === 'true';
    if (!hmrEnabled) {
      process.env.DISABLE_HMR = 'true';
    }
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrEnabled ? { server: httpServer } : false,
        ws: hmrEnabled ? undefined : false,
      },
      appType: 'spa',
    });
    if (!hmrEnabled) {
      app.get('/@vite/client', async (_req, res, next) => {
        try {
          const result = await vite.transformRequest('/@vite/client');
          if (!result) return next();
          const code = result.code
            .replace(
              'transport.connect(createHMRHandler(handleMessage));',
              '/* HMR WebSocket disabled */'
            )
            .replace(
              'else throw new SendBeforeConnectError("send was called before connect");',
              'else return;'
            )
            .replace(
              'else throw new SendBeforeConnectError("invoke was called before connect");',
              'else return;'
            );
          res.type('application/javascript').send(code);
        } catch (err) {
          next(err);
        }
      });
    }
    app.get('/sw.js', (_req, res) => {
      const publicSwPath = path.resolve(process.cwd(), 'public', 'sw.js');
      const distSwPath = path.resolve(process.cwd(), 'dist', 'sw.js');
      const targetPath = fs.existsSync(publicSwPath) ? publicSwPath : distSwPath;
      if (fs.existsSync(targetPath)) {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Service-Worker-Allowed', '/');
        return res.sendFile(targetPath);
      }
      res.status(404).send('Service worker not found');
    });
    app.get(['/privacy', '/privacy/'], (_req, res) => {
      const publicPrivacy = path.resolve(process.cwd(), 'public', 'privacy', 'index.html');
      const distPrivacy = path.resolve(process.cwd(), 'dist', 'privacy', 'index.html');
      const target = fs.existsSync(publicPrivacy) ? publicPrivacy : distPrivacy;
      if (fs.existsSync(target)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(target);
      }
      res.redirect('/');
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

void startServer();
