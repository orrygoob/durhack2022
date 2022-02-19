const app = require('./app');

app.listen(80, "127.0.0.1", () => {
  console.log('Listening at http://127.0.0.1:80');
});
