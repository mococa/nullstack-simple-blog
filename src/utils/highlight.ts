import hljs from 'highlight.js';

export const highlight = (str, lang) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (err) {
      //
    }
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {
    //
  }

  return '';
};
