const { Translate } = require("@google-cloud/translate").v2;
const axios = require("axios");
const cheerio = require("cheerio"); // to scrap dictionary
const iso = require("iso-639-1"); // to change 'es' to English

// google translate api key
const translate = new Translate({
  key: "AIzaSyDM0rhgQyZczGMKnHus9nC6AABkIdNOTrU",
});

// this function is for translating text
async function translateWord(word, target) {
  let [translations1] = await translate.translate(word, target);
  translations1 = Array.isArray(translations1)
    ? translations1
    : [translations1];
  return translations1[0]; // return translate text
}
// get text language then convert 'en' to english
async function getWordLanguage(word) {
  // Detects the language of the text
  const [detection] = await translate.detect(word);
  const languageName = iso.getName(detection.language);
  return languageName;
}

async function CatchUserInput(text) {
  try {
    const responseText = await translateWord(text, "en"); // to change every language to english
    const wordLanguage = await getWordLanguage(text); // and to check what language user send for us to response him

    const response = await axios.get(
      `https://www.ldoceonline.com/dictionary/${responseText}`
    ); // we get this url with user word
    const html = response.data; // and then we get html file of it
    const $ = cheerio.load(html); // now we gotte html codes for this word

    // and we do this to get those in this html we got
    const defs = [];
    const examples = [];
    const opps = [];

    // they send definiton into this class
    $(".DEF").each((i, def) => {
      if (i < 3) {
        const text = $(def).text().trim(); // we split definitions and push it for defs array
        defs.push(text);
      }
    });

    $(".EXAMPLE").each((i, exm) => {
      if (i < 3) {
        const text = $(exm).text().trim();
        examples.push(text);
      }
    });

    $(".OPP").each((i, opp) => {
      if (i) {
        const text = $(opp)
          .text()
          .trim()
          .replace(/\bOPP \b/g, "");
        opps.push(text);
      }
    });

    if (
      defs[0] &&
      examples[0] &&
      defs[0].length !== 0 &&
      examples[0].length !== 0 // if we have defs and examples then we send it back
    ) {
      // Translate the array of strings to Kurdish using the translateWord function
      if (opps[0]) {
        // if we have opps then we return it if we do not have we do not return it because if we return it then we get error
        let opposits = opps[0];
        let kurdishOpp = await translateWord(opps[0], "ckb"); // translate opps to kurdish

        const [kurdishDef, kurdishExample, kurdishWord] = await Promise.all([
          translateWord(defs[0], "ckb"),
          translateWord(examples[0], "ckb"),
          translateWord(responseText, "ckb"),
        ]); // translate example and defs and opps

        // then we return it
        return {
          definition: defs[0],
          example: examples[0],
          opposits,
          kurdishDef,
          kurdishExample,
          kurdishOpp,
          kurdishWord,
          word: responseText,
        };
      } else {
        // if we don't have opps then we create this variable to response them
        let opposits = `Sorry it couldn't be found`;
        let kurdishOpp = `ببورە نەدۆزرایەوە`;

        const [kurdishDef, kurdishExample, kurdishWord] = await Promise.all([
          translateWord(defs[0], "ckb"),
          translateWord(examples[0], "ckb"),
          translateWord(responseText, "ckb"),
        ]); // translate those to kurdish

        return {
          definition: defs[0],
          example: examples[0],
          opposits,
          kurdishDef,
          kurdishExample,
          kurdishOpp,
          kurdishWord,
          word: responseText,
        };
      }
    } else {
      // if we do not have defs and examples then it mean we should translate user message
      const res = await translateWord(text, "ckb"); // we translate it to kurdish to response user

      // when we have pashto and persian those are near to kurdish and translate make fualts and we say if we have those and if we do not have wordLanguage it mean it's kurdish then response like that
      if (
        !wordLanguage ||
        wordLanguage == "Pashto" ||
        wordLanguage == "Persian"
      ) {
        return {
          englishText: responseText,
          kurdishText: text,
          wordLang: "English",
        };
      } // then we say if this statment not work then do this we cannot do it like 'else' because if we do it we got error now we say if nothing true in if statment above then you should do this
      return {
        englishText: text,
        kurdishText: res,
        wordLang: wordLanguage,
      };
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  CatchUserInput,
};
