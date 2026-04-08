const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    --icon-width:1rem;
    --bg-color:rgb(213, 220, 238);
  }
  :host([active]:not([disabled])) li {
    background-color:var(--bg-color);
  }
  :host([disabled]) li {
    .label {
      opacity:0.7;
      font-style:italic;
      cursor:not-allowed;
    }
  }
  li {
    margin:0;
    padding:2px 5px;
    position:relative;
    width:100%;
    box-sizing:border-box;
    display:flex;
    align-items:center;
  }
`);

export default class MenuElement extends HTMLElement {

  static observedAttributes = ["active"];

  constructor() {
    super();
    const root = this.attachShadow({ mode : "open" });
    root.adoptedStyleSheets = [style];
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(bool) {
    if (bool) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  get label() {
    return [...this.childNodes]?.find(node => node.nodeName === "#text" && node.nodeValue.trim())?.nodeValue.trim();
  }

  connectedCallback() {
    const slottedLabel = this.querySelector("[slot=label]");
    if (slottedLabel) {
      slottedLabel.removeAttribute("slot");
      this.shadowRoot.querySelector("slot:not([name])").assign(slottedLabel);
    }
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value != null) this.shadowRoot.querySelector(".focusedElmt").focus();
    }
  }
}