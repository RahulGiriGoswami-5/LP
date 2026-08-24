/**
 * FAQ Accordion — standalone interaction logic.
 * Only ONE answer may be open at a time.
 * Clicking the open card again closes it.
 */
(function () {
  'use strict';

  const cards = document.querySelectorAll('.faq-card');

  cards.forEach(function (card) {
    const btn  = card.querySelector('.faq-card__question');
    const body = card.querySelector('.faq-card__body');

    btn.addEventListener('click', function () {
      const isOpen = card.classList.contains('is-open');

      // Close every card first
      cards.forEach(function (c) {
        const b = c.querySelector('.faq-card__body');
        const q = c.querySelector('.faq-card__question');
        c.classList.remove('is-open');
        b.style.maxHeight = null;
        q.setAttribute('aria-expanded', 'false');
      });

      // If the clicked card was closed, open it
      if (!isOpen) {
        card.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
