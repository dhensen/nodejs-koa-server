const session = require('koa-session');
const Koa = require('koa');
const Router = require('koa-router');
const mount = require('koa-mount');
const etag = require('koa-etag');

const app = new Koa();
app.keys = ['some secret code here'];

app.use(etag());

const CONFIG = {
  // key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  // maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
  // overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: false, /** (boolean) httpOnly or not (default true) */
  // signed: true, /** (boolean) signed or not (default true) */
};
app.use(session(CONFIG, app));
// or if you prefer all default config, just use => app.use(session(app));

const router = new Router();

incrementApp = new Koa();

router.post('/inc', ctx => {
  // INCREMENT VIEWS AND DISPLAY
  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
  ctx.body = 'increased ' + n + ' views';
  switch (ctx.accepts('html', 'json')) {
      case 'json':
          ctx.response.body = JSON.stringify({
              data: 'increased ' + n + ' views',
          });
          ctx.response.set('Content-Type', 'application/json');
          return;
      case 'html':
          ctx.redirect('/foo');
          return;
      default:
          ctx.throw(406);
  }
});

router.get('/', ctx => {
  ctx.response.set('Vary', 'Content-Type');
  let n = ctx.session.views || 0;
  ctx.session.token = 'fooooobarrrr' + n;
  switch (ctx.accepts('html', 'json')) {
      case 'json':
          ctx.response.body = JSON.stringify(n);
          ctx.response.set('Content-Type', 'application/json');
          return;
      case 'html':
          // DISPLAY VIEWS ONLY
          ctx.response.body = n + ' views';
          ctx.response.set('Content-Type', 'text/html');
          return;
      default:
          ctx.throw(406);
  }
});

incrementApp.use(router.routes());

app.use(mount(incrementApp));

app.use(ctx => ctx.throw(404));

app.listen(3001);
console.log('listening on port 3001');
