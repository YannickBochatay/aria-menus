const style =  new CSSStyleSheet();

style.replaceSync(/*css*/`
  :host {
    --icon-width:1rem;
    --bg-color:rgb(213, 220, 238);
    --margin-left:2rem;
    --icon-margin:0 0.4rem 0 0;
  }
  :host([active]) li {
    background-color:var(--bg-color);
  }
  :host([disabled]) li {
    background-color:unset;
    .label {
      opacity:0.7;
      font-style:italic;
      cursor:not-allowed;
    }
  }
  :host([nocaret]) li .arrow {
    display:none;
  }
  li {
    padding:0.2rem 0.3rem;
    margin:0;
    position:relative;
    box-sizing:border-box;
    display:flex;
    align-items:center;
    &:hover {
      background-color:var(--bg-color);
    }
    a {
      text-decoration:none;
      color:inherit;
      cursor:default;
      flex:1;
      
      .label {
        white-space:nowrap;
        flex:1;
      }
    }
    .arrow {
      font-size:0.6rem;
      margin-left:var(--margin-left);
      cursor:default;
    }
  }
  ::slotted([slot=menu]) {
    z-index:1;
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

    if (!this.hasAttribute("direction")) {
      this.setAttribute("direction", "row");
    }
  }

  attributeChangedCallback(prop, prevValue, value) {
    if (prop === "active") {
      if (value != null) this.shadowRoot.querySelector(".focusedElmt").focus();
    }
  }
}