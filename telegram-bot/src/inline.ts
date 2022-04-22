import * as db from './db';
import cache from './cache';
import * as middleware from './middleware';
import * as inline from './inline';

/**
 * Helper function for reply keyboard
 * @param {Array} keys
 * @return {Object} reply_markup
 */
function replyKeyboard(keys) {
  return {
    parse_mode: 'html',
    reply_markup: {
      keyboard: keys
    }
  };
};

/**
 * Helper function to remove keyboard
 * @return {Object} reply_markup
 */
function removeKeyboard() {
  return {
    parse_mode: 'html',
    reply_markup: {
      remove_keyboard: true,
    },
  };
};

/**
 * Initialize categories from config
 * @param {Object} bot
 * @param {Object} config
 * @return {Array} keys
 */
function initInline(bot, config) {
  const keys = [];
  // Get categories from config file
  for (const i in cache.config.categories) {
    if (i !== undefined) {
      keys.push([cache.config.categories[i].name]);
      const subKeys = [];
      // Check if it has no subcategory
      if (cache.config.categories[i].subgroups == undefined) {
        // Create category button events for start with parameter
        // Full category name to 64 Byte without special chars
        let startStr = '/start ' + cache.config.categories[i].name
          .replace(/[\[\]\:\ "]/g, '')
          .substr(0,63);
        bot.hears(startStr, (ctx) => {
          ctx.session.mode = undefined;
          ctx.session.modeData = undefined;
          // Info text
          if (cache.config.categories[i].msg != undefined) {
            middleware.reply(ctx, cache.config.categories[i].msg);
          } else {
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${cache.config.categories[i].name}</b>`, removeKeyboard());
            ctx.session.group = cache.config.categories[i].group_id;
            ctx.session.groupCategory = cache.config.categories[i].name;
          }
        });
        // Create subcategory button events
        bot.hears(cache.config.categories[i].name, (ctx) => {
          ctx.session.mode = undefined;
          ctx.session.modeData = undefined;
          // Info text
          if (cache.config.categories[i].msg != undefined) {
            middleware.reply(ctx, cache.config.categories[i].msg);
          } else {
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${cache.config.categories[i].name}</b>`, removeKeyboard());
            ctx.session.group = cache.config.categories[i].group_id;
            ctx.session.groupCategory = cache.config.categories[i].name;
          }
        });
        continue;
      }
      // Get subcategories
      for (const j in cache.config.categories[i].subgroups) {
        if (j !== undefined) {
          let categoryFullId = [cache.config.categories[i].name +
          ': ' + cache.config.categories[i].subgroups[j].name];
          subKeys.push(categoryFullId);
          
          // Create subcategory button events for start with parameter
          // Full category name to 64 Byte without special chars
          let startStr = '/start ' + JSON.stringify(categoryFullId)
            .replace(/[\[\]\:\ "]/g, '')
            .substr(0,63);
          bot.hears(startStr, (ctx) => {
            ctx.session.mode = undefined;
            ctx.session.modeData = undefined;
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${categoryFullId}</b>`, removeKeyboard());
            // Set subgroup
            ctx.session.group = cache.config.categories[i].subgroups[j].group_id;
            ctx.session.groupCategory = cache.config.categories[i].subgroups[j].name;
          });
          
          // Create subcategory button events
          bot.hears(categoryFullId, (ctx) => {
            ctx.session.mode = undefined;
            ctx.session.modeData = undefined;
            middleware.reply(ctx, cache.config.language.msgForwarding + '\n' +
              `<b>${categoryFullId}</b>`, removeKeyboard());
            // Set subgroup
            ctx.session.group = cache.config.categories[i].subgroups[j].group_id;
            ctx.session.groupCategory = cache.config.categories[i].subgroups[j].name;
          });
        }
      }
      subKeys.push([cache.config.language.back]);
      // Create subcategory buttons
      bot.hears(cache.config.categories[i].name, (ctx) => {
        ctx.session.mode = undefined;
        ctx.session.modeData = undefined;
        middleware.reply(ctx, cache.config.language.whatSubCategory,
            replyKeyboard(subKeys));
      });
    }
  }
  return keys;
};

/**
 * Callback query handler
 * @param {Object} bot
 * @param {Object} ctx
 */
function callbackQuery(bot, ctx) {
    let id = ctx.callbackQuery.from.id;
    let msg_id = ctx.callbackQuery.message.message_id;

    // get taipei time
    var date = new Date(),
        locale = 'en-US',
        timeZone = 'Asia/Taipei';

    // time in Taipei
    var weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }).format(date);
    var time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone }).format(date);


    // English version
    if(ctx.callbackQuery.data === 'eng') {
        middleware.updateMsg(id, msg_id, cache.config.language.startCommandText, cache.config.menus.mainMenu);
        return;
    }
    else if(ctx.callbackQuery.data === 'general') {
        middleware.updateMsg(id, msg_id, cache.config.language.GeneralCommandText, cache.config.menus.general_menu);
        return;
    }
    else if(ctx.callbackQuery.data === 'live support') {
        // Check if working hours
        // if(weekday === 'Saturday' || weekday === 'Sunday' || parseInt(time.substring(0,2)) < 10 || parseInt(time.substring(0,2)) > 18) {
            // middleware.updateMsg(id, msg_id, cache.config.language.livesupportOffmsg, cache.config.menus.goback_mainMenu);
            // return;
        // }
        // else {
            middleware.updateMsg(id, msg_id, cache.config.language.livesupportCommandText, cache.config.menus.goback_mainMenu);
            return;
        // }
    }
    else if(ctx.callbackQuery.data === 'return') {
        middleware.updateMsg(id, msg_id, cache.config.language.startCommandText, cache.config.menus.mainMenu);
        return;
    }
    // account category
    else if(ctx.callbackQuery.data === 'account') {
        middleware.updateMsg(id, msg_id, cache.config.language.ChooseQuestionsText, cache.config.menus.account_menu)
        return;
    }
    else if(ctx.callbackQuery.data === 'accountQ1') {
        middleware.updateMsg(id, msg_id, cache.config.language.accountA1, cache.config.menus.goback_account)
        return;
    }
    else if(ctx.callbackQuery.data === 'accountQ2') {
        middleware.updateMsg(id, msg_id, cache.config.language.accountA2, cache.config.menus.goback_account)
        return;
    }
    else if(ctx.callbackQuery.data === 'accountQ3') {
        middleware.updateMsg(id, msg_id, cache.config.language.accountA3, cache.config.menus.goback_account)
        return;
    }
    // trade category
    else if(ctx.callbackQuery.data === 'trade') {
        middleware.updateMsg(id, msg_id, cache.config.language.ChooseQuestionsText, cache.config.menus.trade_menu)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ0') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA0, cache.config.menus.goback_trade)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ01') {
      middleware.updateMsg(id, msg_id, cache.config.language.tradeA01, cache.config.menus.goback_trade)
      return;
  }
    else if(ctx.callbackQuery.data === 'tradeQ1') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA1, cache.config.menus.goback_trade)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ2') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA2, cache.config.menus.goback_trade)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ3') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA3, cache.config.menus.goback_trade)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ4') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA4, cache.config.menus.goback_trade)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ5') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA5, cache.config.menus.goback_trade)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ6') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA6, cache.config.menus.goback_trade)
        return;
    }
    // referral category
    else if(ctx.callbackQuery.data === 'referral') {
        middleware.updateMsg(id, msg_id, cache.config.language.ChooseQuestionsText, cache.config.menus.referral_menu)
        return;
    }
    else if(ctx.callbackQuery.data === 'referralQ1') {
        middleware.updateMsg(id, msg_id, cache.config.language.referralA1, cache.config.menus.goback_referral)
        return;
    }
    else if(ctx.callbackQuery.data === 'referralQ2') {
        middleware.updateMsg(id, msg_id, cache.config.language.referralA2, cache.config.menus.goback_referral)
        return;
    }

    // Chinese version
    else if(ctx.callbackQuery.data === 'chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.startCommandText_chn, cache.config.menus.mainMenu_chn);
        return;
    }
    else if(ctx.callbackQuery.data === 'general_chn') {
    middleware.updateMsg(id, msg_id, cache.config.language.GeneralCommandText_chn, cache.config.menus.general_menu_chn);
    return;
    }
    else if(ctx.callbackQuery.data === 'live support_chn') {
        // Check if working hours
        //if(weekday === 'Saturday' || weekday === 'Sunday' || parseInt(time.substring(0,2)) < 10 || parseInt(time.substring(0,2)) > 18) {
            // middleware.updateMsg(id, msg_id, cache.config.language.livesupportOffmsg_chn, cache.config.menus.goback_mainMenu_chn);
            // return;
        //}
        //else {
            middleware.updateMsg(id, msg_id, cache.config.language.livesupportCommandText_chn, cache.config.menus.goback_mainMenu_chn);
            return;
        //}
    }
    else if(ctx.callbackQuery.data === 'return_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.startCommandText_chn, cache.config.menus.mainMenu_chn);
        return;
    }
    // account category
    else if(ctx.callbackQuery.data === 'account_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.ChooseQuestionsText_chn, cache.config.menus.account_menu_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'accountQ1_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.accountA1_chn, cache.config.menus.goback_account_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'accountQ2_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.accountA2_chn, cache.config.menus.goback_account_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'accountQ3_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.accountA3_chn, cache.config.menus.goback_account_chn)
        return;
    }
    // trade category
    else if(ctx.callbackQuery.data === 'trade_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.ChooseQuestionsText_chn, cache.config.menus.trade_menu_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ0_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA0_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ01_chn') {
      middleware.updateMsg(id, msg_id, cache.config.language.tradeA01_chn, cache.config.menus.goback_trade_chn)
      return;
  }
    else if(ctx.callbackQuery.data === 'tradeQ1_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA1_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ2_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA2_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ3_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA3_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ4_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA4_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ5_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA5_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'tradeQ6_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.tradeA6_chn, cache.config.menus.goback_trade_chn)
        return;
    }
    // referral category
    else if(ctx.callbackQuery.data === 'referral_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.ChooseQuestionsText_chn, cache.config.menus.referral_menu_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'referralQ1_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.referralA1_chn, cache.config.menus.goback_referral_chn)
        return;
    }
    else if(ctx.callbackQuery.data === 'referralQ2_chn') {
        middleware.updateMsg(id, msg_id, cache.config.language.referralA2_chn, cache.config.menus.goback_referral_chn)
        return;
    }
  else {
    // Check whether to end callback session
      if (ctx.callbackQuery.data === 'R') {
        ctx.session.mode = undefined;
        ctx.session.modeData = undefined;
        middleware.reply(ctx, cache.config.language.prvChatEnded);
        return;
      }
      // Get Ticket ID from DB
      const id = ctx.callbackQuery.data.split('---')[0];
      const name = ctx.callbackQuery.data.split('---')[1];
      let category = ctx.callbackQuery.data.split('---')[2];
      const ticketid = ctx.callbackQuery.data.split('---')[3];
      ctx.session.mode = 'private_reply';
      ctx.session.modeData = {
        ticketid: ticketid,
        userid: id,
        name: name,
        category: category,
      };
      middleware.msg(ctx.callbackQuery.from.id, ctx.chat.type !== 'private' ?
        `${cache.config.language.ticket} ` +
        `#T${ticketid.toString().padStart(6, '0')}` +
        `\n\n` +
        cache.config.language.prvChatOpened : cache.config.language.prvChatOpenedCustomer,
        {
          parse_mode: 'html',
          reply_markup: {
            html: '',
            inline_keyboard: [
              [
                {
                  'text': cache.config.language.prvChatEnd,
                  'callback_data': 'R',
                },
              ],
            ],
          },
        });

      // TODO: forward to bot? not possible without triggering start command
      // var t = ('https://t.me/' + bot.options.username + '?start=X');
      ctx.answerCbQuery(cache.config.language.instructionsSent, true,
          /* {
            'url': t,
          } */
        );
  }
};

export {
  callbackQuery,
  initInline,
  replyKeyboard,
  removeKeyboard,
};
