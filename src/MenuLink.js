import MenuElement, { labelTemplate } from "./MenuElement.js";

const template = document.createElement("template");

template.innerHTML = `
  <li role="none">
    <a role="menuitem" href="#">
      ${labelTemplate}
    </a>
  </li>
`

export default class MenuLink extends MenuElement {

  static observedAttributes = [...MenuElement.observedAttributes, "href"];

  constructor() {
    super();
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  get href() {
    return this.getAttribute("href");
  }

  set href(url) {
    this.setAttribute("href", url);
  }

  #handleKeyNavigation = e => {
    if (this.disabled) return;

    switch (e.key) {
      case " ":
        this.shadowRoot.querySelector("a").click();
        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();

    const a = this.shadowRoot.querySelector("a");

    a.addEventListener("click", e => {
      if (this.disabled) e.preventDefault();
      else this.dispatchEvent(new Event("click", { target : this, detail : { originalEvent : e } }));
    });

    this.addEventListener("keydown", this.#handleKeyNavigation);
  }

  attributeChangedCallback(prop, prevValue, value) {
    super.attributeChangedCallback(...arguments);

    if (prop === "href") {
      this.shadowRoot.querySelector("a").href = value;
    }
  }

}
