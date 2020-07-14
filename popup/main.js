const API_ENV = {
  apiUrl: "https://rel.ink/api/links/",
};
const APP_UI = {
  shortenInput: document
    .querySelector(".form__shorten-wrap")
    .querySelector("input"),
  shortenButton: document
    .querySelector(".form__shorten-wrap")
    .querySelector(".btn"),
  copyInput: document.querySelector(".form__copy-wrap").querySelector("input"),
  copyButton: document.querySelector(".form__copy-wrap").querySelector(".btn"),
  historyBlock: document.querySelector(".history").querySelector("ul"),
  historyWrap: document.querySelector(".history"),
  spinner: document.querySelector(".spinner-border"),
  formCopywrap: document.querySelector(".form__copy-wrap")
};

const shortener = {
  history: JSON.parse(localStorage.getItem("shortenerHistory")) ||[],
  shortenUrl: async function (url) {
    try {
      APP_UI.spinner.classList.add("d-block")
      const response = await fetch(API_ENV.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      });
      if(response.status === 400) {
        shortener.showError()
        return Promise.reject();
      }
      let responseObj = await response.json();
      console.log(responseObj);
      return shortener.serializeResponse(responseObj);
    } catch (error) {
console.log(error)
    }
finally {
  APP_UI.spinner.classList.remove("d-block");
}
  },
  serializeResponse: function (data) {
    return {
      oldUrl: data.url,
      newUrl: `https://rel.ink/${data.hashid}`,
    };
  },
  historyTemplate: function (data) {
    return `
    <li><span class="old-url">${
      data.oldUrl.slice(0, 28) + "..."
    }</span> <span  class=""><a href="#">${
      data.newUrl
    }</a><span class=""><i class="far fa-copy"></i></span></span> </li>
`;
  },
  saveAndUpdateLocalStorage: function (obj) {
    shortener.history.push(obj);
    if (shortener.history.length > 5) shortener.history.shift();
    localStorage.setItem("shortenerHistory", JSON.stringify(shortener.history));
  },
  inithistory:function() {
    if(shortener.history.length) {
      APP_UI.historyWrap.classList.add("d-block")
      shortener.history.forEach(item=>{
        let template = shortener.historyTemplate(item);
        APP_UI.historyBlock.insertAdjacentHTML("afterbegin", template);

      })
    }
  },
  showError: function() {
      $(APP_UI.shortenInput).popover('show');
      setTimeout(3000,()=>{
        shortener.hideError();
      })
  },
  hideError: function() {
    $(APP_UI.shortenInput).popover("dispose")
  }
};

// shortener
//   .shortenUrl("https://ru.qwe.wiki/wiki/History_of_Christianity")
//   .then((res) => console.log(res));
/* {
  created_at: "2019-12-21T16:31:35.651652Z"
hashid: "gZ68vg"
url: "https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch"
  }*/

function copytext(text) {
  var $tmp = $("<textarea>");
  $("body").append($tmp);
  $tmp.val(text).select();
  document.execCommand("copy");
  $tmp.remove();
}

//* init history
shortener.inithistory();

//EVENTS
//? main event
APP_UI.shortenButton.addEventListener("click", async (e) => {
  const url = APP_UI.shortenInput.value;
  const responseObj = await shortener.shortenUrl(url);
  const newLi = shortener.historyTemplate(responseObj);
  APP_UI.formCopywrap.classList.add("d-block")
  APP_UI.copyInput.value = responseObj.newUrl;
  APP_UI.historyBlock.insertAdjacentHTML("afterbegin", newLi);
  APP_UI.historyWrap.classList.add("d-block")
  shortener.saveAndUpdateLocalStorage(responseObj);
});
//? copy from  copy input
APP_UI.copyButton.addEventListener("click", (e) => {
  copytext(APP_UI.copyInput.value);
  $(APP_UI.copyInput).effect({
    "effect":"highlight",
    "duration": "1900"
  })

});
//? copy from history
APP_UI.historyBlock.addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-copy")) {
    const url = e.target.parentNode.parentElement.textContent;
    copytext(url);
    $(e.target.parentNode.parentElement).effect({
      "effect":"bounce"
    })
  }
});

//hide popopver
APP_UI.shortenInput.addEventListener("focus",(e)=>{
 shortener.hideError();

})