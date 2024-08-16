require('./index.css');

const quoteIcon = require('./icons/quote.js');
const simplequoteIcon = require('./icons/simplequote.js');
const getAlignmentIcon = require('./icons/alignment.js');

/**
 * Quote plugin for Editor.js
 * Supported config:
 *     * placeholder {string} (Default: '')
 *     * quoteStyles {string[]} (Default: Quote.QUOTE_STYLES)
 *     * defaultQuoteStyle {string} (Default: 'simple')
 *     * alignTypes {string[]} (Default: Quote.ALIGN_TYPES)
 *     * defaultAlignType {string} (Default: 'left')
 *
 * @export
 * @class Quote
 * @typedef {Quote}
 */
export default class Quote {
  /**
   * Editor.js Toolbox settings
   *
   * @static
   * @readonly
   * @type {{ icon: any; title: string; }}
   */
  static get toolbox() {
    return {
      icon: quoteIcon, title: 'Quote',
    };
  }

  /**
   * To notify Editor.js core that read-only is supported
   *
   * @static
   * @readonly
   * @type {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to press Enter inside the block tool
   *
   * @static
   * @readonly
   * @type {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * All supported quote styles
   *
   * @static
   * @readonly
   * @type {string[]}
   */
  static get QUOTE_STYLES() {
    return ['simple', 'block'];
  }

  /**
   * Default quote style
   *
   * @static
   * @readonly
   * @type {string}
   */
  static get DEFAULT_QUOTE_STYLE() {
    return 'simple';
  }

  /**
   * All supported alignment types
   *
   * @static
   * @readonly
   * @type {string[]}
   */
  static get ALIGN_TYPES() {
    return ['left', 'center', 'right', 'justify'];
  }

  /**
   * Default alignment type
   *
   * @static
   * @readonly
   * @type {string}
   */
  static get DEFAULT_ALIGN_TYPE() {
    return 'left';
  }

  /**
   * Automatic sanitize config for Editor.js
   *
   * @static
   * @readonly
   * @type {{ text: {}; style: boolean; align: boolean; }}
   */
  static get sanitize() {
    return {
      text: {},
      style: false,
      align: false,
    };
  }

  /**
   * Editor.js config to convert one block to another
   *
   * @static
   * @readonly
   * @type {{ export: string; import: string; }}
   */
  static get conversionConfig() {
    return {
      export: 'text', // this property of tool data will be used as string to pass to other tool
      import: 'text', // to this property imported string will be passed
    };
  }

  /**
   * Creates an instance of Quote.
   *
   * @constructor
   * @param {{ api: {}; readOnly: boolean; config: {}; data: {}; }} props
   */
  constructor({
    api, readOnly, config, data,
  }) {
    this._api = api;
    this._readOnly = readOnly;
    this._config = config || {};
    this._data = this._normalizeData(data);
    this._CSS = {
      block: this._api.styles.block,
      wrapper: 'ce-quote-wrapper',
      quote: 'ce-quote',
      wrapperForStyle: (quoteStyle) => `ce-quote-${quoteStyle}`,
      wrapperForAlignment: (alignType) => `ce-quote-align-${alignType}`,
    };
    this._element = this._getElement();
  }

    /**
   * All available quote styles
   * - Finds intersection between supported and user selected quote styles
   *
   * @readonly
   * @type {string[]}
   */
    get availableQuoteStyles() {
      return this._config.quoteStyles ? Quote.QUOTE_STYLES.filter(
        (style) => this._config.quoteStyles.includes(style),
      ) : Quote.QUOTE_STYLES;
    }
  
    /**
     * User's default quote style
     * - Finds union of user choice and the actual default
     *
     * @readonly
     * @type {string}
     */
    get userDefaultQuoteStyle() {
      if (this._config.defaultQuoteStyle) {
        const userSpecified = this.availableQuoteStyles.find(
          (align) => align === this._config.defaultQuoteStyle,
        );
        if (userSpecified) {
          return userSpecified;
        }
        // eslint-disable-next-line no-console
        console.warn('(ง\'̀-\'́)ง Quote Tool: the default quote style specified is invalid');
      }
      return Quote.DEFAULT_QUOTE_STYLE;
    }

  /**
   * All available alignment types
   * - Finds intersection between supported and user selected alignment types
   *
   * @readonly
   * @type {string[]}
   */
  get availableAlignTypes() {
    return this._config.alignTypes ? Quote.ALIGN_TYPES.filter(
      (align) => this._config.alignTypes.includes(align),
    ) : Quote.ALIGN_TYPES;
  }

  /**
   * User's default alignment type
   * - Finds union of user choice and the actual default
   *
   * @readonly
   * @type {string}
   */
  get userDefaultAlignType() {
    if (this._config.defaultAlignType) {
      const userSpecified = this.availableAlignTypes.find(
        (align) => align === this._config.defaultAlignType,
      );
      if (userSpecified) {
        return userSpecified;
      }
      // eslint-disable-next-line no-console
      console.warn('(ง\'̀-\'́)ง Quote Tool: the default align type specified is invalid');
    }
    return Quote.DEFAULT_ALIGN_TYPE;
  }

  /**
   * To normalize input data
   *
   * @param {*} data
   * @returns {{ text: string; style: string; align: string; }}
   */
  _normalizeData(data) {
    const newData = {};
    if (typeof data !== 'object') {
      data = {};
    }

    newData.text = data.text || '';
    newData.style = data.style || this.userDefaultQuoteStyle;
    newData.align = data.align || this.userDefaultAlignType;
    return newData;
  }

  /**
   * Current quote style
   *
   * @readonly
   * @type {string}
   */
  get currentQuoteStyle() {
    let quoteStyle = this.availableQuoteStyles.find((style) => style === this._data.style);
    if (!quoteStyle) {
      quoteStyle = this.userDefaultQuoteStyle;
    }
    return quoteStyle;
  }

  /**
   * Current alignment type
   *
   * @readonly
   * @type {string}
   */
  get currentAlignType() {
    let alignType = this.availableAlignTypes.find((align) => align === this._data.align);
    if (!alignType) {
      alignType = this.userDefaultAlignType;
    }
    return alignType;
  }

  /**
   * HTML element to represent opening block quote
   *
   * @returns {*}
   */
  _createOpeningQuote() {
    const topQuoteDiv = document.createElement('DIV');
    topQuoteDiv.innerHTML = '“';
    topQuoteDiv.contentEditable = false;
    topQuoteDiv.classList.add(this._CSS.wrapper, this._CSS.wrapperForAlignment('left'));
    return topQuoteDiv;
  }

  /**
   * HTML element to represent closing block quote
   *
   * @returns {*}
   */
  _createClosingQuote() {
    const bottomQuoteDiv = document.createElement('DIV');
    bottomQuoteDiv.innerHTML = '”';
    bottomQuoteDiv.contentEditable = false;
    bottomQuoteDiv.classList.add(this._CSS.wrapper, this._CSS.wrapperForAlignment('right'));
    return bottomQuoteDiv;
  }

  /**
   * HTML element to represent quote content
   *
   * @returns {*}
   */
  _createQuoteContent() {
    const contentDiv = document.createElement('DIV');
    contentDiv.innerHTML = this._data.text || '';
    contentDiv.contentEditable = !this._readOnly;
    contentDiv.classList.add(
      this._CSS.quote,
      this._CSS.wrapperForStyle(this.currentQuoteStyle),
      this._CSS.wrapperForAlignment(this.currentAlignType)
    );
    contentDiv.dataset.placeholder = this._api.i18n.t(this._config.placeholder || 'Enter quote text');

    // Add event listener for the Backspace key
    contentDiv.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const startContainer = range.startContainer;
          const closestDiv = startContainer.nodeType === Node.ELEMENT_NODE
            ? startContainer.closest('div')
            : startContainer.parentNode.closest('div');

          if (closestDiv.innerText.trim() === '') {
            // Move cursor to end of the previous div
            let previousDiv = closestDiv.previousElementSibling;

            // Ensure we found a previous div
            if (previousDiv && previousDiv.tagName === 'DIV') {
              // Create a new range and place it at the end of the previous div
              const range = document.createRange();
              const selection = window.getSelection();
              range.selectNodeContents(previousDiv);
              range.collapse(false); // Move cursor to the end of the previous div
              selection.removeAllRanges();
              selection.addRange(range);
            }

            event.preventDefault();
            closestDiv.remove();
          }
        }
      }
    });
    return contentDiv;
  }

  /**
   * Create and return block element
   *
   * @returns {*}
   */
  _getElement() {
    const parentDiv = document.createElement('DIV');
    parentDiv.classList.add(this._CSS.block);

    if (this.currentQuoteStyle === 'block') {
      // Opening Quote
      parentDiv.appendChild(this._createOpeningQuote());
    }

    // Quote Content
    parentDiv.appendChild(this._createQuoteContent());

    if (this.currentQuoteStyle === 'block') {
      // Closing Quote
      parentDiv.appendChild(this._createClosingQuote());
    }
    return parentDiv;
  }

  /**
   * Function to target the quote content element
   *
   * @param {*} element
   * @returns {*}
   */
  _getContentTarget(element) {
    if (this.currentQuoteStyle === 'block') {
      return element.children[1]
    }
    else {
      return element.children[0]
    }
  }

  /**
   * Callback for Alignment block tune setting
   *
   * @param {string} newAlign
   */
  _setAlignType(newAlign) {
    this._data.align = newAlign;

    // Quote content element
    const contentTarget = this._getContentTarget(this._element);

    // Remove old CSS class and add new class
    Quote.ALIGN_TYPES.forEach((align) => {
      const alignClass = this._CSS.wrapperForAlignment(align);
      contentTarget.classList.remove(alignClass);
      if (newAlign === align) {
        contentTarget.classList.add(alignClass);
      }
    });
  }

  /**
   * Replace the current element with a new one
   */
  _replaceElement() {
    if (this._element.parentNode) {
      const newElement = this._getElement();
      this._element.parentNode.replaceChild(newElement, this._element);
      this._element = newElement;
    }
  }

  /**
   * Callback for Quote style change to simple
   */
  _setSimpleQuote() {
    // Capturing current text
    this._data.text = this._getContentTarget(this._element).innerHTML;

    if (this.currentQuoteStyle !== 'simple') {
      this._data.style = 'simple';
      this._replaceElement();
    }
  }

  /**
   * Callback for Quote style change to block
   */
  _setBlockQuote() {
      // Capturing current text
      this._data.text = this._getContentTarget(this._element).innerHTML;

    if (this.currentQuoteStyle !== 'block') {
      this._data.style = 'block';
      this._replaceElement();
    }
  }

  /**
   * HTML element to render on the UI by Editor.js
   *
   * @returns {*}
   */
  render() {
    return this._element;
  }

  /**
   * Editor.js save method to extract block data from the UI
   *
   * @param {*} blockContent
   * @returns {{ text: string }}
   */
  save(blockContent) {
    return {
      text: this._getContentTarget(blockContent).innerHTML,
      style: this.currentQuoteStyle,
      align: this.currentAlignType,
    };
  }

  /**
   * Editor.js validation (on save) code for this block
   * - Skips empty blocks
   *
   * @param {*} savedData
   * @returns {boolean}
   */
  validate(savedData) {
    return savedData.text.trim() !== '';
  }

  /**
   * Create a Block menu setting
   *
   * @param {string} icon
   * @param {string} label
   * @param {*} onActivate
   * @param {boolean} isActive
   * @param {string} group
   * @returns {{ icon: string; label: string; onActivate: any; isActive: boolean; closeOnActivate: boolean; toggle: string; }}
   */
  _createSetting = (icon, label, onActivate, isActive, group) => ({
    icon,
    label,
    onActivate,
    isActive,
    closeOnActivate: true,
    toggle: group,
  });

  /**
   * Block Tunes Menu items
   *
   * @returns {[{*}]}
   */
  renderSettings() {
    const starStyle = this._createSetting(
      simplequoteIcon, 'Simple Quote', () => this._setSimpleQuote(), this.currentQuoteStyle === 'simple', 'simple'
    );
    const dashStyle = this._createSetting(
      quoteIcon, 'Block Quote', () => this._setBlockQuote(), this.currentQuoteStyle === 'block', 'block'
    );
    const alignTypes = this.availableAlignTypes.map((align) => ({
      icon: getAlignmentIcon(align),
      label: this._api.i18n.t(align.charAt(0).toUpperCase() + align.slice(1)),
      onActivate: () => this._setAlignType(align),
      isActive: align === this.currentAlignType,
      closeOnActivate: true,
      toggle: 'align',
    }));

    return [starStyle, dashStyle, ...alignTypes]
  }

  /**
   * Editor.js method to merge similar blocks on `Backspace` keypress
   *
   * @param {*} data
   */
  merge(data) {
    const contentTarget = this._getContentTarget(this._element);
    contentTarget.innerHTML = contentTarget.innerHTML + data.text || '';
  }
}
