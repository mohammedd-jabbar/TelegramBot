require("dotenv").config();
const express = require("express");
const { CatchUserInput } = require("./FetchData");
const axios = require("axios");

const { Telegraf } = require("telegraf");

const TOKEN = process.env.TOKEN;

const app = express();

const port = process.env.PORT || 3000;

// Create a new bot instance with your access token
const bot = new Telegraf(TOKEN);

// when user start bot
bot.start((ctx) => {
  ctx.reply(`سڵاو بەخێربێت بۆ بۆتەکەمان، من محمد جەبارم.

ئێمە لێرەین بۆ ئەوەی یارمەتیت بدەین پێناسەی ئەو وشانە بدۆزیتەوە کە بەدوایدا دەگەڕێیت بۆ باشترکردنی توانای زمانت، هەروەها وەرگێڕانی هەر ڕستە و بابەتێک بێت لە کوردی بۆ زیاتر لە 100 زمان.

بۆتەکەی ئێمە فەرهەنگێکی بەهێزە ئەتوانیت بۆ زۆربەی وشەکان پێناسە و نموونە و دژەواتا بەردەست بخات

بەکارهێنانی فەرهەنگ: بە هەر زمانێک بێت وشەکە بنووسە و زانیاری لەسەر وشەکە بە دەست بهێنە

بەکارهێنانی وەرگێڕ: تەنها ڕستەکە بنووسە

لە کاتی بوونی هەر کێشەیەک یان هەر پرسیارێک، تکایە دوودڵ مەبن پەیوەندیمان پێوە بکەن. دەتوانن لە ڕێگەی ئەم ئەکاوەنتە پەیوەندیمان پێوە بکەن بە [https://t.me/Mohammed_jabbar]

فێربوونتان پیرۆز بێت!`);
});

// when user type text to bot
bot.on("text", (ctx) => {
  try {
    const startTime = new Date(); // start time to set how many time take to return data
    let sentence = `${ctx.message.text}`;

    // bannded words
    const bannedWords = [
      "hack",
    ];

    // split sentence to word to check if there is any banned words
    for (let word of sentence.split(" ")) {
      if (bannedWords.includes(word.toLowerCase())) {
        let badWords = `وا دیارە کەسێک پێویستی بە سابونێکە بۆ ئەوەی دەمی بشوات! یان لەوانەیە ناچار بم کیبۆردەکەت بە سابوون بشۆم!🧼😉. عەیبە کاکە ئەم قسانە چیە ئێمە حەزمان بەم قسانە نیە با دووبارە نەبێتەوە😁.\n\nOops, looks like someone needs a bar of soap to wash their mouth out! or  I might have to wash your keyboard with soap!🧼😉. It's a shame sir, we don't like these things don't happen again😁.`;
        ctx.reply(badWords);
        console.log("وشەی قەدەغەکراوو - banned words");
        return null;
      }
    }
    // Regular expression to check text if there is any url for http and https
    const urlRegex = /(https?|http):\/\/[^\s]+/g;

    // check url
    if (sentence.match(urlRegex)) {
      let httpRes = `ببورە ناتوانین دەق بە بەستەرەوە(لینک) وەربگێڕین. تکایە بەستەرەکە(لینکەکە) لاببە و هەوڵبدەرەوە.\n\nSorry, we cannot translate text with links. Please remove the link and try again.`;
      ctx.reply(httpRes);
      console.log("لینک - link");
      return null;
    }

    // if message charcter more than 1500
    if (sentence.toLowerCase().length > 1500) {
      let lotCharecter = `پەیامەکەت زۆر درێژە ببوورە، ئێمە ناتوانین نامە لە ٩٠٠ پیت زیاتر وەربگێڕین بۆ زمانی کوردی.
تکایە پەیامەکەت بە دوو نامەی جیاواز بنێرە.\n\nSorry, we cannot translate messages of more than 900 characters into Kurdish.
Please send your message in two separate messages.`;
      ctx.reply(lotCharecter);
      console.log("نامەی درێژ - long characters");
      return null;
    }

    // if word true then send it to CatchUserInput in another file to give us results
    if (sentence) {
      CatchUserInput(sentence).then((response) => {
        if (response.kurdishText) {
          // if we have kurdishText then send translate because if there is kurdishText it mean we have sentence to translate
          const endTime = new Date(); // when result end then we stop time to send to user how it take to send result to user
          const timeDiff = (endTime - startTime) / 1000;
          const responseTime = timeDiff.toFixed(2); // maek it send result only 2 word like 1.5
          const moreResponseTime = Math.round(responseTime * 2) / 2; // and we plus it 0.5

          let kurdishTranslate = `🌍 ئەنجامی وەرگێڕان 🌍\n\n💬 کوردی: ${response.kurdishText}\n\n⏱️ کاتی خایەنراو: ${moreResponseTime} چرکە\n\n---\n\n🌍 Translation Results 🌍\n\n💬 ${response.wordLang}: ${response.englishText}\n\n⏱️ Response Time: ${moreResponseTime} seconds`; // output for user

          ctx.reply(`${kurdishTranslate}`); // we send it

          console.log("وەرگێران - translate");
        } else {
          // if we do not have kurdisText it mean we have definitin and example and user type word then we do thos
          const endTime = new Date();
          const timeDiff = (endTime - startTime) / 1000;
          const responseTime = timeDiff.toFixed(1);
          const moreResponseTime = Math.round(responseTime * 2) / 2;

          let message = `📚 ئەنجامەکانی فەرهەنگ 📚\n\n🔍 وشە: ${response.kurdishWord}\n\n📖 پێناسە: ${response.kurdishDef}\n\n📝 نموونە: ${response.kurdishExample}\n\n`;
          let kurdishTranslate = `${message}🌟 دژەواتا: ${response.kurdishOpp}\n\n⏱️ کاتی خایەنراو: ${moreResponseTime} چرکە\n\n---\n\n📚 Dictionary Results 📚\n\n🔍 Word: ${response.word}\n\n📖 Definition: ${response.definition}\n\n📝 Example: ${response.example}\n\n🌟 Antonym: ${response.opposits}\n\n⏱️ Response Time: ${moreResponseTime} seconds`; // output for user

          ctx.reply(kurdishTranslate); // we send it
          console.log("فەرهەنگ - dictionary");

          const API_KEY = "22355168-3f52f3602bf0711e59481edb6";
          axios // to send image
            .get(
              `https://pixabay.com/api/?key=${API_KEY}&q=${response.word}&safesearch=true`
            )
            .then((response) => {
              if (response.data.hits.length > 0) {
                const firstImage = response.data.hits[0];

                ctx.replyWithPhoto({ url: firstImage.webformatURL }); // we send image url because we cannot send image file to telegram
                console.log("وێنە - picture");
              } else {
                // if we can't fetch images
                ctx.reply(
                  ".ببوورە، هیچ وێنەیەک نەدۆزرایەوە\n\nSorry, no pictures found."
                );
                console.log("وێنە نەنێردا - picture problem");
              }
            })
            .catch((error) => {
              console.error(error);
              ctx.reply(
                `ببورە، هەڵەیەک روویدا. تکایە دووبارە هەوڵبدەوە\n\n Sorry, an error occurred in sending. Please try again`
              );
            });
        }
      });
    }
  } catch (error) {
    console.log(error + error.message);
    console.log(
      `ببورە، هەڵەیەک روویدا. تکایە دووبارە هەوڵبدەوە\n\n Sorry, an error occurred in sending. Please try again`
    );
    ctx.reply(
      `ببورە، هەڵەیەک روویدا. تکایە دووبارە هەوڵبدەوە\n\n Sorry, an error occurred in sending. Please try again`
    );
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Start the bot
bot.launch();
