export const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host([active]:not([disabled])) li {
    background-color:rgba(213, 220, 238, 1);
  }
  :host([disabled]) li {
    opacity:0.7;
    font-style:italic;
    cursor:not-allowed;
  }
  li {
    margin:0;
    padding:2px 5px;

    label {
      display:block
    }

    input:focus {
      outline:none;
    }
  }
`);

const template = document.createElement("template");
template.innerHTML = `
  <li role="none">
    <label role="menuitem">
      <input type="checkbox">
    </label>
  </li>
`

function cloneEvent(originalEvent) {
  return new Event(originalEvent.type, {
    bubbles: originalEvent.bubbles,
    cancelable: originalEvent.cancelable,
    composed: originalEvent.composed, // Optional: for shadow DOM
  });
}

export default class MenuCheckbox extends HTMLElement {

  #root
  #input

  static observedAttributes = ["active", "disabled"];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode : "open" });
    this.#root.adoptedStyleSheets = [style];
    this.#root.append(template.content.cloneNode(true));
    this.#input = this.#root.querySelector("input");
  }

  get label() {
    return this.getAttribute("label");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get checked() {
    return this.#input.checked;
  }

  #handleKeyDown = e => {
    if (this.active && e.key === "Enter") {
      this.#input.checked = !this.#input.checked;
      this.#input.dispatchEvent(new Event("change", { target : this }));
    }
  }

  connectedCallback() {
    this.#root.querySelector("label").append(
      document.createTextNode(this.label)
    );

    this.#input.addEventListener("change", e => {
      this.dispatchEvent(new CustomEvent("change", { detail : { originalEvent : e } }));
    });

    document.addEventListener("keydown", this.#handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#handleKeyDown);
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value != null) this.#input.focus();
    } else if (prop === "disabled") {
      this.#input.disabled = (value != null);
    }
  }

}

customElements.define("desktop-menu-checkbox", MenuCheckbox);