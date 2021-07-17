let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';
const message = document.querySelector('.message');
const app = document.querySelector('#app');

message.textContent = '...Loading';

//generate html
function generateHtml(tag, target, content) {
  let listItemTitle = document.createElement(tag);
  listItemTitle.textContent = content;
  target.appendChild(listItemTitle);
}

//current date
function currentDate() {
  return new Date().toJSON().slice(0, 10).replace(/-/g, '/') + ' Rates';
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        // hide our user interface that shows our A2HS button
        addBtn.style.display = 'none';
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});

function runApp() {
  const requestURL =
    'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11';

  const myRequest = new Request(requestURL);

  fetch(myRequest)
    .then((response) => response.json())
    .then((data) => {
      setTimeout(() => {
        const list = document.createElement('ul');
        app.appendChild(list);
        message.textContent = currentDate();
        for (const product of data) {
          let listItem = document.createElement('li');
          generateHtml('h2', listItem, product.ccy);
          generateHtml(
            'p',
            listItem,
            product.sale +
              product.base_ccy +
              ' - ' +
              product.buy +
              product.base_ccy
          );
          list.appendChild(listItem);
        }
      }, 1000);
    })
    .catch((error) => {
      console.log(error);
      message.textContent = 'Error';
      const reloadBtn = document.createElement('button');
      reloadBtn.classList.add('reload');
      message.appendChild(reloadBtn).textContent = 'Reload';
      reloadBtn.addEventListener('click', () => {
        location.reload();
      });
    });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(() => runApp())
    .catch(() => console.error);
}
