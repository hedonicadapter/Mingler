// TODO: maybe expand with navigator.onLine to check if user is online and send error depending on that
export default function genericErrorHandler(e) {
  const error = e?.response?.data?.error;

  if (error) {
    return { error: e?.response?.data?.error };
    // if 'error' isn't defined, it means the client didn't receive a response,
    // and the error is elsewhere, like a client side network error
  } else return { error: e?.message || '' };
}
