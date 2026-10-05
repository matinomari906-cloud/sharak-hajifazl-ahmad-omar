document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const yearNode = document.getElementById('year');
  const leadForm = document.getElementById('leadForm');

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('show');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const property = document.getElementById('property').value;
      const message = document.getElementById('message').value.trim();

      const normalizedPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

      if (!name || !normalizedPhone || normalizedPhone.length < 10) {
        alert('لطفاً نام و شماره تماس معتبر را وارد کنید.');
        return;
      }

      const text = `سلام، من از وب‌سایت شهرک رهایشی حاجی فضل احمد عمر درخواست اطلاعات دارم.\n\nنام: ${name}\nشماره تماس: ${normalizedPhone}\nنوع ملک: ${property}\nپیام: ${message || '—'}`;
      const whatsappUrl = `https://wa.me/93797104648?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener');
    });
  }
});
