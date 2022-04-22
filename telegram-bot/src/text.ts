import * as db from './db';
import cache from './cache';
import * as staff from './staff';
import * as users from './users';
import * as middleware from './middleware';


const axios = require('axios');

/**
 * Text handler
 * @param {Object} bot
 * @param {Object} ctx
 * @param {Array} keys
 */
function handleText(bot, ctx, keys) {
  if (ctx.session.mode == 'private_reply') {
    staff.privateReply(bot, ctx);
  } else if (cache.config.categories && cache.config.categories.length > 0 &&
    !(JSON.stringify(cache.config.categories)
      .indexOf(ctx.message.text) > -1)) {
    if (!ctx.session.admin && cache.config.categories &&
    !ctx.session.group) {
      middleware.reply(ctx, cache.config.language.services, {
        reply_markup: {
          keyboard: keys,
        },
      });
    } else {
      ticketHandler(bot, ctx);
    }
  } else {
    ticketHandler(bot, ctx);
  }
};

/**
* Decide whether to forward or stop the message.
* @param {bot} bot Bot object.
* @param {context} ctx Bot context.
*/
function ticketHandler(bot, ctx) {
  // get taipei time
  var date = new Date(),
      locale = 'en-US',
      timeZone = 'Asia/Taipei';

  // time in Taipei
  var time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone }).format(date);

  if (ctx.chat.type === 'private') {
    db.getOpen(ctx.message.from.id, ctx.message.categories, function(ticket) {
      if (ticket == undefined) {
        db.add(ctx.message.from.id, 'open', ctx.message.categories);
      }
      users.chat(ctx, bot, ctx.message.chat);
      // api call sending userid, ticketid, message_text
      db.getOpen(ctx.message.from.id, ctx.message.categories, function(test123) {
        console.log(`testing axios post ${test123.id}  ${test123.userid}  ${ctx.message.text}`)
        axios.post(
                        `http://localhost:8000/bot/ticket/${test123.id}`,
                        {
                            ticketId: test123.id,
                            customerId: test123.userid,
                            message: ctx.message.text
                        }
                    ).then(response => {
                        console.log((response.data.status.code));
                    })
                    .catch(err => {
                        //expect(true).toBe(false);
                    });
      })
    });
  } else {
    staff.chat(ctx, bot);
  }
}

export {
  handleText,
  ticketHandler,
};