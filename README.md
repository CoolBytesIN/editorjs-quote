# Quote block tool for Editor.js

This [Editor.js](https://editorjs.io/) block tool extends [@editorjs/quote](https://github.com/editor-js/quote) to include alignment options (see [Preview](https://github.com/CoolBytesIN/editorjs-quote?tab=readme-ov-file#preview)).

## Preview

#### Block Tool
![quote](https://api.coolbytes.in/media/handle/view/image/307/)

#### Block Settings
![settings](https://api.coolbytes.in/media/handle/view/image/308/)

## Installation

**Using `npm`**

```sh
npm install @coolbytes/editorjs-quote
```

**Using `yarn`**

```sh
yarn add @coolbytes/editorjs-quote
```

## Usage

Include it in the `tools` property of Editor.js config:

```js
const editor = new EditorJS({
  tools: {
    quote: Quote
  }
});
```

## Config Params

|Field|Type|Optional|Default|Description|
|---|---|---|---|---|
|placeholder|`string`|`Yes`|''|Placeholder text when empty|
|quoteStyles|`string[]`|`Yes`|['simple', 'block']|All supported quote styles|
|defaultQuoteStyle|`string`|`Yes`|'simple'|Preferred quote style|
|alignTypes|`string[]`|`Yes`|['left', 'center', 'right', 'justify']|All supported alignment options|
|defaultAlignType|`string`|`Yes`|'left'|Preferred alignment type|

&nbsp;

```js
const editor = EditorJS({
  tools: {
    quote: {
      class: Quote,
      config: {
        placeholder: 'Enter quote text',
        quoteStyles: ['simple', 'block'],
        defaultQuoteStyle: 'simple'
        alignTypes: ['left', 'center', 'right', 'justify'],
        defaultAlignType: 'left'
      }
    }
  }
});
```

## Output data

|Field|Type|Description|
|---|---|---|
|text|`string`|Quote text|
|style|`string`|Quote style|
|align|`string`|Alignment type|

&nbsp;

Example:

```json
{
  "time": 1715969561758,
  "blocks": [
    {
      "id": "_K5QcJHHuK",
      "type": "quote",
      "data": {
        "text": "Some quote text",
        "style": "block",
        "align": "left"
      }
    }
  ],
  "version": "2.29.1"
}
```
