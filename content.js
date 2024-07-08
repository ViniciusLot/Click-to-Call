// Função para substituir números de telefone em nós de texto
function replacePhoneNumbers(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentNode;
    if (parent && parent.tagName !== 'A' && !parent.querySelector('a[href^="sip:"]')) {
      const newHTML = node.nodeValue.replace(
        /(\+?55\s?)?(\(?\d{2}\)?\s?)(\d{4,5})-?(\d{4,5})/g,
        (match, g1, g2, g3, g4) => {
          const phoneNumber = `0${g2}${g3}${g4}`.replace(/\D/g, ''); // Sempre adiciona 0 na frente e remove não dígitos
          return `<a href="sip:${phoneNumber}" class="sip-link" target="_blank">${match}</a>`;
        }
      );
      if (newHTML !== node.nodeValue) {
        const newSpan = document.createElement('span');
        newSpan.innerHTML = newHTML;
        parent.replaceChild(newSpan, node);
        console.log(`Replaced phone number in TEXT_NODE: ${node.nodeValue}`);
      }
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
    Array.from(node.childNodes).forEach(replacePhoneNumbers);
  }
}

// Função para substituir números de telefone em elementos específicos
function replacePhoneNumbersInSpecificElements() {
  const phoneElements = document.querySelectorAll('span.value.no-edit, div.contact-info, p.contact-info, span.contact-info');

  phoneElements.forEach(element => {
    const phoneNumberText = element.textContent;
    const regex = /(\+?55\s?)?(\(?\d{2}\)?\s?)(\d{4,5})-?(\d{4,5})/g;

    const matches = phoneNumberText.match(regex);
    if (matches) {
      matches.forEach(match => {
        const phoneNumber = `0${match.replace(/\D/g, '').replace(/^55/, '')}`; // Remove não dígitos, substitui 55 por nada e adiciona 0
        if (!element.querySelector(`a[href="sip:${phoneNumber}"]`)) {
          const link = `<a href="sip:${phoneNumber}" class="sip-link" target="_blank">${match}</a>`;
          element.innerHTML = element.innerHTML.replace(match, link);
          console.log(`Replaced phone number in specific element: ${match}`);
        }
      });
    }
  });
}

// Função para adicionar comportamento de clique personalizado
function addClickBehavior() {
  document.body.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.classList.contains('sip-link')) {
      event.preventDefault();
      const sipLink = event.target.href;

      // Cria um link invisível para simular o clique
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = sipLink;
      tempLink.target = '_blank';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      console.log(`Clicked on SIP link: ${sipLink}`);
    }
  });
}

let debounceTimeout;
const debounce = (callback, delay) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(callback, delay);
};

const observerCallback = (mutations) => {
  debounce(() => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE')) {
          replacePhoneNumbers(node);
          replacePhoneNumbersInSpecificElements();
        }
      });
    });
  }, 100);
};

replacePhoneNumbers(document.body);
replacePhoneNumbersInSpecificElements();
addClickBehavior();

const observer = new MutationObserver(observerCallback);

observer.observe(document.body, {
  childList: true,
  subtree: true
});
