async function shortenUrl() {
  const response = await fetch("https://rel.ink/api/links/", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "url":"https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch"
    }),
  });
  let responseObj = await  response.json()
  console.log(responseObj);
}
shortenUrl();