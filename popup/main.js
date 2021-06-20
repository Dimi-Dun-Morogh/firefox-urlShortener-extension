const API_ENV = {
  apiUrl: 'https://url-shortener-service.p.rapidapi.com/shorten',
};
const APP_UI = {
  shortenInput: document
    .querySelector('.form__shorten-wrap')
    .querySelector('input'),
  shortenButton: document
    .querySelector('.form__shorten-wrap')
    .querySelector('.btn'),
  copyInput: document.querySelector('.form__copy-wrap').querySelector('input'),
  copyButton: document.querySelector('.form__copy-wrap').querySelector('.btn'),
  historyBlock: document.querySelector('.history').querySelector('ul'),
  historyWrap: document.querySelector('.history'),
  spinner: document.querySelector('.spinner-border'),
  formCopywrap: document.querySelector('.form__copy-wrap'),
};

const shortener = {
  history: JSON.parse(localStorage.getItem('shortenerHistory')) || [],
  shortenUrl: async function (url) {
    try {
      APP_UI.spinner.classList.add('d-block');
      const response = await fetch(API_ENV.apiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': 'url-shortener-service.p.rapidapi.com',
          'X-RapidAPI-Key':
            'f7be69e6eamshed2d1b3edfe41ddp1ab2e6jsn7b7501a76852',
        },
        body: new URLSearchParams({
          'url': url,
      })
      });
      if (response.status === 400) {
        shortener.showError();
        return Promise.reject();
      }
      let responseObj = await response.json();
      // console.log(responseObj);
      return shortener.serializeResponse({...responseObj, oldUrl: url});
    } catch (error) {
      console.log(error);
    } finally {
      APP_UI.spinner.classList.remove('d-block');
    }
  },
  serializeResponse: function (data) {
    return {
      oldUrl: data.oldUrl,
      newUrl: data.result_url,
    };
  },
  historyTemplate: function (data) {
    return `
    <li><span class="old-url">${
      data.oldUrl.slice(0, 28) + '...'
    }</span> <span  class=""><a href="#">${
      data.newUrl
    }</a><span class=""><i class="far fa-copy"></i></span></span> </li>
`;
  },
  saveAndUpdateLocalStorage: function (obj) {
    shortener.history.push(obj);
    if (shortener.history.length > 5) shortener.history.shift(); //! нужен ререндер
    localStorage.setItem('shortenerHistory', JSON.stringify(shortener.history));
  },
  inithistory: function () {
    if (shortener.history.length) {
      APP_UI.historyWrap.classList.add('d-block');
      shortener.history.forEach((item) => {
        let template = shortener.historyTemplate(item);
        APP_UI.historyBlock.insertAdjacentHTML('afterbegin', template);
      });
    }
  },
  showError: function () {
    $(APP_UI.shortenInput).popover('show');
    setTimeout(3000, () => {
      shortener.hideError();
    });
  },
  hideError: function () {
    $(APP_UI.shortenInput).popover('dispose');
  },
};

function copytext(text) {
  var $tmp = $('<textarea>');
  $('body').append($tmp);
  $tmp.val(text).select();
  document.execCommand('copy');
  $tmp.remove();
}

//* init history
shortener.inithistory();

//EVENTS
//? main event
APP_UI.shortenButton.addEventListener('click', async (e) => {
  const url = APP_UI.shortenInput.value;
  console.log(url, 'url');
  const responseObj = await shortener.shortenUrl(url);
  const newLi = shortener.historyTemplate(responseObj);
  APP_UI.formCopywrap.classList.add('d-block');
  APP_UI.copyInput.value = responseObj.newUrl;
  APP_UI.historyBlock.insertAdjacentHTML('afterbegin', newLi);
  APP_UI.historyWrap.classList.add('d-block');
  shortener.saveAndUpdateLocalStorage(responseObj);
  $('.fa-copy').tooltip({
    //init tooptip for new history unit
    title: 'Copied!',
    trigger: 'click',
  });
});
//? copy from  copy input
$(APP_UI.copyButton).tooltip({
  //init tooptip
  title: 'Copied!',
  trigger: 'click',
});
APP_UI.copyButton.addEventListener('click', (e) => {
  copytext(APP_UI.copyInput.value);
  APP_UI.copyInput.classList.add('bg-success', 'text-white');

  setTimeout(() => {
    APP_UI.copyInput.classList.remove('bg-success', 'text-white');
    $(APP_UI.copyButton).tooltip('hide');
  }, 500);
});
//? copy from history
$('.fa-copy').tooltip({
  //init tooptip
  title: 'Copied!',
  trigger: 'click',
});
APP_UI.historyBlock.addEventListener('click', (e) => {
  if (e.target.classList.contains('fa-copy')) {
    const url = e.target.parentNode.parentElement.textContent;
    copytext(url);
    e.target.parentNode.parentElement.childNodes[0].classList.add(
      'bg-success',
      'text-white',
    );
    setTimeout(() => {
      e.target.parentNode.parentElement.childNodes[0].classList.remove(
        'bg-success',
        'text-white',
      );
      $(e.target).tooltip('hide');
    }, 500);
  }
});

//hide popopver
APP_UI.shortenInput.addEventListener('focus', (e) => {
  shortener.hideError();
});

//  moz-extension://a61193df-cf25-4a26-bd4c-e945c299a3e9/_generated_background_page.html
