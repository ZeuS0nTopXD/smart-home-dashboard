export function parseControlBody(body) {
  if (!body || typeof body !== 'object' || typeof body.control !== 'string' || !Object.hasOwn(body, 'value')) {
    const error = new Error('Body must contain a control string and value');
    error.code = 'INVALID_BODY';
    throw error;
  }
  return { control: body.control, value: body.value };
}
