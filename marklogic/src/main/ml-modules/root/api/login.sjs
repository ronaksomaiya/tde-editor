const errorResponse = require('/lib/helpers/errorResponse.sjs');
const runModule = require('/lib/helpers/runModule.sjs');

function login() {
  let body;

  try {
    body = JSON.parse(xdmp.getRequestBody('json'));
  } catch (err) {
    return errorResponse(400, 'Bad Request', 'Invalid request body');
  }

  if (!body || !body.username || !body.password) {
    return errorResponse(400, 'Bad Request', 'Missing required params (username and password)');
  }

  const { username, password } = body;

  const login = xdmp.login(username, password, true);

  if (!login) {
    return errorResponse(403, 'Forbidden', 'Login failed');
  }
}

runModule(login, {
  allowedMethods: 'post',
  protected: false
});
