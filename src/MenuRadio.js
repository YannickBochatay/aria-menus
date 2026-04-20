import MenuInput from "./MenuInput.js";

export const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  [aria-checked=true] .icon::before {
    content:"●";
  }
`);

export default class MenuRadio extends MenuInput {

  constructor() {
    super();
    this.shadowRoot.querySelector("[role^=menuitem]").setAttribute("role", "menuitemradio");
    this.shadowRoot.adoptedStyleSheets.push(style);
  }

  attributeChangedCallback(prop, oldValue, value) {
    super.attributeChangedCallback(...arguments);
    if (prop === "checked" && value != null) {
      this.parentNode.querySelectorAll(`[name="${this.name}"]`).forEach(item => {
        if (item !== this) item.checked = false;
      })
    } 
  }
}
