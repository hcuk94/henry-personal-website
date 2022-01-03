fetch(form.action, {
  method: form.method,
  credentials: 'include',
  headers: {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
  },
  body: params,
  mode: 'cors',
  credentials: 'omit'
}).then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok:' + response.statusText);
  }
  document.getElementById('post-new-comment-submitting').hidden = true;
  document.getElementById('post-new-comment-thank-you').hidden = false;
}).catch(err => {
  console.log(err);
  document.getElementById('post-new-comment-submitting').hidden = true;
  document.querySelector('#post-new-comment-error .error-message').textContent = err.message
  document.getElementById('post-new-comment-error').hidden = false;
});
