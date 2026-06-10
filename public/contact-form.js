/**
 * One Thousand Tales — Website Contact Form Handler
 *
 * Drop this script into your photography website and add the
 * data-crm-form attribute to your <form> element.
 *
 * Submits to both:
 *   1. The CRM API  (stores the lead in the database)
 *   2. FormSubmit   (sends the email notification)
 *
 * Email is the critical path — success is shown if FormSubmit succeeds,
 * even if the CRM API is temporarily unavailable.
 *
 * Required HTML attributes:
 *   <form data-crm-form ...>
 *   <span data-error="name">        — per-field error messages
 *   <div data-global-error>         — form-level error banner
 *   <div data-success>              — shown after successful submit
 *
 * Optional spam protection:
 *   <input type="text" name="_honeypot" style="display:none" tabindex="-1" autocomplete="off">
 *
 * Services checkboxes should use name="services[]"
 */

(function () {
  "use strict";

  // ─── Configuration ───────────────────────────────────────────────────────
  var CRM_ENDPOINT =
    "https://onethousandtales-crm.vercel.app/api/website-enquiry";
  var FORMSUBMIT_EMAIL = "dilipkumarphotography@gmail.com"; // ← replace with your actual email
  // ─────────────────────────────────────────────────────────────────────────

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

  function validate(data) {
    var errors = {};
    var name = (data.name || "").trim();
    var email = (data.email || "").trim();
    var phone = (data.phone || "").trim();
    var message = (data.message || "").trim();

    if (name.length < 2) errors.name = "Please enter your full name.";
    if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
    if (phone.length > 0 && !PHONE_RE.test(phone)) errors.phone = "Please enter a valid phone number.";
    if (message.length < 10) errors.message = "Please write at least a brief message.";

    return errors;
  }

  function collectData(form) {
    var data = { services: [] };
    var elements = form.elements;
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (!el.name) continue;
      if (el.name === "services[]") {
        if (el.checked) data.services.push(el.value);
      } else if (el.type !== "submit") {
        data[el.name] = el.value;
      }
    }
    return data;
  }

  function showFieldError(form, field, message) {
    var errorEl = form.querySelector('[data-error="' + field + '"]');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.removeAttribute("hidden");
      errorEl.style.display = "";
    }
    var input = form.querySelector('[name="' + field + '"]');
    if (input) input.setAttribute("aria-invalid", "true");
  }

  function clearErrors(form) {
    form.querySelectorAll("[data-error]").forEach(function (el) {
      el.textContent = "";
      el.setAttribute("hidden", "");
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
    var globalError = form.querySelector("[data-global-error]");
    if (globalError) {
      globalError.textContent = "";
      globalError.setAttribute("hidden", "");
    }
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = "Sending…";
      btn.setAttribute("aria-busy", "true");
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || "Send";
      btn.removeAttribute("aria-busy");
    }
  }

  function showSuccess(form) {
    var successEl = form.querySelector("[data-success]");
    if (successEl) {
      successEl.removeAttribute("hidden");
      successEl.style.display = "";
      successEl.setAttribute("tabindex", "-1");
      successEl.focus();
    }
    // Hide all form inputs so only the success message is visible
    form.querySelectorAll("input, textarea, select, button, label, fieldset")
      .forEach(function (el) { el.style.display = "none"; });
  }

  function showGlobalError(form, message) {
    var errorEl = form.querySelector("[data-global-error]");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.removeAttribute("hidden");
      errorEl.style.display = "";
    }
  }

  function submitToCRM(data) {
    return fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        services: data.services,
        message: data.message,
        _honeypot: data._honeypot || "",
      }),
    }).then(function (res) {
      if (!res.ok) return res.json().then(function (j) { throw new Error(j.error || "CRM error " + res.status); });
      return res.json();
    });
  }

  function submitToFormSubmit(data) {
    var body = {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      services: data.services.join(", "),
      message: data.message,
      _subject: "New Enquiry — One Thousand Tales",
      _template: "table",
    };
    // Preserve any extra fields (e.g. Wedding Date) that were in the form
    var extraFields = ["Wedding Date"];
    extraFields.forEach(function (key) {
      if (data[key]) body[key] = data[key];
    });
    return fetch("https://formsubmit.co/ajax/" + FORMSUBMIT_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (!res.ok) throw new Error("FormSubmit error " + res.status);
      return res.json();
    });
  }

  function initContactForm(selector) {
    var form = document.querySelector(selector);
    if (!form) return;

    var isSubmitting = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      clearErrors(form);
      var data = collectData(form);
      var errors = validate(data);

      if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach(function (field) {
          showFieldError(form, field, errors[field]);
        });
        var first = form.querySelector("[aria-invalid]");
        if (first) first.focus();
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      isSubmitting = true;
      setLoading(submitBtn, true);

      Promise.allSettled([submitToCRM(data), submitToFormSubmit(data)]).then(
        function (results) {
          var crmOk = results[0].status === "fulfilled";
          var emailOk = results[1].status === "fulfilled";

          if (!crmOk) console.warn("[contact-form] CRM submission failed:", results[0].reason);
          if (!emailOk) console.warn("[contact-form] FormSubmit failed:", results[1].reason);

          if (emailOk || crmOk) {
            showSuccess(form);
          } else {
            showGlobalError(
              form,
              "Something went wrong. Please try again or email us directly."
            );
            isSubmitting = false;
            setLoading(submitBtn, false);
          }
        }
      );
    });
  }

  function init() {
    initContactForm("[data-crm-form]");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for manual use (multiple forms, dynamic content, etc.)
  window.initContactForm = initContactForm;
})();
