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

      const statusNode = document.getElementById('formStatus');
      if (!name || !normalizedPhone || normalizedPhone.length < 10) {
        const errorMsg = 'لطفاً نام کامل و شماره تماس معتبر (حداقل ۱۰ رقم) را وارد فرمایید.';
        if (statusNode) {
          statusNode.textContent = errorMsg;
          statusNode.className = 'form-status error';
        }
        alert(errorMsg);
        return;
      } else if (statusNode) {
        statusNode.textContent = '';
        statusNode.className = 'form-status';
      }

      const text = `سلام، من از وب‌سایت شهرک رهایشی حاجی فضل احمد عمر درخواست اطلاعات دارم.\n\nنام: ${name}\nشماره تماس: ${normalizedPhone}\nنوع ملک: ${property}\nپیام: ${message || '—'}`;
      const whatsappUrl = `https://wa.me/93797104648?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener');
    });
  }

  // Keyboard accessibility: Close mobile nav on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('show')) {
      mainNav.classList.remove('show');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    }
  });

});